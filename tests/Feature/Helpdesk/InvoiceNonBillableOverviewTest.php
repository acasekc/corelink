<?php

namespace Tests\Feature\Helpdesk;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\Helpdesk\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceNonBillableOverviewTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    private TicketStatus $openStatus;

    private TicketStatus $closedStatus;

    private TicketPriority $priority;

    private TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->admin = User::factory()->create(['is_admin' => true]);

        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
        ]);

        $this->openStatus = TicketStatus::where('slug', 'open')->firstOrFail();
        $this->closedStatus = TicketStatus::where('slug', 'closed')->firstOrFail();
        $this->priority = TicketPriority::where('slug', 'medium')->firstOrFail();
        $this->type = TicketType::where('slug', 'question')->firstOrFail();
    }

    public function test_returns_non_billable_uninvoiced_entries(): void
    {
        $ticket = $this->makeTicket();

        $billable = TimeEntry::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->admin->id,
            'minutes' => 60,
            'date_worked' => now()->toDateString(),
            'is_billable' => true,
        ]);

        $nonBillable = TimeEntry::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->admin->id,
            'minutes' => 30,
            'date_worked' => now()->toDateString(),
            'is_billable' => false,
            'description' => 'Internal sync',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/non-billable-overview");

        $response->assertOk()
            ->assertJsonCount(1, 'non_billable_entries')
            ->assertJsonPath('non_billable_entries.0.id', $nonBillable->id)
            ->assertJsonPath('non_billable_entries.0.description', 'Internal sync')
            ->assertJsonPath('non_billable_entries.0.ticket.id', $ticket->id);
    }

    public function test_excludes_invoiced_non_billable_entries(): void
    {
        // Even though is_billable=false, if the entry has an invoice_line_item_id
        // it's been processed already and shouldn't show up.
        $ticket = $this->makeTicket();

        TimeEntry::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->admin->id,
            'minutes' => 30,
            'date_worked' => now()->toDateString(),
            'is_billable' => false,
            'invoice_line_item_id' => null,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/non-billable-overview");

        $response->assertOk()->assertJsonCount(1, 'non_billable_entries');
    }

    public function test_returns_open_tickets_with_no_billable_time(): void
    {
        $withBillable = $this->makeTicket(['title' => 'Has billable time']);
        TimeEntry::create([
            'ticket_id' => $withBillable->id,
            'user_id' => $this->admin->id,
            'minutes' => 60,
            'date_worked' => now()->toDateString(),
            'is_billable' => true,
        ]);

        $withOnlyNonBillable = $this->makeTicket(['title' => 'Only non-billable']);
        TimeEntry::create([
            'ticket_id' => $withOnlyNonBillable->id,
            'user_id' => $this->admin->id,
            'minutes' => 30,
            'date_worked' => now()->toDateString(),
            'is_billable' => false,
        ]);

        $withNoTime = $this->makeTicket(['title' => 'No time logged']);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/non-billable-overview");

        $response->assertOk();

        $titles = collect($response->json('untimed_tickets'))->pluck('title')->all();
        $this->assertContains('Only non-billable', $titles);
        $this->assertContains('No time logged', $titles);
        $this->assertNotContains('Has billable time', $titles);
    }

    public function test_excludes_closed_tickets_from_untimed_list(): void
    {
        $closed = $this->makeTicket([
            'title' => 'Closed ticket',
            'status_id' => $this->closedStatus->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/non-billable-overview");

        $response->assertOk();

        $titles = collect($response->json('untimed_tickets'))->pluck('title')->all();
        $this->assertNotContains('Closed ticket', $titles);
    }

    public function test_scopes_results_to_the_requested_project(): void
    {
        $otherProject = Project::factory()->create([
            'slug' => 'other-project',
            'ticket_prefix' => 'OTH',
        ]);

        $foreignTicket = Ticket::create([
            'project_id' => $otherProject->id,
            'number' => 1,
            'title' => 'Foreign ticket',
            'content' => '',
            'status_id' => $this->openStatus->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_name' => 'X',
            'submitter_email' => 'x@example.com',
        ]);

        TimeEntry::create([
            'ticket_id' => $foreignTicket->id,
            'user_id' => $this->admin->id,
            'minutes' => 30,
            'date_worked' => now()->toDateString(),
            'is_billable' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/non-billable-overview");

        $response->assertOk()
            ->assertJsonCount(0, 'non_billable_entries')
            ->assertJsonCount(0, 'untimed_tickets');
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function makeTicket(array $overrides = []): Ticket
    {
        static $counter = 0;
        $counter++;

        return Ticket::create([
            'project_id' => $this->project->id,
            'number' => $counter,
            'title' => 'Ticket '.$counter,
            'content' => '',
            'status_id' => $this->openStatus->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_name' => 'Test',
            'submitter_email' => 'test@example.com',
            ...$overrides,
        ]);
    }
}
