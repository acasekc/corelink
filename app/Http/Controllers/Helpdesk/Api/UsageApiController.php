<?php

namespace App\Http\Controllers\Helpdesk\Api;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\OpenAiUsageLog;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UsageApiController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $project = $this->project($request);
        $project->load(['openAiConfig.apiKeys', 'anthropicApiConfig.planTier']);

        return response()->json([
            'data' => [
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'ticket_prefix' => $project->ticket_prefix,
                ],
                'openai' => $project->openAiConfig
                    ? $this->formatOpenAiSummary($project->openAiConfig)
                    : null,
                'anthropic' => $project->anthropicApiConfig
                    ? $this->formatAnthropicSummary($project->anthropicApiConfig)
                    : null,
            ],
        ]);
    }

    public function openAi(Request $request): JsonResponse
    {
        $project = $this->project($request);
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json([
                'data' => null,
                'meta' => ['total' => 0],
            ]);
        }

        $config->load(['apiKeys.usageLogs']);

        $logs = $config->usageLogs()
            ->with('apiKey')
            ->orderByDesc('usage_date')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => [
                'config' => $this->formatOpenAiSummary($config),
                'keys' => $config->apiKeys
                    ->map(fn (OpenAiApiKey $key) => $this->formatOpenAiKey($key))
                    ->values()
                    ->all(),
                'logs' => $logs->getCollection()
                    ->map(fn (OpenAiUsageLog $log) => $this->formatOpenAiLog($log))
                    ->values()
                    ->all(),
            ],
            'meta' => $this->paginationMeta($logs),
        ]);
    }

    public function anthropic(Request $request): JsonResponse
    {
        $project = $this->project($request);
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json([
                'data' => null,
                'meta' => ['total' => 0],
            ]);
        }

        $config->load('planTier');

        $logs = $config->usageLogs()
            ->orderByDesc('synced_at')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => [
                'config' => $this->formatAnthropicSummary($config),
                'logs' => $logs->getCollection()
                    ->map(fn (AnthropicUsageLog $log) => $this->formatAnthropicLog($log))
                    ->values()
                    ->all(),
            ],
            'meta' => $this->paginationMeta($logs),
        ]);
    }

    private function project(Request $request): Project
    {
        /** @var Project|null $project */
        $project = $request->attributes->get('helpdesk_project');

        if (! $project) {
            throw new NotFoundHttpException('Helpdesk project context not found.');
        }

        return $project;
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 30), 100));
    }

    /**
     * @return array<string, int>
     */
    private function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOpenAiSummary(OpenAiConfig $config): array
    {
        $keys = $config->relationLoaded('apiKeys')
            ? $config->apiKeys
            : $config->apiKeys()->get();

        return [
            'id' => $config->id,
            'is_connected' => $config->isConnected(),
            'openai_project_id' => $config->openai_project_id,
            'openai_project_name' => $config->openai_project_name,
            'markup_percentage' => (float) $config->markup_percentage,
            'billing_cycle_start_day' => $config->billing_cycle_start_day,
            'cycle_usage_cents' => $config->cycle_usage_cents,
            'cycle_usage_dollars' => $config->cycleUsageDollars(),
            'last_synced_at' => $config->last_synced_at?->toIso8601String(),
            'last_sync_error' => $config->last_sync_error,
            'connected_at' => $config->connected_at?->toIso8601String(),
            'notification_emails' => $config->notification_emails ?? [],
            'keys_total' => $keys->count(),
            'keys_active' => $keys->filter(fn (OpenAiApiKey $key) => $key->status->value === 'active')->count(),
            'keys_suspended' => $keys->filter(fn (OpenAiApiKey $key) => $key->status->value === 'suspended')->count(),
            'keys_revoked' => $keys->filter(fn (OpenAiApiKey $key) => $key->status->value === 'revoked')->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOpenAiKey(OpenAiApiKey $key): array
    {
        $usageLogs = $key->relationLoaded('usageLogs') ? $key->usageLogs : collect();

        return [
            'id' => $key->id,
            'name' => $key->name,
            'masked_api_key' => $key->maskedApiKey(),
            'status' => $key->status->value,
            'status_label' => $key->status->label(),
            'status_color' => $key->status->color(),
            'max_spend_usd' => $key->max_spend_usd !== null ? (float) $key->max_spend_usd : null,
            'grace_amount_usd' => (float) ($key->grace_amount_usd ?? 0),
            'grace_threshold_usd' => $key->graceThresholdUsd(),
            'spend_usd' => (float) $key->spend_usd,
            'spend_remaining_usd' => $key->spendRemainingUsd(),
            'is_over_max_spend' => $key->isOverMaxSpend(),
            'is_over_grace_threshold' => $key->isOverGraceThreshold(),
            'total_tokens' => $usageLogs->sum(fn (OpenAiUsageLog $log) => $log->totalTokens()),
            'requests' => $usageLogs->sum('requests'),
            'last_used_at' => $key->last_used_at?->toIso8601String(),
            'grace_notified_at' => $key->grace_notified_at?->toIso8601String(),
            'suspended_at' => $key->suspended_at?->toIso8601String(),
            'revoked_at' => $key->revoked_at?->toIso8601String(),
            'revoked_reason' => $key->revoked_reason,
            'created_at' => $key->created_at->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOpenAiLog(OpenAiUsageLog $log): array
    {
        return [
            'id' => $log->id,
            'usage_date' => $log->usage_date->toDateString(),
            'model' => $log->model,
            'input_tokens' => $log->input_tokens,
            'output_tokens' => $log->output_tokens,
            'total_tokens' => $log->totalTokens(),
            'requests' => $log->requests,
            'cost_usd' => $log->costDollars(),
            'cost_cents' => $log->cost_cents,
            'api_key_name' => $log->apiKey?->name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatAnthropicSummary(AnthropicApiConfig $config): array
    {
        if (! $config->relationLoaded('planTier')) {
            $config->load('planTier');
        }

        return [
            'id' => $config->id,
            'api_key_name' => $config->api_key_name,
            'has_api_key' => ! empty($config->api_key_encrypted),
            'masked_api_key' => $config->maskedApiKey(),
            'plan_tier' => $config->plan_tier,
            'plan_tier_id' => $config->plan_tier_id,
            'plan_tier_name' => $config->planTier?->name,
            'included_allowance' => (float) $config->included_allowance,
            'grace_threshold' => (float) $config->grace_threshold,
            'markup_percentage' => (float) $config->markup_percentage,
            'overage_mode' => $config->overage_mode->value,
            'notification_emails' => $config->notification_emails ?? [],
            'key_status' => $config->key_status->value,
            'key_status_label' => $config->key_status->label(),
            'key_status_color' => $config->key_status->color(),
            'cycle_start_day' => $config->cycle_start_day,
            'cycle_usage_cents' => $config->cycle_usage_cents,
            'cycle_usage_dollars' => $config->cycleUsageDollars(),
            'included_allowance_cents' => $config->includedAllowanceCents(),
            'grace_threshold_cents' => $config->graceThresholdCents(),
            'allowance_remaining_cents' => $config->allowanceRemainingCents(),
            'is_over_allowance' => $config->isOverAllowance(),
            'is_over_grace_threshold' => $config->isOverGraceThreshold(),
            'overage_cents' => $config->overageCents(),
            'overage_with_markup_cents' => $config->overageWithMarkupCents(),
            'last_synced_at' => $config->last_synced_at?->toIso8601String(),
            'disabled_reason' => $config->disabled_reason,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatAnthropicLog(AnthropicUsageLog $log): array
    {
        return [
            'id' => $log->id,
            'synced_at' => $log->synced_at->toIso8601String(),
            'period_start' => $log->period_start->toDateString(),
            'period_end' => $log->period_end->toDateString(),
            'tokens_input' => $log->tokens_input,
            'tokens_output' => $log->tokens_output,
            'total_tokens' => $log->totalTokens(),
            'cost_cents' => $log->cost_cents,
            'cost_dollars' => $log->costDollars(),
            'model_breakdown' => $log->model_breakdown,
        ];
    }
}
