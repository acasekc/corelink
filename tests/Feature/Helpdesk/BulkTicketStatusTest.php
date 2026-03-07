<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ProjectRole;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BulkTicketStatusTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $owner;

    protected User $manager;

    protected Project $project;

    protected TicketStatus $openStatus;

    protected TicketStatus $closedStatus;

    protected TicketPriority $priority;

    protected TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->admin = User::factory()->admin()->create();
        $this->owner = User::factory()->create();
        $this->manager = User::factory()->create();
        $this->project = Project::factory()->create();

        $this->openStatus = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
        ]);

        $this->closedStatus = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'closed',
            'title' => 'Closed',
        ]);

        $this->priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'medium',
            'title' => 'Medium',
        ]);

        $this->type = TicketType::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'question',
            'title' => 'Question',
        ]);

        $this->project->users()->attach($this->owner->id, [
            'role' => ProjectRole::Owner->value,
            'receive_notifications' => true,
            'auto_watch_all_tickets' => false,
        ]);

        $this->project->users()->attach($this->manager->id, [
            'role' => ProjectRole::Manager->value,
            'receive_notifications' => true,
            'auto_watch_all_tickets' => false,
        ]);
    }

    public function test_admin_can_bulk_change_ticket_status_for_same_project(): void
    {
        [$ticketOne, $ticketTwo] = $this->createProjectTickets($this->project, 2);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets/bulk-status', [
                'ids' => [$ticketOne->id, $ticketTwo->id],
                'status_id' => $this->closedStatus->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('count', 2)
            ->assertJsonPath('status.id', $this->closedStatus->id);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticketOne->id,
            'status_id' => $this->closedStatus->id,
        ]);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticketTwo->id,
            'status_id' => $this->closedStatus->id,
        ]);
    }

    public function test_admin_bulk_change_status_requires_same_project(): void
    {
        [$ticketOne] = $this->createProjectTickets($this->project, 1);
        $otherProject = Project::factory()->create();
        $otherStatus = TicketStatus::factory()->create([
            'project_id' => $otherProject->id,
            'slug' => 'open',
            'title' => 'Open',
        ]);
        $otherPriority = TicketPriority::factory()->create([
            'project_id' => $otherProject->id,
        ]);
        $otherType = TicketType::factory()->create([
            'project_id' => $otherProject->id,
        ]);
        $ticketTwo = Ticket::factory()->create([
            'project_id' => $otherProject->id,
            'status_id' => $otherStatus->id,
            'priority_id' => $otherPriority->id,
            'type_id' => $otherType->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets/bulk-status', [
                'ids' => [$ticketOne->id, $ticketTwo->id],
                'status_id' => $this->closedStatus->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Bulk status updates require all selected tickets to belong to the same project');
    }

    public function test_project_owner_can_bulk_change_ticket_status_from_user_api(): void
    {
        [$ticketOne, $ticketTwo] = $this->createProjectTickets($this->project, 2, $this->owner->id);

        $response = $this->actingAs($this->owner)
            ->postJson('/api/helpdesk/user/tickets/bulk-status', [
                'ids' => [$ticketOne->id, $ticketTwo->id],
                'status_id' => $this->closedStatus->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('count', 2)
            ->assertJsonPath('status.slug', 'closed');

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticketOne->id,
            'status_id' => $this->closedStatus->id,
        ]);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticketTwo->id,
            'status_id' => $this->closedStatus->id,
        ]);
    }

    public function test_manager_cannot_bulk_change_ticket_status_from_user_api(): void
    {
        [$ticketOne, $ticketTwo] = $this->createProjectTickets($this->project, 2, $this->manager->id);

        $response = $this->actingAs($this->manager)
            ->postJson('/api/helpdesk/user/tickets/bulk-status', [
                'ids' => [$ticketOne->id, $ticketTwo->id],
                'status_id' => $this->closedStatus->id,
            ]);

        $response->assertForbidden()
            ->assertJsonPath('message', 'Only project owners can bulk change ticket statuses');
    }

    public function test_owner_cannot_bulk_change_to_status_from_different_project(): void
    {
        [$ticketOne, $ticketTwo] = $this->createProjectTickets($this->project, 2, $this->owner->id);

        $otherProject = Project::factory()->create();
        $otherStatus = TicketStatus::factory()->create([
            'project_id' => $otherProject->id,
            'slug' => 'different',
            'title' => 'Different',
        ]);

        $response = $this->actingAs($this->owner)
            ->postJson('/api/helpdesk/user/tickets/bulk-status', [
                'ids' => [$ticketOne->id, $ticketTwo->id],
                'status_id' => $otherStatus->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The selected status is not available for these tickets');
    }

    /**
     * @return array<int, Ticket>
     */
    private function createProjectTickets(Project $project, int $count, ?int $submitterUserId = null): array
    {
        return Ticket::factory()->count($count)->create([
            'project_id' => $project->id,
            'status_id' => $this->openStatus->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_user_id' => $submitterUserId,
            'submitter_email' => $submitterUserId ? User::find($submitterUserId)?->email : 'submitter@example.com',
        ])->all();
    }
}
