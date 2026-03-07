<?php

namespace App\Services\Helpdesk;

use App\Mail\Helpdesk\UserWelcome;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function __construct(private NotificationDigestService $notificationDigestService) {}

    /**
     * Notify project staff about a new ticket
     */
    public function notifyNewTicket(Ticket $ticket): void
    {
        $ticket->loadMissing(['project', 'status', 'priority', 'type']);

        // Get all users who should receive notifications for this project
        $usersToNotify = $ticket->project->users()
            ->wherePivot('receive_notifications', true)
            ->wherePivotIn('role', ['owner', 'manager', 'agent'])
            ->get();

        $recipients = $usersToNotify
            ->pluck('email')
            ->filter()
            ->values()
            ->all();

        $this->notificationDigestService->queueNewTicket($ticket, $recipients);
    }

    /**
     * Auto-add watchers for a newly created ticket.
     * Adds all project users who have auto_watch_all_tickets enabled.
     */
    public function addAutoWatchers(Ticket $ticket): void
    {
        $ticket->loadMissing('project');

        $autoWatchUserIds = $ticket->project->users()
            ->wherePivot('auto_watch_all_tickets', true)
            ->pluck('users.id')
            ->toArray();

        if (! empty($autoWatchUserIds)) {
            $ticket->watchers()->syncWithoutDetaching($autoWatchUserIds);
        }
    }

    /**
     * Send welcome email to a new helpdesk user
     */
    public function sendUserWelcome(User $user, string $password, ?Project $project = null): void
    {
        Mail::to($user->email)->queue(new UserWelcome($user, $password, $project));
    }
}
