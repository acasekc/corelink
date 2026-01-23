<?php

namespace App\Services\Helpdesk;

use App\Mail\Helpdesk\TicketCommentAdded;
use App\Mail\Helpdesk\TicketStatusChanged;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketStatus;
use Illuminate\Support\Facades\Mail;

class TicketNotificationService
{
    /**
     * Send notification when ticket status changes.
     */
    public function notifyStatusChanged(Ticket $ticket, TicketStatus $oldStatus, TicketStatus $newStatus): void
    {
        $recipients = $this->getNotificationRecipients($ticket);

        if (empty($recipients)) {
            return;
        }

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

        if (empty($recipients)) {
            return;
        }

        Mail::to($recipients)->queue(new TicketCommentAdded($ticket, $comment));
    }

    /**
     * Get the list of email addresses to notify.
     * Returns assignee email and submitter email, deduplicated.
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

        // Remove duplicates
        $recipients = array_unique($recipients);

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
