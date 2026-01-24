<?php

namespace Tests\Feature\Helpdesk;

use App\Mail\Helpdesk\TicketCommentAdded;
use App\Mail\Helpdesk\TicketStatusChanged;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Services\Helpdesk\TicketNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketNotificationThrottleTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private Ticket $ticket;

    private TicketStatus $openStatus;

    private TicketStatus $closedStatus;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
        ]);

        $this->openStatus = TicketStatus::where('slug', 'open')->first();
        $this->closedStatus = TicketStatus::where('slug', 'closed')->first();
        $priority = TicketPriority::where('slug', 'medium')->first();
        $type = TicketType::where('slug', 'question')->first();

        $this->ticket = Ticket::create([
            'project_id' => $this->project->id,
            'number' => 1,
            'title' => 'Test Ticket',
            'content' => 'Test content',
            'status_id' => $this->openStatus->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
            'submitter_name' => 'Test User',
            'submitter_email' => 'submitter@example.com',
        ]);

        Mail::fake();
    }

    public function test_first_notification_is_sent(): void
    {
        $service = app(TicketNotificationService::class);

        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        Mail::assertQueued(TicketStatusChanged::class);
    }

    public function test_second_notification_within_throttle_window_is_blocked(): void
    {
        $service = app(TicketNotificationService::class);

        // First notification should go through
        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        // Second notification within 5 minutes should be blocked
        $service->notifyStatusChanged($this->ticket, $this->closedStatus, $this->openStatus);

        // Only one email should be queued
        Mail::assertQueued(TicketStatusChanged::class, 1);
    }

    public function test_notification_after_throttle_expires_is_sent(): void
    {
        $service = app(TicketNotificationService::class);

        // First notification
        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        // Clear the cache to simulate time passing
        Cache::flush();

        // Second notification should now go through
        $service->notifyStatusChanged($this->ticket, $this->closedStatus, $this->openStatus);

        // Both emails should be queued
        Mail::assertQueued(TicketStatusChanged::class, 2);
    }

    public function test_different_tickets_can_send_notifications_simultaneously(): void
    {
        $service = app(TicketNotificationService::class);

        // Create another ticket
        $ticket2 = Ticket::create([
            'project_id' => $this->project->id,
            'number' => 2,
            'title' => 'Another Ticket',
            'content' => 'More content',
            'status_id' => $this->openStatus->id,
            'priority_id' => $this->ticket->priority_id,
            'type_id' => $this->ticket->type_id,
            'submitter_name' => 'Test User',
            'submitter_email' => 'submitter@example.com',
        ]);

        // Notifications for both tickets should go through
        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);
        $service->notifyStatusChanged($ticket2, $this->openStatus, $this->closedStatus);

        Mail::assertQueued(TicketStatusChanged::class, 2);
    }

    public function test_comment_notification_is_throttled_after_status_change(): void
    {
        $service = app(TicketNotificationService::class);

        // Send status change notification first
        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        // Create a comment
        $comment = Comment::create([
            'ticket_id' => $this->ticket->id,
            'content' => 'Test comment',
            'is_internal' => false,
            'submitter_name' => 'Admin User',
            'submitter_email' => 'admin@example.com',
        ]);

        // Comment notification should be blocked (same ticket, same recipient within window)
        $service->notifyCommentAdded($this->ticket, $comment);

        // Only the status change email should be queued
        Mail::assertQueued(TicketStatusChanged::class, 1);
        Mail::assertNotQueued(TicketCommentAdded::class);
    }

    public function test_internal_comment_does_not_send_notification(): void
    {
        $service = app(TicketNotificationService::class);

        $comment = Comment::create([
            'ticket_id' => $this->ticket->id,
            'content' => 'Internal note',
            'is_internal' => true,
            'submitter_name' => 'Admin User',
            'submitter_email' => 'admin@example.com',
        ]);

        $service->notifyCommentAdded($this->ticket, $comment);

        Mail::assertNotQueued(TicketCommentAdded::class);
    }
}
