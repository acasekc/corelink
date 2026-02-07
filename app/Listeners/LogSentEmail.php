<?php

namespace App\Listeners;

use App\Models\EmailLog;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Log;

class LogSentEmail
{
    /**
     * Handle the MessageSent event.
     *
     * Only logs emails to external domains (not corelink.dev, pantrylink.app, champlink.app).
     */
    public function handle(MessageSent $event): void
    {
        $message = $event->message;
        $recipients = $message->getTo();

        foreach ($recipients as $address) {
            $email = $address->getAddress();

            if (! EmailLog::shouldLog($email)) {
                continue;
            }

            try {
                $postmarkMessageId = $this->extractPostmarkMessageId($event);

                EmailLog::query()->create([
                    'to_email' => strtolower($email),
                    'subject' => $message->getSubject() ?? '',
                    'mailable_class' => $event->data['__laravel_notification'] ?? $this->getMailableClass($event),
                    'status' => 'sent',
                    'postmark_message_id' => $postmarkMessageId,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Failed to log sent email', [
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Extract the Postmark Message-ID from the sent message response.
     */
    protected function extractPostmarkMessageId(MessageSent $event): ?string
    {
        $messageId = $event->sent?->getMessageId();

        if ($messageId) {
            return trim($messageId, '<>');
        }

        return null;
    }

    /**
     * Attempt to determine the Mailable class name from the event data.
     */
    protected function getMailableClass(MessageSent $event): ?string
    {
        $mailable = $event->data['__mailable'] ?? null;

        if ($mailable) {
            return get_class($mailable);
        }

        return null;
    }
}
