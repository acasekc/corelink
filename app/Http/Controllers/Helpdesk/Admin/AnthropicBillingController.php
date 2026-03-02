<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Enums\Helpdesk\OverageMode;
use App\Http\Controllers\Controller;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\Project;
use App\Services\Helpdesk\AnthropicBillingService;
use App\Services\Helpdesk\AnthropicUsageSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnthropicBillingController extends Controller
{
    /**
     * Get the Anthropic API config for a project.
     */
    public function show(Project $project): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => $this->formatConfig($config),
        ]);
    }

    /**
     * Create or update the Anthropic API config for a project.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'api_key_name' => ['nullable', 'string', 'max:255'],
            'api_key' => ['nullable', 'string', 'max:500'],
            'plan_tier' => ['required', 'string', 'max:32'],
            'included_allowance' => ['required', 'numeric', 'min:0'],
            'grace_threshold' => ['required', 'numeric', 'min:0', 'gte:included_allowance'],
            'markup_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'overage_mode' => ['required', Rule::enum(OverageMode::class)],
            'notification_emails' => ['nullable', 'array'],
            'notification_emails.*' => ['email', 'max:255'],
            'cycle_start_day' => ['required', 'integer', 'min:1', 'max:28'],
        ]);

        $config = $project->anthropicApiConfig;

        $data = [
            'api_key_name' => $validated['api_key_name'] ?? null,
            'plan_tier' => $validated['plan_tier'],
            'included_allowance' => $validated['included_allowance'],
            'grace_threshold' => $validated['grace_threshold'],
            'markup_percentage' => $validated['markup_percentage'],
            'overage_mode' => $validated['overage_mode'],
            'notification_emails' => $validated['notification_emails'] ?? [],
            'cycle_start_day' => $validated['cycle_start_day'],
        ];

        // Only update the API key if a new one is provided
        if (! empty($validated['api_key'])) {
            $data['api_key_encrypted'] = $validated['api_key'];
        }

        if ($config) {
            $config->update($data);
            $config->refresh();
            $message = 'Anthropic API config updated successfully';
        } else {
            $data['project_id'] = $project->id;
            $data['key_status'] = ApiKeyStatus::Active;
            $config = AnthropicApiConfig::create($data);
            $config->refresh();
            $message = 'Anthropic API config created successfully';
        }

        return response()->json([
            'data' => $this->formatConfig($config),
            'message' => $message,
        ], $config->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Get paginated usage logs for a project's Anthropic config.
     */
    public function usageLogs(Project $project): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0],
            ]);
        }

        $logs = $config->usageLogs()
            ->orderByDesc('synced_at')
            ->paginate(20);

        return response()->json([
            'data' => $logs->map(fn ($log) => [
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
            ]),
            'meta' => [
                'total' => $logs->total(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }

    /**
     * Toggle the API key status (enable/disable).
     */
    public function toggleKey(Request $request, Project $project): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json(['message' => 'No Anthropic API config found for this project'], 404);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::enum(ApiKeyStatus::class)],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $config->update([
            'key_status' => $validated['status'],
            'disabled_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'data' => $this->formatConfig($config->fresh()),
            'message' => 'Key status updated to '.ApiKeyStatus::from($validated['status'])->label(),
        ]);
    }

    /**
     * Trigger a manual usage sync for a project's Anthropic config.
     */
    public function sync(Project $project, AnthropicUsageSyncService $syncService): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json(['message' => 'No Anthropic API config found for this project'], 404);
        }

        if (! $config->isActive() && ! $config->isInGrace()) {
            return response()->json(['message' => 'Cannot sync: key is not active or in grace period'], 422);
        }

        try {
            $log = $syncService->syncForConfig($config);

            return response()->json([
                'data' => $this->formatConfig($config->fresh()),
                'log' => [
                    'id' => $log->id,
                    'tokens_input' => $log->tokens_input,
                    'tokens_output' => $log->tokens_output,
                    'total_tokens' => $log->totalTokens(),
                    'cost_cents' => $log->cost_cents,
                    'cost_dollars' => $log->costDollars(),
                ],
                'message' => 'Usage synced successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Usage sync failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a draft invoice for a project's current Anthropic billing cycle.
     */
    public function generateInvoice(Project $project, AnthropicBillingService $billingService): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json(['message' => 'No Anthropic API config found for this project'], 404);
        }

        if ($config->cycle_usage_cents <= 0) {
            return response()->json(['message' => 'No usage to invoice for this billing cycle'], 422);
        }

        try {
            $invoice = $billingService->generateInvoice($config);

            if (! $invoice) {
                return response()->json(['message' => 'No invoice generated'], 422);
            }

            return response()->json([
                'data' => [
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'total' => $invoice->total,
                    'status' => $invoice->status,
                ],
                'message' => "Invoice {$invoice->invoice_number} generated successfully",
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to generate invoice: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset the billing cycle for a project's Anthropic config.
     */
    public function resetCycle(Project $project, AnthropicBillingService $billingService): JsonResponse
    {
        $config = $project->anthropicApiConfig;

        if (! $config) {
            return response()->json(['message' => 'No Anthropic API config found for this project'], 404);
        }

        $billingService->resetCycle($config);

        return response()->json([
            'data' => $this->formatConfig($config->fresh()),
            'message' => 'Billing cycle reset successfully',
        ]);
    }

    /**
     * Format config for API response.
     *
     * @return array<string, mixed>
     */
    private function formatConfig(AnthropicApiConfig $config): array
    {
        return [
            'id' => $config->id,
            'project_id' => $config->project_id,
            'api_key_name' => $config->api_key_name,
            'has_api_key' => ! empty($config->api_key_encrypted),
            'masked_api_key' => $config->maskedApiKey(),
            'plan_tier' => $config->plan_tier,
            'included_allowance' => $config->included_allowance,
            'grace_threshold' => $config->grace_threshold,
            'markup_percentage' => $config->markup_percentage,
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
            'created_at' => $config->created_at->toIso8601String(),
            'updated_at' => $config->updated_at->toIso8601String(),
        ];
    }
}
