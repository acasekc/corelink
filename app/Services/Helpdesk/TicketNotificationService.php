<?php

namespace App\Services\Helpdesk;

use App\Mail\Helpdesk\TicketCommentAdded;
use App\Mail\Helpdesk\TicketStatusChanged;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketStatus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class TicketNotificationService
{
    /**
     * Minimum time between notifications to the same recipient for the same ticket.
     * Prevents email spam when multiple actions happen in quick succession.
     */
    private const THROTTLE_MINUTES = 5;

    /**
     * Send notification when ticket status changes.
     */
    public function notifyStatusChanged(Ticket $ticket, TicketStatus $oldStatus, TicketStatus $newStatus): void
    {
        $recipients = $this->getNotificationRecipients($ticket);
        $recipients = $this->filterThrottledRecipients($ticket, $recipients);

        if (empty($recipients)) {
            return;
        }

        $this->markRecipientsNotified($ticket, $recipients);
        Mail::to($recipients)->queue(new TicketStatusChanged($ticket, $oldStatus, $newStatus));
    }

    /**
     * Send notification when a comment is added.
     * Does not notify for internal comments.
     */
    public function notifyCommentAdded(Ticket $ticket, Comment $comment): void
    {
        // Don't send notifications for internal comments
        if ($comment->is_internal) {
            return;
        }

        $recipients = $this->getNotificationRecipients($ticket, $comment);
        $recipients = $this->filterThrottledRecipients($ticket, $recipients);

        if (empty($recipients)) {
            return;
        }

        $this->markRecipientsNotified($ticket, $recipients);
        Mail::to($recipients)->queue(new TicketCommentAdded($ticket, $comment));
    }

    /**
     * Filter out recipients who were recently notified about this ticket.
     *
     * @param  array<string>  $recipients
     * @return array<string>
     */
    private function filterThrottledRecipients(Ticket $ticket, array $recipients): array
    {
        return array_values(array_filter($recipients, function (string $email) use ($ticket): bool {
            $cacheKey = $this->getThrottleCacheKey($ticket, $email);

            return ! Cache::has($cacheKey);
        }));
    }

    /**
     * Mark recipients as having been notified (for throttling).
     *
     * @param  array<string>  $recipients
     */
    private function markRecipientsNotified(Ticket $ticket, array $recipients): void
    {
        foreach ($recipients as $email) {
            $cacheKey = $this->getThrottleCacheKey($ticket, $email);
            Cache::put($cacheKey, true, now()->addMinutes(self::THROTTLE_MINUTES));
        }
    }

    /**
     * Generate a unique cache key for throttling notifications.
     */
    private function getThrottleCacheKey(Ticket $ticket, string $email): string
    {
        return sprintf('ticket_notification_throttle:%d:%s', $ticket->id, strtolower($email));
    }

    /**
     * Get the list of email addresses to notify.
     * Returns assignee email, submitter email, and watcher emails, deduplicated.
     */
    private function getNotificationRecipients(Ticket $ticket, ?Comment $excludeCommenter = null): array
    {
        $recipients = [];

        // Add submitter email
        if ($ticket->submitter_email) {
            $recipients[] = $ticket->submitter_email;
        }

        // Add assignee email if they have one
        if ($ticket->assignee?->email) {
            $recipients[] = $ticket->assignee->email;
        }

        // Add watcher emails
        $ticket->loadMissing('watchers');
        foreach ($ticket->watchers as $watcher) {
            if ($watcher->email) {
                $recipients[] = $watcher->email;
            }
        }

        // Remove duplicates
        $recipients = array_unique(array_map('strtolower', $recipients));

        // If a comment was added, don't notify the person who wrote it
        if ($excludeCommenter) {
            $commenterEmail = $excludeCommenter->user?->email ?? $excludeCommenter->submitter_email;
            if ($commenterEmail) {
                $recipients = array_filter($recipients, fn ($email) => strtolower($email) !== strtolower($commenterEmail));
            }
        }

        return array_values($recipients);
    }
}
