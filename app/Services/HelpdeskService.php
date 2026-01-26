<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HelpdeskService
{
    public function __construct(
        private string $apiKey,
        private string $baseUrl = 'https://corelink.dev/api/helpdesk/v1'
    ) {}

    /**
     * Create a support ticket from a contact form submission.
     *
     * @param  array{name: string, email: string, subject: string, message: string}  $data
     * @return array{success: bool, ticket_id?: int, ticket_number?: string, error?: string}
     */
    public function createTicketFromContact(array $data): array
    {
        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey,
                'Accept' => 'application/json',
            ])->post("{$this->baseUrl}/tickets", [
                'title' => $data['subject'],
                'content' => $data['message'],
                'submitter_name' => $data['name'],
                'submitter_email' => $data['email'],
                'type' => 'question',
                'priority' => 'medium',
                'metadata' => [
                    'source' => 'contact_form',
                    'submitted_at' => now()->toIso8601String(),
                ],
            ]);

            if ($response->successful()) {
                $ticket = $response->json('data');

                return [
                    'success' => true,
                    'ticket_id' => $ticket['id'] ?? null,
                    'ticket_number' => $ticket['number'] ?? null,
                ];
            }

            Log::error('Helpdesk API error', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return [
                'success' => false,
                'error' => $response->json('message') ?? 'Failed to create ticket',
            ];
        } catch (\Exception $e) {
            Log::error('Helpdesk API exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Unable to connect to helpdesk',
            ];
        }
    }
}
