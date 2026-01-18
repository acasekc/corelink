<?php

namespace App\Services\Helpdesk;

use App\Mail\Helpdesk\NewTicketNotification;
use App\Mail\Helpdesk\UserWelcome;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
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

        foreach ($usersToNotify as $user) {
            Mail::to($user->email)->queue(new NewTicketNotification($ticket));
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
