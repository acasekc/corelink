<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ProjectRole;
use App\Jobs\Helpdesk\SendNotificationDigestJob;
use App\Mail\Helpdesk\TicketActivityDigest;
use App\Models\Helpdesk\NotificationDigest;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use App\Services\Helpdesk\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TicketNotificationDigestTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private User $owner;

    private TicketStatus $status;

    private TicketPriority $priority;

    private TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Queue::fake();

        $this->project = Project::factory()->create([
            'name' => 'Digest Project',
            'slug' => 'digest-project',
            'ticket_prefix' => 'DGST',
        ]);

        $this->owner = User::factory()->create(['email' => 'owner@example.com']);

        $this->project->users()->attach($this->owner->id, [
            'role' => ProjectRole::Owner->value,
            'receive_notifications' => true,
            'auto_watch_all_tickets' => false,
        ]);

        $this->status = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
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
    }

    public function test_new_ticket_notifications_are_batched_per_recipient(): void
    {
        $service = app(NotificationService::class);

        $firstTicket = $this->makeTicket(1, 'First ticket');
        $secondTicket = $this->makeTicket(2, 'Second ticket');

        $service->notifyNewTicket($firstTicket);
        $service->notifyNewTicket($secondTicket);

        Queue::assertPushed(SendNotificationDigestJob::class, 1);

        $digest = NotificationDigest::query()
            ->with('events')
            ->where('recipient_email', 'owner@example.com')
            ->firstOrFail();

        $this->assertSame(2, $digest->events->count());
        $this->assertEqualsCanonicalizing([$firstTicket->id, $secondTicket->id], $digest->events->pluck('ticket_id')->all());
        $this->assertTrue($digest->events->every(fn ($event) => $event->event_type === 'new_ticket'));
    }

    public function test_digest_delay_uses_global_config_value(): void
    {
        config(['helpdesk.notification_digest_delay_minutes' => 15]);

        $service = app(NotificationService::class);
        $ticket = $this->makeTicket(3, 'Config test ticket');

        $service->notifyNewTicket($ticket);

        $digest = NotificationDigest::query()
            ->where('recipient_email', 'owner@example.com')
            ->firstOrFail();

        $this->assertTrue(
            $digest->dispatch_after->between(now()->addMinutes(14), now()->addMinutes(15)->addSeconds(5))
        );
    }

    public function test_digest_job_sends_staff_digest_email(): void
    {
        config(['helpdesk.notification_digest_delay_minutes' => 0]);

        $service = app(NotificationService::class);
        $ticket = $this->makeTicket(4, 'Staff digest ticket');

        $service->notifyNewTicket($ticket);

        $digest = NotificationDigest::query()
            ->where('recipient_email', 'owner@example.com')
            ->firstOrFail();

        $digest->update(['dispatch_after' => now()->subMinute()]);

        (new SendNotificationDigestJob($digest->id))->handle();

        Mail::assertSent(TicketActivityDigest::class, function (TicketActivityDigest $mail): bool {
            return $mail->hasTo('owner@example.com')
                && $mail->totalEvents === 1
                && $mail->ticketCount === 1;
        });

        $this->assertNotNull($digest->fresh()->sent_at);
    }

    private function makeTicket(int $number, string $title): Ticket
    {
        return Ticket::create([
            'project_id' => $this->project->id,
            'number' => $number,
            'title' => $title,
            'content' => 'Digest content',
            'status_id' => $this->status->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_name' => 'Digest User',
            'submitter_email' => 'submitter@example.com',
        ]);
    }
}
