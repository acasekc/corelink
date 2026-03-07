<?php

namespace App\Services\Helpdesk;

use App\Jobs\Helpdesk\SendNotificationDigestJob;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\NotificationDigest;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketStatus;
use Illuminate\Support\Str;

class NotificationDigestService
{
    /**
     * Create a new class instance.
     */
    public function __construct() {}

    /**
     * @param  array<string>  $recipients
     */
    public function queueNewTicket(Ticket $ticket, array $recipients): void
    {
        $ticket->loadMissing(['project', 'status', 'priority', 'type']);

        $this->queueEvent($ticket, $recipients, 'new_ticket', [
            'submitter_name' => $ticket->submitter_name,
            'submitter_email' => $ticket->submitter_email,
            'status_title' => $ticket->status?->title,
            'priority_title' => $ticket->priority?->title,
            'content_excerpt' => Str::limit($ticket->content, 280),
        ]);
    }

    /**
     * @param  array<string>  $recipients
     */
    public function queueStatusChanged(Ticket $ticket, array $recipients, TicketStatus $oldStatus, TicketStatus $newStatus): void
    {
        $ticket->loadMissing('project');

        $this->queueEvent($ticket, $recipients, 'status_changed', [
            'old_status_title' => $oldStatus->title,
            'new_status_title' => $newStatus->title,
        ]);
    }

    /**
     * @param  array<string>  $recipients
     */
    public function queueCommentAdded(Ticket $ticket, array $recipients, Comment $comment): void
    {
        $ticket->loadMissing('project');

        $authorName = $comment->user?->name ?? $comment->submitter_name ?? 'Unknown author';

        $this->queueEvent($ticket, $recipients, 'comment_added', [
            'author_name' => $authorName,
            'comment_excerpt' => Str::limit($comment->content, 280),
        ]);
    }

    /**
     * @param  array<string>  $recipients
     * @param  array<string, mixed>  $payload
     */
    private function queueEvent(Ticket $ticket, array $recipients, string $eventType, array $payload): void
    {
        foreach ($this->normalizeRecipients($recipients) as $recipient) {
            $digest = NotificationDigest::query()
                ->where('recipient_email', $recipient)
                ->whereNull('sent_at')
                ->orderBy('dispatch_after')
                ->first();

            $shouldDispatch = false;

            if (! $digest) {
                $digest = NotificationDigest::create([
                    'recipient_email' => $recipient,
                    'dispatch_after' => now()->addMinutes($this->digestDelayMinutes()),
                ]);

                $shouldDispatch = true;
            }

            $digest->events()->create([
                'ticket_id' => $ticket->id,
                'event_type' => $eventType,
                'payload' => array_merge($payload, [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'ticket_title' => $ticket->title,
                    'project_name' => $ticket->project?->name,
                ]),
            ]);

            if ($shouldDispatch) {
                SendNotificationDigestJob::dispatch($digest->id)
                    ->delay($digest->dispatch_after);
            }
        }
    }

    /**
     * @param  array<string>  $recipients
     * @return array<int, string>
     */
    private function normalizeRecipients(array $recipients): array
    {
        return array_values(array_unique(array_filter(array_map(function (string $recipient): ?string {
            $normalizedRecipient = strtolower(trim($recipient));

            if ($normalizedRecipient === '' || ! filter_var($normalizedRecipient, FILTER_VALIDATE_EMAIL)) {
                return null;
            }

            return $normalizedRecipient;
        }, $recipients))));
    }

    private function digestDelayMinutes(): int
    {
        return max(0, (int) config('helpdesk.notification_digest_delay_minutes', 10));
    }
}
