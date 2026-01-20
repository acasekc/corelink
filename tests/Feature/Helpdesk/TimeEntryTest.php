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

class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    private Ticket $ticket;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
        ]);

        // Get the seeded status, priority and type
        $status = TicketStatus::where('slug', 'open')->first();
        $priority = TicketPriority::where('slug', 'medium')->first();
        $type = TicketType::where('slug', 'question')->first();

        $this->ticket = Ticket::create([
            'project_id' => $this->project->id,
            'number' => 1,
            'title' => 'Test Ticket',
            'content' => 'Test content',
            'status_id' => $status->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
            'submitter_name' => 'Test User',
            'submitter_email' => 'test@example.com',
        ]);
    }

    public function test_time_entry_can_parse_time_string(): void
    {
        $this->assertEquals(60, TimeEntry::parseTimeString('1h'));
        $this->assertEquals(45, TimeEntry::parseTimeString('45m'));
        $this->assertEquals(105, TimeEntry::parseTimeString('1h 45m'));
        $this->assertEquals(480, TimeEntry::parseTimeString('1d')); // 8 hours
        $this->assertEquals(2400, TimeEntry::parseTimeString('1w')); // 5 days * 8 hours
        // 1w = 2400, 1d = 480, 1h = 60, 45m = 45 => 2400 + 480 + 60 + 45 = 2985
        $this->assertEquals(2985, TimeEntry::parseTimeString('1w 1d 1h 45m'));
        $this->assertEquals(30, TimeEntry::parseTimeString('30'));
    }

    public function test_time_entry_can_format_minutes(): void
    {
        $this->assertEquals('1h', TimeEntry::formatMinutes(60));
        $this->assertEquals('45m', TimeEntry::formatMinutes(45));
        $this->assertEquals('1h 45m', TimeEntry::formatMinutes(105));
        $this->assertEquals('1d', TimeEntry::formatMinutes(480));
        $this->assertEquals('1w', TimeEntry::formatMinutes(2400));
        // 2985 = 2400 (1w) + 480 (1d) + 60 (1h) + 45m = 1w 1d 1h 45m
        $this->assertEquals('1w 1d 1h 45m', TimeEntry::formatMinutes(2985));
        $this->assertEquals('0m', TimeEntry::formatMinutes(0));
    }

    public function test_admin_can_add_time_entry(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/time-entries", [
                'time_spent' => '2h 30m',
                'description' => 'Worked on debugging',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.minutes', 150)
            ->assertJsonPath('data.formatted_time', '2h 30m')
            ->assertJsonPath('data.description', 'Worked on debugging');

        $this->assertDatabaseHas('helpdesk_time_entries', [
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->admin->id,
            'minutes' => 150,
        ]);
    }

    public function test_admin_can_list_time_entries(): void
    {
        TimeEntry::factory()->count(3)->create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/time-entries");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'minutes', 'formatted_time', 'description', 'date_worked', 'user', 'created_at'],
                ],
                'summary' => ['total_minutes', 'total_formatted'],
            ]);
    }

    public function test_admin_can_update_time_entry(): void
    {
        $timeEntry = TimeEntry::factory()->create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->admin->id,
            'minutes' => 60,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/time-entries/{$timeEntry->id}", [
                'time_spent' => '3h',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.minutes', 180)
            ->assertJsonPath('data.description', 'Updated description');
    }

    public function test_admin_can_delete_time_entry(): void
    {
        $timeEntry = TimeEntry::factory()->create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/time-entries/{$timeEntry->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('helpdesk_time_entries', ['id' => $timeEntry->id]);
    }

    public function test_ticket_calculates_total_time_spent(): void
    {
        TimeEntry::factory()->create([
            'ticket_id' => $this->ticket->id,
            'minutes' => 60,
        ]);
        TimeEntry::factory()->create([
            'ticket_id' => $this->ticket->id,
            'minutes' => 90,
        ]);

        $this->ticket->refresh();
        $this->assertEquals(150, $this->ticket->total_time_spent);
        $this->assertEquals('2h 30m', $this->ticket->formatted_time_spent);
    }

    public function test_ticket_can_store_time_estimate(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', [
                'project_id' => $this->project->id,
                'title' => 'New Ticket with Estimate',
                'content' => 'Test content',
                'time_estimate' => '4h',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.time_tracking.estimate', '4h')
            ->assertJsonPath('data.time_tracking.estimate_minutes', 240);
    }

    public function test_ticket_can_update_time_estimate(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$this->ticket->id}", [
                'time_estimate' => '2d',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.time_tracking.estimate', '2d')
            ->assertJsonPath('data.time_tracking.estimate_minutes', 960);
    }

    public function test_ticket_show_includes_time_tracking(): void
    {
        $this->ticket->update(['time_estimate_minutes' => 480]);
        TimeEntry::factory()->create([
            'ticket_id' => $this->ticket->id,
            'minutes' => 120,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.time_tracking.estimate', '1d')
            ->assertJsonPath('data.time_tracking.estimate_minutes', 480)
            ->assertJsonPath('data.time_tracking.time_spent', '2h')
            ->assertJsonPath('data.time_tracking.time_spent_minutes', 120)
            ->assertJsonStructure([
                'data' => [
                    'time_entries' => [
                        '*' => ['id', 'minutes', 'formatted_time', 'description', 'user'],
                    ],
                ],
            ]);
    }

    public function test_invalid_time_format_returns_error(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/time-entries", [
                'time_spent' => 'invalid',
            ]);

        $response->assertStatus(422);
    }
}
