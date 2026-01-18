<?php

namespace App\Jobs\Helpdesk;

use App\Models\Helpdesk\Webhook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public Webhook $webhook,
        public string $event,
        public array $payload
    ) {}

    public function handle(): void
    {
        $fullPayload = array_merge($this->payload, [
            'event' => $this->event,
            'webhook_id' => $this->webhook->id,
        ]);

        $signature = $this->generateSignature($fullPayload);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Helpdesk-Event' => $this->event,
                    'X-Helpdesk-Signature' => $signature,
                    'X-Helpdesk-Webhook-Id' => (string) $this->webhook->id,
                    'User-Agent' => 'Corelink-Helpdesk-Webhook/1.0',
                ])
                ->post($this->webhook->url, $fullPayload);

            $this->webhook->update([
                'last_triggered_at' => now(),
                'last_response_code' => $response->status(),
            ]);

            if ($response->failed()) {
                Log::warning('Webhook delivery failed', [
                    'webhook_id' => $this->webhook->id,
                    'event' => $this->event,
                    'url' => $this->webhook->url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                // Throw exception to trigger retry
                if ($this->attempts() < $this->tries) {
                    throw new \Exception("Webhook delivery failed with status {$response->status()}");
                }
            } else {
                Log::info('Webhook delivered successfully', [
                    'webhook_id' => $this->webhook->id,
                    'event' => $this->event,
                    'url' => $this->webhook->url,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Webhook delivery error', [
                'webhook_id' => $this->webhook->id,
                'event' => $this->event,
                'url' => $this->webhook->url,
                'error' => $e->getMessage(),
            ]);

            $this->webhook->update([
                'last_triggered_at' => now(),
                'last_response_code' => 0,
            ]);

            throw $e;
        }
    }

    /**
     * Generate HMAC signature for the payload
     */
    protected function generateSignature(array $payload): string
    {
        $json = json_encode($payload);

        return 'sha256='.hash_hmac('sha256', $json, $this->webhook->secret);
    }
}
