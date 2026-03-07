<?php

namespace App\Jobs\Helpdesk;

use App\Mail\Helpdesk\TicketActivityDigest;
use App\Models\Helpdesk\NotificationDigest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNotificationDigestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $digestId) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $digest = NotificationDigest::query()
            ->with(['events.ticket.project', 'events.ticket.status', 'events.ticket.priority'])
            ->find($this->digestId);

        if (! $digest || $digest->sent_at) {
            return;
        }

        if ($digest->dispatch_after->isFuture()) {
            $this->release($digest->dispatch_after->diffInSeconds(now()));

            return;
        }

        if ($digest->events->isEmpty()) {
            $digest->update(['sent_at' => now()]);

            return;
        }

        Mail::to($digest->recipient_email)->send(new TicketActivityDigest($digest));

        $digest->update(['sent_at' => now()]);
    }
}
