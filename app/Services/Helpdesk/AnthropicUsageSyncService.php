<?php

namespace App\Services\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Events\Helpdesk\UsageSynced;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicUsageSyncService
{
    /**
     * The Anthropic API base URL.
     */
    private const API_BASE_URL = 'https://api.anthropic.com/v1';

    /**
     * Cost per million input tokens (in cents) per model.
     *
     * @var array<string, int>
     */
    private const INPUT_COST_PER_MILLION = [
        'claude-sonnet-4-20250514' => 300,
        'claude-opus-4-20250514' => 1500,
        'claude-3-5-haiku-20241022' => 80,
        'claude-3-5-sonnet-20241022' => 300,
        'claude-3-opus-20240229' => 1500,
        'claude-3-haiku-20240307' => 25,
    ];

    /**
     * Cost per million output tokens (in cents) per model.
     *
     * @var array<string, int>
     */
    private const OUTPUT_COST_PER_MILLION = [
        'claude-sonnet-4-20250514' => 1500,
        'claude-opus-4-20250514' => 7500,
        'claude-3-5-haiku-20241022' => 400,
        'claude-3-5-sonnet-20241022' => 1500,
        'claude-3-opus-20240229' => 7500,
        'claude-3-haiku-20240307' => 125,
    ];

    /**
     * Default cost per million tokens if model is unknown (in cents).
     */
    private const DEFAULT_INPUT_COST_PER_MILLION = 300;

    private const DEFAULT_OUTPUT_COST_PER_MILLION = 1500;

    /**
     * Sync usage for all active/grace configs.
     *
     * @return Collection<int, AnthropicUsageLog>
     */
    public function syncAll(): Collection
    {
        $billingService = app(AnthropicBillingService::class);

        $configs = AnthropicApiConfig::query()
            ->whereIn('key_status', [ApiKeyStatus::Active, ApiKeyStatus::Grace])
            ->whereNotNull('api_key_encrypted')
            ->get();

        $logs = collect();

        foreach ($configs as $config) {
            try {
                // Check for overdue invoices before syncing
                if ($billingService->checkOverdueInvoices($config)) {
                    continue;
                }

                $log = $this->syncForConfig($config);
                if ($log) {
                    $logs->push($log);
                }
            } catch (\Throwable $e) {
                Log::error('Anthropic usage sync failed', [
                    'config_id' => $config->id,
                    'project_id' => $config->project_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $logs;
    }

    /**
     * Sync usage for a single config by calling the Anthropic API.
     */
    public function syncForConfig(AnthropicApiConfig $config): ?AnthropicUsageLog
    {
        $periodStart = $this->getCyclePeriodStart($config);
        $periodEnd = now();

        $response = Http::withHeaders([
            'x-api-key' => $config->api_key_encrypted,
            'anthropic-version' => '2023-06-01',
        ])->timeout(30)->get(self::API_BASE_URL.'/usage', [
            'start_date' => $periodStart->toDateString(),
            'end_date' => $periodEnd->toDateString(),
        ]);

        if ($response->failed()) {
            Log::warning('Anthropic API usage request failed', [
                'config_id' => $config->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException(
                "Anthropic API returned {$response->status()}: {$response->body()}"
            );
        }

        $data = $response->json();

        return $this->processUsageResponse($config, $data, $periodStart, $periodEnd);
    }

    /**
     * Process the raw usage response from Anthropic and create a log entry.
     *
     * @param  array<string, mixed>  $data
     */
    public function processUsageResponse(
        AnthropicApiConfig $config,
        array $data,
        \DateTimeInterface $periodStart,
        \DateTimeInterface $periodEnd,
    ): AnthropicUsageLog {
        $totalInputTokens = 0;
        $totalOutputTokens = 0;
        $totalCostCents = 0;
        $modelBreakdown = [];

        // Parse the usage data — adapt to actual Anthropic API response format
        $usageEntries = $data['data'] ?? $data['usage'] ?? [$data];

        foreach ($usageEntries as $entry) {
            $model = $entry['model'] ?? 'unknown';
            $inputTokens = $entry['input_tokens'] ?? 0;
            $outputTokens = $entry['output_tokens'] ?? 0;

            $inputCost = $this->calculateTokenCost($inputTokens, $model, 'input');
            $outputCost = $this->calculateTokenCost($outputTokens, $model, 'output');
            $entryCost = $inputCost + $outputCost;

            $totalInputTokens += $inputTokens;
            $totalOutputTokens += $outputTokens;
            $totalCostCents += $entryCost;

            if (! isset($modelBreakdown[$model])) {
                $modelBreakdown[$model] = [
                    'input_tokens' => 0,
                    'output_tokens' => 0,
                    'cost_cents' => 0,
                ];
            }

            $modelBreakdown[$model]['input_tokens'] += $inputTokens;
            $modelBreakdown[$model]['output_tokens'] += $outputTokens;
            $modelBreakdown[$model]['cost_cents'] += $entryCost;
        }

        $log = AnthropicUsageLog::create([
            'anthropic_config_id' => $config->id,
            'synced_at' => now(),
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'tokens_input' => $totalInputTokens,
            'tokens_output' => $totalOutputTokens,
            'cost_cents' => $totalCostCents,
            'model_breakdown' => $modelBreakdown,
            'raw_response' => $data,
        ]);

        // Update the running cycle usage total
        $config->update([
            'cycle_usage_cents' => $totalCostCents,
            'last_synced_at' => now(),
        ]);

        UsageSynced::dispatch($config->fresh(), $log);

        return $log;
    }

    /**
     * Calculate token cost in cents.
     */
    public function calculateTokenCost(int $tokens, string $model, string $direction): int
    {
        $costMap = $direction === 'input'
            ? self::INPUT_COST_PER_MILLION
            : self::OUTPUT_COST_PER_MILLION;

        $defaultCost = $direction === 'input'
            ? self::DEFAULT_INPUT_COST_PER_MILLION
            : self::DEFAULT_OUTPUT_COST_PER_MILLION;

        $costPerMillion = $costMap[$model] ?? $defaultCost;

        return (int) round(($tokens / 1_000_000) * $costPerMillion);
    }

    /**
     * Get the start of the current billing cycle for a config.
     */
    public function getCyclePeriodStart(AnthropicApiConfig $config): \Carbon\Carbon
    {
        $today = now();
        $cycleDay = $config->cycle_start_day;

        // If today is on or after the cycle day, the cycle started this month
        if ($today->day >= $cycleDay) {
            return $today->copy()->day($cycleDay)->startOfDay();
        }

        // Otherwise, the cycle started last month
        return $today->copy()->subMonth()->day($cycleDay)->startOfDay();
    }
}
