<?php

namespace App\Services\Helpdesk;

use App\Enums\Helpdesk\OpenAiKeyStatus;
use App\Mail\Helpdesk\OpenAiKeyLimitWarning;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\OpenAiUsageLog;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OpenAiUsageSyncService
{
    public function __construct(private readonly OpenAiAdminService $adminService) {}

    /**
     * Sync usage for all connected configs.
     *
     * @return Collection<int, OpenAiConfig>
     */
    public function syncAll(): Collection
    {
        $configs = OpenAiConfig::query()
            ->whereNotNull('openai_project_id')
            ->get();

        $synced = collect();

        foreach ($configs as $config) {
            try {
                $this->syncForConfig($config);
                $synced->push($config);
            } catch (\Throwable $e) {
                Log::error('OpenAI usage sync failed', [
                    'config_id' => $config->id,
                    'project_id' => $config->project_id,
                    'error' => $e->getMessage(),
                ]);

                $config->update(['last_sync_error' => $e->getMessage()]);
            }
        }

        return $synced;
    }

    /**
     * Sync usage and costs for a single config.
     */
    public function syncForConfig(OpenAiConfig $config): void
    {
        $startTime = $this->getCycleStartTimestamp($config);
        $endTime = now()->timestamp;

        // Fetch per-key usage and total costs in one shot
        $usageData = $this->adminService->getUsageByApiKey(
            $config->openai_project_id,
            $startTime,
            $endTime
        );

        $costsData = $this->adminService->getCosts(
            $config->openai_project_id,
            $startTime,
            $endTime
        );

        DB::transaction(function () use ($config, $usageData, $costsData) {
            $this->storeUsageLogs($config, $usageData);
            $this->updateCycleUsage($config, $costsData);
        });

        // Check max spend limits after data is stored
        $this->checkMaxSpendLimits($config);

        $config->update([
            'last_synced_at' => now(),
            'last_sync_error' => null,
        ]);
    }

    /**
     * Store per-key per-model usage log entries from the usage API response.
     */
    private function storeUsageLogs(OpenAiConfig $config, array $usageData): void
    {
        $buckets = $usageData['data'] ?? [];

        // Build a map of openai_api_key_id → local OpenAiApiKey id
        $keyMap = $config->apiKeys()
            ->whereNotNull('openai_api_key_id')
            ->pluck('id', 'openai_api_key_id');

        foreach ($buckets as $bucket) {
            $date = date('Y-m-d', $bucket['start_time']);

            foreach ($bucket['results'] ?? [] as $result) {
                $openAiKeyId = $result['api_key_id'] ?? null;
                $model = $result['model'] ?? null;
                $localKeyId = $openAiKeyId ? ($keyMap[$openAiKeyId] ?? null) : null;

                $costUsd = 0.0;
                $costCents = 0;
                $inputTokens = $result['input_tokens'] ?? 0;
                $outputTokens = $result['output_tokens'] ?? 0;
                $requests = $result['num_model_requests'] ?? 0;

                OpenAiUsageLog::updateOrCreate(
                    [
                        'openai_config_id' => $config->id,
                        'openai_api_key_id' => $localKeyId,
                        'usage_date' => $date,
                        'model' => $model,
                    ],
                    [
                        'input_tokens' => $inputTokens,
                        'output_tokens' => $outputTokens,
                        'requests' => $requests,
                        'cost_usd' => $costUsd,
                        'cost_cents' => $costCents,
                        'raw_response' => $result,
                    ]
                );

                // Update the api key's spend and last_used_at
                if ($localKeyId) {
                    OpenAiApiKey::where('id', $localKeyId)->update([
                        'last_used_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Update cycle_usage_cents from the authoritative costs endpoint.
     */
    private function updateCycleUsage(OpenAiConfig $config, array $costsData): void
    {
        $totalCostUsd = 0.0;

        foreach ($costsData['data'] ?? [] as $bucket) {
            foreach ($bucket['results'] ?? [] as $result) {
                $totalCostUsd += $result['amount']['value'] ?? 0.0;
            }
        }

        $totalCostCents = (int) round($totalCostUsd * 100);

        // Update each key's spend_usd proportionally based on token usage
        $this->allocateKeySpend($config, $totalCostUsd);

        $config->update(['cycle_usage_cents' => $totalCostCents]);
    }

    /**
     * Allocate total project cost proportionally to each key by its token usage this cycle.
     */
    private function allocateKeySpend(OpenAiConfig $config, float $totalCostUsd): void
    {
        $keys = $config->activeKeys()->with('usageLogs')->get();

        if ($keys->isEmpty() || $totalCostUsd <= 0) {
            return;
        }

        // Sum tokens per local key across the full cycle
        $tokensByKey = [];
        $totalTokens = 0;

        foreach ($keys as $key) {
            $tokens = $key->usageLogs()->sum(DB::raw('input_tokens + output_tokens'));
            $tokensByKey[$key->id] = (int) $tokens;
            $totalTokens += (int) $tokens;
        }

        if ($totalTokens === 0) {
            return;
        }

        foreach ($keys as $key) {
            $fraction = $tokensByKey[$key->id] / $totalTokens;
            $keySpend = round($totalCostUsd * $fraction, 4);
            $key->update(['spend_usd' => $keySpend]);
        }
    }

    /**
     * Check spend thresholds for all keys on a config.
     * - At max_spend_usd: send warning email (once)
     * - At max_spend_usd + grace_amount_usd (or immediately if grace is 0): suspend key
     */
    private function checkMaxSpendLimits(OpenAiConfig $config): void
    {
        $keys = $config->apiKeys()
            ->whereIn('status', [OpenAiKeyStatus::Active->value, OpenAiKeyStatus::Suspended->value])
            ->whereNotNull('max_spend_usd')
            ->get();

        foreach ($keys as $key) {
            if ($key->isSuspended()) {
                // Nothing to do for already-suspended keys during sync
                continue;
            }

            if ($key->isOverGraceThreshold()) {
                $this->suspendKey($config, $key);
            } elseif ($key->isOverMaxSpend() && ! $key->grace_notified_at) {
                $this->notifyKeyAtLimit($config, $key);
            }
        }
    }

    /**
     * Notify admin and project owner that a key has hit its max_spend limit.
     * The key stays active during the grace period.
     */
    private function notifyKeyAtLimit(OpenAiConfig $config, OpenAiApiKey $key): void
    {
        $key->update(['grace_notified_at' => now()]);

        $recipients = $this->getNotificationRecipients($config);

        foreach ($recipients as $email) {
            Mail::to($email)->queue(new OpenAiKeyLimitWarning($config, $key, 'limit_reached'));
        }

        Log::info('OpenAI key limit reached — grace period started', [
            'key_id' => $key->id,
            'config_id' => $config->id,
            'spend_usd' => $key->spend_usd,
            'max_spend_usd' => $key->max_spend_usd,
            'grace_amount_usd' => $key->grace_amount_usd,
        ]);
    }

    /**
     * Suspend a key that has exceeded max_spend + grace.
     * Sets OpenAI project spend limit (best effort) and marks key as Suspended.
     */
    public function suspendKey(OpenAiConfig $config, OpenAiApiKey $key): void
    {
        // Best-effort: try to enforce via OpenAI project spend limit
        if ($config->openai_project_id) {
            $this->adminService->setProjectSpendLimit(
                $config->openai_project_id,
                (float) $key->spend_usd
            );
        }

        $key->update([
            'status' => OpenAiKeyStatus::Suspended,
            'suspended_at' => now(),
        ]);

        $recipients = $this->getNotificationRecipients($config);

        foreach ($recipients as $email) {
            Mail::to($email)->queue(new OpenAiKeyLimitWarning($config, $key, 'suspended'));
        }

        Log::info('OpenAI API key suspended — grace threshold exceeded', [
            'key_id' => $key->id,
            'config_id' => $config->id,
            'spend_usd' => $key->spend_usd,
            'max_spend_usd' => $key->max_spend_usd,
            'grace_amount_usd' => $key->grace_amount_usd,
        ]);
    }

    /**
     * Permanently revoke a key — deletes the service account from OpenAI.
     * Used only for manual admin revocation, not automatic spend enforcement.
     */
    public function revokeKey(OpenAiConfig $config, OpenAiApiKey $key, string $reason): void
    {
        if ($key->openai_service_account_id && $config->openai_project_id) {
            try {
                $this->adminService->deleteServiceAccount(
                    $config->openai_project_id,
                    $key->openai_service_account_id
                );
            } catch (\Throwable $e) {
                Log::warning('Failed to delete OpenAI service account during revoke', [
                    'key_id' => $key->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $key->update([
            'status' => OpenAiKeyStatus::Revoked,
            'revoked_at' => now(),
            'revoked_reason' => $reason,
            'api_key_encrypted' => null,
        ]);

        Log::info('OpenAI API key permanently revoked', [
            'key_id' => $key->id,
            'config_id' => $config->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Reactivate a suspended key after the admin has raised its limits.
     */
    public function reactivateKey(OpenAiConfig $config, OpenAiApiKey $key): void
    {
        $key->update([
            'status' => OpenAiKeyStatus::Active,
            'suspended_at' => null,
            'grace_notified_at' => null,
        ]);

        Log::info('OpenAI API key reactivated', [
            'key_id' => $key->id,
            'config_id' => $config->id,
        ]);
    }

    /**
     * Get email addresses to notify for a config (project emails + notification_emails).
     *
     * @return array<string>
     */
    private function getNotificationRecipients(OpenAiConfig $config): array
    {
        $emails = $config->notification_emails ?? [];

        $clientEmail = $config->project?->client_email;
        if ($clientEmail && ! in_array($clientEmail, $emails, true)) {
            $emails[] = $clientEmail;
        }

        return array_filter($emails);
    }

    /**
     * Get the UNIX timestamp for the start of the current billing cycle.
     */
    private function getCycleStartTimestamp(OpenAiConfig $config): int
    {
        $day = $config->billing_cycle_start_day;
        $now = now();

        $start = $now->copy()->setDay($day)->startOfDay();

        if ($start->gt($now)) {
            $start->subMonth();
        }

        return $start->timestamp;
    }
}
