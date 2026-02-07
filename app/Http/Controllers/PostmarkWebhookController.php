<?php

namespace App\Http\Controllers;

use App\Enums\SuppressionType;
use App\Models\EmailLog;
use App\Models\EmailSuppression;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PostmarkWebhookController extends Controller
{
    /**
     * Handle incoming Postmark webhooks (bounces and spam complaints).
     */
    public function handle(Request $request): JsonResponse
    {
        if (! $this->verifyToken($request)) {
            Log::warning('Postmark webhook received with invalid token');

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $recordType = $payload['RecordType'] ?? null;

        Log::info('Postmark webhook received', [
            'type' => $recordType,
            'email' => $payload['Email'] ?? null,
        ]);

        return match ($recordType) {
            'Bounce' => $this->handleBounce($payload),
            'SpamComplaint' => $this->handleSpamComplaint($payload),
            default => response()->json(['message' => 'Webhook received']),
        };
    }

    /**
     * Handle a bounce webhook from Postmark.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function handleBounce(array $payload): JsonResponse
    {
        $email = strtolower($payload['Email'] ?? '');

        if (! $email) {
            return response()->json(['error' => 'Missing email'], 422);
        }

        // Only suppress on hard bounces (not transient issues)
        $type = $payload['Type'] ?? '';
        $isHardBounce = in_array($type, ['HardBounce', 'BadEmailAddress', 'ManuallyDeactivated'], true);

        if (! $isHardBounce) {
            Log::info('Postmark soft bounce ignored', [
                'email' => $email,
                'type' => $type,
            ]);

            return response()->json(['message' => 'Soft bounce ignored']);
        }

        EmailSuppression::query()->updateOrCreate(
            ['email' => $email, 'type' => SuppressionType::Bounce],
            [
                'reason' => $payload['Description'] ?? $type,
                'payload' => $payload,
            ],
        );

        $this->updateEmailLogStatus($payload, 'bounced');

        Log::warning('Email suppressed due to hard bounce', ['email' => $email, 'type' => $type]);

        return response()->json(['message' => 'Bounce processed']);
    }

    /**
     * Handle a spam complaint webhook from Postmark.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function handleSpamComplaint(array $payload): JsonResponse
    {
        $email = strtolower($payload['Email'] ?? '');

        if (! $email) {
            return response()->json(['error' => 'Missing email'], 422);
        }

        EmailSuppression::query()->updateOrCreate(
            ['email' => $email, 'type' => SuppressionType::SpamComplaint],
            [
                'reason' => 'Recipient marked as spam',
                'payload' => $payload,
            ],
        );

        $this->updateEmailLogStatus($payload, 'complained');

        Log::warning('Email suppressed due to spam complaint', ['email' => $email]);

        return response()->json(['message' => 'Spam complaint processed']);
    }

    /**
     * Update the email log status if a matching record exists.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function updateEmailLogStatus(array $payload, string $status): void
    {
        $messageId = $payload['MessageID'] ?? null;

        if (! $messageId) {
            return;
        }

        EmailLog::query()
            ->where('postmark_message_id', $messageId)
            ->update(['status' => $status]);
    }

    /**
     * Verify the webhook token matches our configured secret.
     */
    protected function verifyToken(Request $request): bool
    {
        $configuredToken = config('services.postmark.webhook_token');

        if (! $configuredToken) {
            return true;
        }

        $providedToken = $request->header('X-Postmark-Token')
            ?? $request->query('token');

        return hash_equals($configuredToken, (string) $providedToken);
    }
}
