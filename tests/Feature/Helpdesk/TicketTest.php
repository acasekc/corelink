<?php

namespace Tests\Feature\Helpdesk;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected Project $project;

    protected TicketStatus $defaultStatus;

    protected TicketPriority $defaultPriority;

    protected TicketType $defaultType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->project = Project::factory()->create();

        // Create project-specific reference data
        $this->defaultStatus = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
        ]);

        $this->defaultPriority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'medium',
            'title' => 'Medium',
        ]);

        $this->defaultType = TicketType::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'question',
            'title' => 'Question',
        ]);
    }

    // ========== INDEX (LIST) TESTS ==========

    public function test_admin_can_list_all_tickets(): void
    {
        Ticket::factory(3)->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/tickets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'number',
                        'title',
                        'project',
                        'status',
                        'priority',
                        'type',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_non_admin_cannot_list_tickets(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/helpdesk/admin/tickets');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_tickets(): void
    {
        $response = $this->getJson('/api/helpdesk/admin/tickets');

        $response->assertStatus(401);
    }

    public function test_can_filter_tickets_by_project(): void
    {
        $project2 = Project::factory()->create();
        Ticket::factory(2)->create(['project_id' => $this->project->id]);
        Ticket::factory(1)->create(['project_id' => $project2->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets?project_id={$this->project->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_filter_tickets_by_status(): void
    {
        $status2 = TicketStatus::factory()->create(['project_id' => $this->project->id]);

        Ticket::factory(2)->create([
            'project_id' => $this->project->id,
            'status_id' => $this->defaultStatus->id,
        ]);
        Ticket::factory(1)->create([
            'project_id' => $this->project->id,
            'status_id' => $status2->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets?status_id={$this->defaultStatus->id}");
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_filter_tickets_by_assignee(): void
    {
        $user2 = User::factory()->create();

        Ticket::factory(2)->create([
            'project_id' => $this->project->id,
            'assignee_id' => $this->admin->id,
        ]);
        Ticket::factory(1)->create([
            'project_id' => $this->project->id,
            'assignee_id' => $user2->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets?assignee_id={$this->admin->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_search_tickets(): void
    {
        Ticket::factory()->create([
            'project_id' => $this->project->id,
            'title' => 'Database Query Issue',
        ]);
        Ticket::factory()->create([
            'project_id' => $this->project->id,
            'title' => 'API Response Error',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/tickets?search=Database');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Database Query Issue');
    }

    // ========== CREATE TESTS ==========

    public function test_admin_can_create_ticket(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Test Ticket',
            'content' => 'This is a test ticket',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'number',
                    'title',
                    'content',
                    'project',
                    'status',
                    'priority',
                    'type',
                    'assignee',
                    'submitter',
                ],
            ])
            ->assertJsonPath('data.title', 'Test Ticket')
            ->assertJsonPath('data.content', 'This is a test ticket');

        $this->assertDatabaseHas('helpdesk_tickets', [
            'title' => 'Test Ticket',
            'project_id' => $this->project->id,
        ]);
    }

    public function test_create_ticket_applies_project_defaults(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Default Test',
            'content' => 'Testing defaults',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status.id', $this->defaultStatus->id)
            ->assertJsonPath('data.priority.id', $this->defaultPriority->id)
            ->assertJsonPath('data.type.id', $this->defaultType->id);
    }

    public function test_create_ticket_with_explicit_status_priority_type(): void
    {
        $status = TicketStatus::factory()->create(['project_id' => $this->project->id]);
        $priority = TicketPriority::factory()->create(['project_id' => $this->project->id]);
        $type = TicketType::factory()->create(['project_id' => $this->project->id]);

        $data = [
            'project_id' => $this->project->id,
            'title' => 'Custom Status',
            'content' => 'With explicit values',
            'status_id' => $status->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status.id', $status->id)
            ->assertJsonPath('data.priority.id', $priority->id)
            ->assertJsonPath('data.type.id', $type->id);
    }

    public function test_create_ticket_with_assignee(): void
    {
        $assignee = User::factory()->create();

        $data = [
            'project_id' => $this->project->id,
            'title' => 'Assigned Ticket',
            'content' => 'This ticket is assigned',
            'assignee_id' => $assignee->id,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.assignee.id', $assignee->id);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'title' => 'Assigned Ticket',
            'assignee_id' => $assignee->id,
        ]);
    }

    public function test_create_ticket_with_custom_submitter_info(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Custom Submitter',
            'content' => 'Test content',
            'submitter_name' => 'John Doe',
            'submitter_email' => 'john@example.com',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.submitter.name', 'John Doe')
            ->assertJsonPath('data.submitter.email', 'john@example.com');

        $this->assertDatabaseHas('helpdesk_tickets', [
            'submitter_name' => 'John Doe',
            'submitter_email' => 'john@example.com',
        ]);
    }

    public function test_create_ticket_with_submitter_user(): void
    {
        $submitterUser = User::factory()->create();

        $data = [
            'project_id' => $this->project->id,
            'title' => 'User Submitter',
            'content' => 'Test content',
            'submitter_user_id' => $submitterUser->id,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.submitter.user_id', $submitterUser->id)
            ->assertJsonPath('data.submitter.name', $submitterUser->name);
    }

    public function test_create_ticket_with_time_estimate(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Time Estimate',
            'content' => 'With time estimate',
            'time_estimate' => '2h 30m',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.time_tracking.estimate_minutes', 150);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'title' => 'Time Estimate',
            'time_estimate_minutes' => 150,
        ]);
    }

    public function test_create_ticket_requires_project(): void
    {
        $data = [
            'title' => 'No Project',
            'content' => 'Missing project',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['project_id']);
    }

    public function test_create_ticket_requires_title(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'content' => 'No title',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_create_ticket_requires_content(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'No Content',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_non_admin_cannot_create_ticket(): void
    {
        $user = User::factory()->create();

        $data = [
            'project_id' => $this->project->id,
            'title' => 'Test',
            'content' => 'Test',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(403);
    }

    // ========== SHOW (GET SINGLE) TESTS ==========

    public function test_admin_can_view_ticket(): void
    {
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$ticket->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'number',
                    'title',
                    'content',
                    'project',
                    'status',
                    'priority',
                    'type',
                    'assignee',
                    'submitter',
                    'labels',
                    'time_tracking',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('data.id', $ticket->id);
    }

    public function test_non_admin_cannot_view_ticket(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/helpdesk/admin/tickets/{$ticket->id}");

        $response->assertStatus(403);
    }

    public function test_view_nonexistent_ticket_returns_404(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/tickets/99999');

        $response->assertStatus(404);
    }

    // ========== UPDATE TESTS ==========

    public function test_admin_can_update_ticket(): void
    {
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $data = [
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.content', 'Updated content');

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticket->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_update_ticket_status_logs_activity(): void
    {
        $ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $this->defaultStatus->id,
        ]);

        $newStatus = TicketStatus::factory()->create(['project_id' => $this->project->id]);

        $data = ['status_id' => $newStatus->id];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status.id', $newStatus->id);

        $this->assertDatabaseHas('helpdesk_ticket_activities', [
            'ticket_id' => $ticket->id,
            'action' => 'status_changed',
        ]);
    }

    public function test_update_ticket_assignee_logs_activity(): void
    {
        $ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'assignee_id' => null,
        ]);

        $assignee = User::factory()->create();

        $data = ['assignee_id' => $assignee->id];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.assignee.id', $assignee->id);

        $this->assertDatabaseHas('helpdesk_ticket_activities', [
            'ticket_id' => $ticket->id,
            'action' => 'assigned',
        ]);
    }

    public function test_update_ticket_priority(): void
    {
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);
        $newPriority = TicketPriority::factory()->create(['project_id' => $this->project->id]);

        $data = ['priority_id' => $newPriority->id];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.priority.id', $newPriority->id);
    }

    public function test_update_ticket_with_time_estimate(): void
    {
        $ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'time_estimate_minutes' => null,
        ]);

        $data = ['time_estimate' => '3h'];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.time_tracking.estimate_minutes', 180);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $ticket->id,
            'time_estimate_minutes' => 180,
        ]);
    }

    public function test_non_admin_cannot_update_ticket(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $data = ['title' => 'Updated'];

        $response = $this->actingAs($user)
            ->patchJson("/api/helpdesk/admin/tickets/{$ticket->id}", $data);

        $response->assertStatus(403);
    }

    // ========== DELETE TESTS ==========

    public function test_admin_can_delete_ticket(): void
    {
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/helpdesk/admin/tickets/{$ticket->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('helpdesk_tickets', ['id' => $ticket->id]);
    }

    public function test_non_admin_cannot_delete_ticket(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/helpdesk/admin/tickets/{$ticket->id}");

        $response->assertStatus(403);
    }

    // ========== PAGINATION TESTS ==========

    public function test_tickets_pagination(): void
    {
        Ticket::factory(35)->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/tickets?per_page=20');

        $response->assertStatus(200)
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.total', 35);
    }

    // ========== SPECIAL CASE TESTS ==========

    public function test_ticket_number_is_unique_per_project(): void
    {
        $ticket1 = Ticket::factory()->create(['project_id' => $this->project->id]);
        $ticket2 = Ticket::factory()->create(['project_id' => $this->project->id]);

        $this->assertNotEquals($ticket1->number, $ticket2->number);
    }

    public function test_ticket_uses_current_user_as_default_submitter(): void
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Default Submitter',
            'content' => 'Test content',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/helpdesk/admin/tickets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.submitter.name', $this->admin->name)
            ->assertJsonPath('data.submitter.email', $this->admin->email);
    }
}
