<?php

namespace Tests\Feature\Helpdesk;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use App\Services\Helpdesk\NotificationService;
use App\Services\Helpdesk\TicketNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketWatcherTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $user;

    protected Project $project;

    protected Ticket $ticket;

    protected TicketStatus $defaultStatus;

    protected TicketPriority $defaultPriority;

    protected TicketType $defaultType;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->admin = User::factory()->admin()->create();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create();

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

        $this->ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $this->defaultStatus->id,
            'priority_id' => $this->defaultPriority->id,
            'type_id' => $this->defaultType->id,
        ]);

        // Add user as a project member
        $this->project->users()->attach($this->user->id, [
            'role' => 'user',
            'receive_notifications' => true,
            'auto_watch_all_tickets' => false,
        ]);

        // Make user the ticket submitter so they can view it
        $this->ticket->update(['submitter_user_id' => $this->user->id]);
    }

    // ========== ADMIN WATCHER CRUD TESTS ==========

    public function test_admin_can_list_ticket_watchers(): void
    {
        $watcher = User::factory()->create();
        $this->ticket->watchers()->attach($watcher->id);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $watcher->id)
            ->assertJsonPath('data.0.name', $watcher->name)
            ->assertJsonPath('data.0.email', $watcher->email);
    }

    public function test_admin_can_add_watcher_to_ticket(): void
    {
        $watcher = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers", [
                'user_id' => $watcher->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.id', $watcher->id);

        $this->assertTrue($this->ticket->watchers()->where('user_id', $watcher->id)->exists());
    }

    public function test_admin_cannot_add_duplicate_watcher(): void
    {
        $watcher = User::factory()->create();
        $this->ticket->watchers()->attach($watcher->id);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers", [
                'user_id' => $watcher->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'User is already watching this ticket');
    }

    public function test_admin_can_remove_watcher_from_ticket(): void
    {
        $watcher = User::factory()->create();
        $this->ticket->watchers()->attach($watcher->id);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers/{$watcher->id}");

        $response->assertStatus(204);
        $this->assertFalse($this->ticket->watchers()->where('user_id', $watcher->id)->exists());
    }

    public function test_admin_cannot_remove_non_watcher(): void
    {
        $nonWatcher = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers/{$nonWatcher->id}");

        $response->assertStatus(404);
    }

    public function test_admin_can_search_available_watchers(): void
    {
        $existingWatcher = User::factory()->create(['name' => 'Already Watching']);
        $availableUser = User::factory()->create(['name' => 'Available Person']);
        $this->ticket->watchers()->attach($existingWatcher->id);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers/available?search=Available");

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($availableUser->id, $ids);
        $this->assertNotContains($existingWatcher->id, $ids);
    }

    public function test_non_admin_cannot_access_admin_watcher_endpoints(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}/watchers");

        $response->assertStatus(403);
    }

    // ========== USER WATCHER TOGGLE TESTS ==========

    public function test_user_can_watch_ticket(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/helpdesk/user/tickets/{$this->ticket->id}/watchers/toggle");

        $response->assertStatus(200)
            ->assertJsonPath('watching', true);

        $this->assertTrue($this->ticket->watchers()->where('user_id', $this->user->id)->exists());
    }

    public function test_user_can_unwatch_ticket(): void
    {
        $this->ticket->watchers()->attach($this->user->id);

        $response = $this->actingAs($this->user)
            ->postJson("/api/helpdesk/user/tickets/{$this->ticket->id}/watchers/toggle");

        $response->assertStatus(200)
            ->assertJsonPath('watching', false);

        $this->assertFalse($this->ticket->watchers()->where('user_id', $this->user->id)->exists());
    }

    public function test_user_can_list_ticket_watchers(): void
    {
        $watcher = User::factory()->create();
        $this->ticket->watchers()->attach($watcher->id);

        $response = $this->actingAs($this->user)
            ->getJson("/api/helpdesk/user/tickets/{$this->ticket->id}/watchers");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_toggle_watch_on_inaccessible_ticket(): void
    {
        $otherUser = User::factory()->create();
        $otherTicket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'submitter_user_id' => User::factory()->create()->id,
        ]);

        // otherUser is not a project member and not the submitter
        $response = $this->actingAs($otherUser)
            ->postJson("/api/helpdesk/user/tickets/{$otherTicket->id}/watchers/toggle");

        $response->assertStatus(403);
    }

    // ========== AUTO-WATCH TESTS ==========

    public function test_auto_watchers_added_on_ticket_creation(): void
    {
        // Set user as auto-watcher
        $this->project->users()->updateExistingPivot($this->user->id, [
            'auto_watch_all_tickets' => true,
        ]);

        $newTicket = Ticket::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $notificationService = app(NotificationService::class);
        $notificationService->addAutoWatchers($newTicket);

        $this->assertTrue($newTicket->watchers()->where('user_id', $this->user->id)->exists());
    }

    public function test_auto_watchers_not_added_when_disabled(): void
    {
        // Ensure auto-watch is off (default)
        $this->project->users()->updateExistingPivot($this->user->id, [
            'auto_watch_all_tickets' => false,
        ]);

        $newTicket = Ticket::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $notificationService = app(NotificationService::class);
        $notificationService->addAutoWatchers($newTicket);

        $this->assertFalse($newTicket->watchers()->where('user_id', $this->user->id)->exists());
    }

    public function test_auto_watchers_idempotent(): void
    {
        $this->project->users()->updateExistingPivot($this->user->id, [
            'auto_watch_all_tickets' => true,
        ]);

        $newTicket = Ticket::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $notificationService = app(NotificationService::class);
        $notificationService->addAutoWatchers($newTicket);
        $notificationService->addAutoWatchers($newTicket); // call again

        $this->assertCount(1, $newTicket->watchers()->where('user_id', $this->user->id)->get());
    }

    // ========== PROJECT USER AUTO-WATCH SETTING TESTS ==========

    public function test_admin_can_enable_auto_watch_for_member(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/users/{$this->user->id}", [
                'auto_watch_all_tickets' => true,
            ]);

        $response->assertStatus(200);

        $pivot = $this->project->users()->where('user_id', $this->user->id)->first()->pivot;
        $this->assertTrue($pivot->auto_watch_all_tickets);
    }

    public function test_admin_can_disable_auto_watch_for_member(): void
    {
        $this->project->users()->updateExistingPivot($this->user->id, [
            'auto_watch_all_tickets' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/users/{$this->user->id}", [
                'auto_watch_all_tickets' => false,
            ]);

        $response->assertStatus(200);

        $pivot = $this->project->users()->where('user_id', $this->user->id)->first()->pivot;
        $this->assertFalse($pivot->auto_watch_all_tickets);
    }

    // ========== NOTIFICATION RECIPIENT TESTS ==========

    public function test_watchers_included_in_notification_recipients(): void
    {
        $watcher = User::factory()->create(['email' => 'watcher@example.com']);
        $this->ticket->watchers()->attach($watcher->id);

        $service = app(TicketNotificationService::class);

        // Use reflection to access the private method
        $method = new \ReflectionMethod($service, 'getNotificationRecipients');
        $recipients = $method->invoke($service, $this->ticket);

        $this->assertContains('watcher@example.com', $recipients);
    }

    public function test_watcher_emails_are_deduplicated_with_assignee(): void
    {
        $assignee = User::factory()->create(['email' => 'assignee@example.com']);
        $this->ticket->update(['assignee_id' => $assignee->id]);
        $this->ticket->watchers()->attach($assignee->id);

        $service = app(TicketNotificationService::class);

        $method = new \ReflectionMethod($service, 'getNotificationRecipients');
        $recipients = $method->invoke($service, $this->ticket);

        $emailCount = collect($recipients)->filter(fn ($e) => $e === 'assignee@example.com')->count();
        $this->assertEquals(1, $emailCount);
    }

    // ========== TICKET SHOW INCLUDES WATCHERS ==========

    public function test_admin_ticket_show_includes_watchers(): void
    {
        $watcher = User::factory()->create();
        $this->ticket->watchers()->attach($watcher->id);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets/{$this->ticket->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['watchers']]);

        $watcherIds = collect($response->json('data.watchers'))->pluck('id')->toArray();
        $this->assertContains($watcher->id, $watcherIds);
    }

    public function test_user_ticket_show_includes_is_watching(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/helpdesk/user/tickets/{$this->ticket->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['is_watching', 'watchers']]);

        $this->assertFalse($response->json('data.is_watching'));

        // Now watch and check again
        $this->ticket->watchers()->attach($this->user->id);

        $response = $this->actingAs($this->user)
            ->getJson("/api/helpdesk/user/tickets/{$this->ticket->id}");

        $this->assertTrue($response->json('data.is_watching'));
    }
}
