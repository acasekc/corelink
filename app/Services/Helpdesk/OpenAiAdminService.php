<?php

namespace App\Services\Helpdesk;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiAdminService
{
    private const API_BASE = 'https://api.openai.com/v1';

    /**
     * Create an OpenAI project for a helpdesk project.
     *
     * @return array<string, mixed>
     */
    public function createProject(string $name): array
    {
        $response = $this->adminRequest()
            ->post(self::API_BASE.'/organization/projects', [
                'name' => $name,
            ]);

        $this->assertSuccess($response, 'create OpenAI project');

        return $response->json();
    }

    /**
     * Create a service account inside an OpenAI project and return the one-time key.
     *
     * @return array<string, mixed> Contains service_account + api_key.value
     */
    public function createServiceAccount(string $openAiProjectId, string $name): array
    {
        $response = $this->adminRequest()
            ->post(self::API_BASE."/organization/projects/{$openAiProjectId}/service_accounts", [
                'name' => $name,
            ]);

        $this->assertSuccess($response, 'create OpenAI service account');

        return $response->json();
    }

    /**
     * Permanently delete a service account from an OpenAI project.
     */
    public function deleteServiceAccount(string $openAiProjectId, string $serviceAccountId): void
    {
        $response = $this->adminRequest()
            ->delete(self::API_BASE."/organization/projects/{$openAiProjectId}/service_accounts/{$serviceAccountId}");

        if ($response->failed()) {
            Log::warning('OpenAI service account deletion failed', [
                'project_id' => $openAiProjectId,
                'service_account_id' => $serviceAccountId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
    }

    /**
     * Fetch completed-token usage grouped by API key for a given project and date range.
     *
     * @return array<string, mixed>
     */
    public function getUsageByApiKey(
        string $openAiProjectId,
        int $startTime,
        int $endTime
    ): array {
        $response = $this->adminRequest()
            ->get(self::API_BASE.'/organization/usage/completions', [
                'project_ids' => [$openAiProjectId],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'bucket_width' => '1d',
                'group_by' => ['api_key_id', 'model'],
                'limit' => 100,
            ]);

        $this->assertSuccess($response, 'fetch OpenAI usage');

        return $response->json();
    }

    /**
     * Fetch dollar costs for a project over a date range.
     *
     * @return array<string, mixed>
     */
    public function getCosts(
        string $openAiProjectId,
        int $startTime,
        int $endTime
    ): array {
        $response = $this->adminRequest()
            ->get(self::API_BASE.'/organization/costs', [
                'project_ids' => [$openAiProjectId],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'group_by' => ['project_id'],
                'limit' => 100,
            ]);

        $this->assertSuccess($response, 'fetch OpenAI costs');

        return $response->json();
    }

    /**
     * Verify the admin API key is configured and reachable.
     */
    public function ping(): bool
    {
        $key = config('services.openai_admin.api_key');

        if (empty($key)) {
            return false;
        }

        $response = $this->adminRequest()
            ->get(self::API_BASE.'/organization/projects', ['limit' => 1]);

        return $response->successful();
    }

    /**
     * Set a hard spend limit (USD) on an OpenAI project.
     * Best-effort: logs a warning on failure rather than throwing.
     */
    public function setProjectSpendLimit(string $openAiProjectId, float $limitUsd): bool
    {
        $response = $this->adminRequest()
            ->patch(self::API_BASE."/organization/projects/{$openAiProjectId}", [
                'budget_limit' => $limitUsd,
            ]);

        if ($response->failed()) {
            Log::warning('Failed to set OpenAI project spend limit', [
                'project_id' => $openAiProjectId,
                'limit_usd' => $limitUsd,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        }

        return true;
    }

    private function adminRequest(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withToken(config('services.openai_admin.api_key'))
            ->timeout(30)
            ->acceptJson();
    }

    private function assertSuccess(Response $response, string $context): void
    {
        if ($response->failed()) {
            throw new \RuntimeException(
                "OpenAI API failed to {$context}: HTTP {$response->status()} — {$response->body()}"
            );
        }
    }
}
