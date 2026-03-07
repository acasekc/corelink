<?php

namespace App\Services\Helpdesk;

use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketStatus;

class TicketNotificationService
{
    public function __construct(private NotificationDigestService $notificationDigestService) {}

    /**
     * Send notification when ticket status changes.
     */
    public function notifyStatusChanged(Ticket $ticket, TicketStatus $oldStatus, TicketStatus $newStatus): void
    {
        $recipients = $this->getNotificationRecipients($ticket);
        $this->notificationDigestService->queueStatusChanged($ticket, $recipients, $oldStatus, $newStatus);
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
        $this->notificationDigestService->queueCommentAdded($ticket, $recipients, $comment);
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
