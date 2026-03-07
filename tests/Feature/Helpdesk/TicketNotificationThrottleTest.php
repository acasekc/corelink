<?php

namespace Tests\Feature\Helpdesk;

use App\Jobs\Helpdesk\SendNotificationDigestJob;
use App\Mail\Helpdesk\TicketActivityDigest;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\NotificationDigest;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Services\Helpdesk\TicketNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
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
        Queue::fake();
    }

    public function test_status_change_creates_digest_job_and_event(): void
    {
        config(['helpdesk.notification_digest_delay_minutes' => 10]);

        $service = app(TicketNotificationService::class);

        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        Queue::assertPushed(SendNotificationDigestJob::class, 1);

        $digest = NotificationDigest::query()
            ->with('events')
            ->where('recipient_email', 'submitter@example.com')
            ->first();

        $this->assertNotNull($digest);
        $this->assertSame(1, $digest->events->count());
        $this->assertSame('status_changed', $digest->events->first()->event_type);
        $this->assertSame('Closed', $digest->events->first()->payload['new_status_title']);
    }

    public function test_status_change_and_comment_share_a_single_digest(): void
    {
        $service = app(TicketNotificationService::class);

        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        $comment = Comment::create([
            'ticket_id' => $this->ticket->id,
            'content' => 'Test comment',
            'is_internal' => false,
            'submitter_name' => 'Admin User',
            'submitter_email' => 'admin@example.com',
        ]);

        $service->notifyCommentAdded($this->ticket, $comment);

        Queue::assertPushed(SendNotificationDigestJob::class, 1);

        $digest = NotificationDigest::query()
            ->with('events')
            ->where('recipient_email', 'submitter@example.com')
            ->firstOrFail();

        $this->assertSame(2, $digest->events->count());
        $this->assertSame(['status_changed', 'comment_added'], $digest->events->pluck('event_type')->all());
    }

    public function test_multiple_tickets_for_same_recipient_share_one_digest(): void
    {
        $service = app(TicketNotificationService::class);

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

        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);
        $service->notifyStatusChanged($ticket2, $this->openStatus, $this->closedStatus);

        Queue::assertPushed(SendNotificationDigestJob::class, 1);

        $digest = NotificationDigest::query()
            ->with('events')
            ->where('recipient_email', 'submitter@example.com')
            ->firstOrFail();

        $this->assertSame(2, $digest->events->count());
        $this->assertEqualsCanonicalizing([$this->ticket->id, $ticket2->id], $digest->events->pluck('ticket_id')->all());
    }

    public function test_internal_comment_does_not_create_a_digest_event(): void
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

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('helpdesk_notification_digests', 0);
    }

    public function test_digest_job_sends_combined_email_and_marks_digest_sent(): void
    {
        config(['helpdesk.notification_digest_delay_minutes' => 0]);

        $service = app(TicketNotificationService::class);

        $service->notifyStatusChanged($this->ticket, $this->openStatus, $this->closedStatus);

        $comment = Comment::create([
            'ticket_id' => $this->ticket->id,
            'content' => 'Visible comment',
            'is_internal' => false,
            'submitter_name' => 'Admin User',
            'submitter_email' => 'admin@example.com',
        ]);

        $service->notifyCommentAdded($this->ticket, $comment);

        $digest = NotificationDigest::query()
            ->where('recipient_email', 'submitter@example.com')
            ->firstOrFail();

        $digest->update(['dispatch_after' => now()->subMinute()]);

        (new SendNotificationDigestJob($digest->id))->handle();

        Mail::assertSent(TicketActivityDigest::class, function (TicketActivityDigest $mail): bool {
            return $mail->hasTo('submitter@example.com')
                && $mail->totalEvents === 2
                && $mail->ticketCount === 1;
        });

        $this->assertNotNull($digest->fresh()->sent_at);
    }
}
