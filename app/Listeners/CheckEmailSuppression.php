<?php

namespace App\Listeners;

use App\Models\EmailSuppression;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Log;

class CheckEmailSuppression
{
    /**
     * Handle the MessageSending event.
     *
     * Returns false to cancel sending if the recipient is suppressed.
     */
    public function handle(MessageSending $event): ?bool
    {
        $message = $event->message;
        $recipients = $message->getTo();

        foreach ($recipients as $address) {
            $email = $address->getAddress();

            if (EmailSuppression::isSuppressed($email)) {
                $suppression = EmailSuppression::findByEmail($email);

                Log::info('Email blocked due to suppression', [
                    'email' => $email,
                    'type' => $suppression?->type?->value,
                    'reason' => $suppression?->reason,
                    'subject' => $message->getSubject(),
                ]);

                return false;
            }
        }

        return null;
    }
}
