<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Enums\Helpdesk\OpenAiKeyStatus;
use App\Http\Controllers\Controller;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\Project;
use App\Services\Helpdesk\OpenAiAdminService;
use App\Services\Helpdesk\OpenAiBillingService;
use App\Services\Helpdesk\OpenAiUsageSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpenAiBillingController extends Controller
{
    /**
     * Get the OpenAI config for a project.
     */
    public function show(Project $project): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['data' => null]);
        }

        $config->load('apiKeys', 'usageLogs');

        return response()->json(['data' => $this->formatConfig($config)]);
    }

    /**
     * Connect a helpdesk project to OpenAI (creates an OpenAI project).
     */
    public function connect(Project $project, OpenAiAdminService $adminService): JsonResponse
    {
        if ($project->openAiConfig?->isConnected()) {
            return response()->json(['message' => 'Project is already connected to OpenAI'], 422);
        }

        try {
            $result = $adminService->createProject($project->name);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to create OpenAI project: '.$e->getMessage()], 500);
        }

        $config = OpenAiConfig::updateOrCreate(
            ['project_id' => $project->id],
            [
                'openai_project_id' => $result['id'],
                'openai_project_name' => $result['name'],
                'connected_at' => now(),
            ]
        );

        return response()->json([
            'data' => $this->formatConfig($config->fresh()),
            'message' => 'OpenAI project created and connected',
        ], 201);
    }

    /**
     * Update billing settings (markup, cycle start day, notification emails).
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['message' => 'No OpenAI config found for this project'], 404);
        }

        $validated = $request->validate([
            'markup_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'billing_cycle_start_day' => ['required', 'integer', 'min:1', 'max:28'],
            'notification_emails' => ['nullable', 'array'],
            'notification_emails.*' => ['email', 'max:255'],
        ]);

        $config->update($validated);

        return response()->json([
            'data' => $this->formatConfig($config->fresh()),
            'message' => 'Settings updated',
        ]);
    }

    /**
     * Create a new API key (OpenAI service account) for a project.
     */
    public function createKey(
        Request $request,
        Project $project,
        OpenAiAdminService $adminService
    ): JsonResponse {
        $config = $project->openAiConfig;

        if (! $config?->isConnected()) {
            return response()->json(['message' => 'Project is not connected to OpenAI'], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'max_spend_usd' => ['nullable', 'numeric', 'min:0.01'],
            'grace_amount_usd' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            $result = $adminService->createServiceAccount(
                $config->openai_project_id,
                $validated['name']
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create service account: '.$e->getMessage(),
            ], 500);
        }

        $rawKey = $result['api_key']['value'] ?? null;
        $openAiKeyId = $result['api_key']['id'] ?? null;
        $serviceAccountId = $result['id'] ?? null;

        $key = OpenAiApiKey::create([
            'openai_config_id' => $config->id,
            'name' => $validated['name'],
            'openai_service_account_id' => $serviceAccountId,
            'openai_api_key_id' => $openAiKeyId,
            'api_key_encrypted' => $rawKey,
            'status' => OpenAiKeyStatus::Active,
            'max_spend_usd' => $validated['max_spend_usd'] ?? null,
            'grace_amount_usd' => $validated['grace_amount_usd'] ?? 0,
            'spend_usd' => 0,
        ]);

        return response()->json([
            'data' => $this->formatKey($key),
            'api_key' => $rawKey,
            'message' => 'API key created. Copy it now — it will not be shown again.',
        ], 201);
    }

    /**
     * Update spend limits for a key. If limits are raised above current spend,
     * a suspended key is automatically reactivated.
     */
    public function updateKey(
        Request $request,
        Project $project,
        OpenAiApiKey $key,
        OpenAiUsageSyncService $syncService
    ): JsonResponse {
        $config = $project->openAiConfig;

        if (! $config || $key->openai_config_id !== $config->id) {
            return response()->json(['message' => 'Key not found on this project'], 404);
        }

        if ($key->isRevoked()) {
            return response()->json(['message' => 'Cannot update a revoked key'], 422);
        }

        $validated = $request->validate([
            'max_spend_usd' => ['nullable', 'numeric', 'min:0.01'],
            'grace_amount_usd' => ['nullable', 'numeric', 'min:0'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $key->update(array_filter($validated, fn ($v) => ! is_null($v)));

        $key->refresh();

        // Auto-reactivate if the key is suspended and new limits are above current spend
        if ($key->isSuspended() && $key->hasMaxSpend()) {
            $newGraceThreshold = (float) $key->max_spend_usd + (float) ($key->grace_amount_usd ?? 0);
            if ((float) $key->spend_usd < $newGraceThreshold) {
                $syncService->reactivateKey($config, $key);
                $key->refresh();
            }
        }

        return response()->json([
            'data' => $this->formatKey($key),
            'message' => 'Key updated',
        ]);
    }

    /**
     * Manually reactivate a suspended key (e.g. after admin reviews and decides to allow).
     */
    public function reactivateKey(
        Project $project,
        OpenAiApiKey $key,
        OpenAiUsageSyncService $syncService
    ): JsonResponse {
        $config = $project->openAiConfig;

        if (! $config || $key->openai_config_id !== $config->id) {
            return response()->json(['message' => 'Key not found on this project'], 404);
        }

        if (! $key->isSuspended()) {
            return response()->json(['message' => 'Key is not suspended'], 422);
        }

        $syncService->reactivateKey($config, $key);

        return response()->json([
            'data' => $this->formatKey($key->fresh()),
            'message' => 'Key reactivated',
        ]);
    }

    /**
     * Revoke an API key — permanently deletes the service account from OpenAI.
     */
    public function revokeKey(
        Request $request,
        Project $project,
        OpenAiApiKey $key,
        OpenAiUsageSyncService $syncService
    ): JsonResponse {
        $config = $project->openAiConfig;

        if (! $config || $key->openai_config_id !== $config->id) {
            return response()->json(['message' => 'Key not found on this project'], 404);
        }

        if ($key->isRevoked()) {
            return response()->json(['message' => 'Key is already revoked'], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $reason = $validated['reason'] ?? 'Manually revoked';

        $syncService->revokeKey($config, $key, $reason);

        return response()->json([
            'data' => $this->formatKey($key->fresh()),
            'message' => 'Key revoked and deleted from OpenAI',
        ]);
    }

    /**
     * List all API keys for a project.
     */
    public function keys(Project $project): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['data' => []]);
        }

        $keys = $config->apiKeys()->orderByDesc('created_at')->get();

        return response()->json([
            'data' => $keys->map(fn (OpenAiApiKey $key) => $this->formatKey($key)),
        ]);
    }

    /**
     * List usage logs for a project.
     */
    public function usageLogs(Project $project): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $logs = $config->usageLogs()
            ->with('apiKey')
            ->orderByDesc('usage_date')
            ->paginate(30);

        return response()->json([
            'data' => $logs->map(fn ($log) => [
                'id' => $log->id,
                'usage_date' => $log->usage_date->toDateString(),
                'model' => $log->model,
                'input_tokens' => $log->input_tokens,
                'output_tokens' => $log->output_tokens,
                'total_tokens' => $log->totalTokens(),
                'requests' => $log->requests,
                'cost_usd' => (float) $log->cost_usd,
                'cost_cents' => $log->cost_cents,
                'api_key_name' => $log->apiKey?->name,
            ]),
            'meta' => [
                'total' => $logs->total(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    /**
     * Trigger a manual usage sync.
     */
    public function sync(Project $project, OpenAiUsageSyncService $syncService): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config?->isConnected()) {
            return response()->json(['message' => 'Project is not connected to OpenAI'], 422);
        }

        try {
            $syncService->syncForConfig($config);

            return response()->json([
                'data' => $this->formatConfig($config->fresh()->load('apiKeys')),
                'message' => 'Usage synced successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Sync failed: '.$e->getMessage()], 500);
        }
    }

    /**
     * Generate a draft invoice for the current billing cycle.
     */
    public function generateInvoice(Project $project, OpenAiBillingService $billingService): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['message' => 'No OpenAI config found for this project'], 404);
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
            return response()->json(['message' => 'Failed to generate invoice: '.$e->getMessage()], 500);
        }
    }

    /**
     * Reset the billing cycle.
     */
    public function resetCycle(Project $project, OpenAiBillingService $billingService): JsonResponse
    {
        $config = $project->openAiConfig;

        if (! $config) {
            return response()->json(['message' => 'No OpenAI config found for this project'], 404);
        }

        $billingService->resetCycle($config);

        return response()->json([
            'data' => $this->formatConfig($config->fresh()->load('apiKeys')),
            'message' => 'Billing cycle reset successfully',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatConfig(OpenAiConfig $config): array
    {
        return [
            'id' => $config->id,
            'project_id' => $config->project_id,
            'openai_project_id' => $config->openai_project_id,
            'openai_project_name' => $config->openai_project_name,
            'is_connected' => $config->isConnected(),
            'markup_percentage' => $config->markup_percentage,
            'billing_cycle_start_day' => $config->billing_cycle_start_day,
            'cycle_usage_cents' => $config->cycle_usage_cents,
            'cycle_usage_dollars' => $config->cycleUsageDollars(),
            'notification_emails' => $config->notification_emails ?? [],
            'last_synced_at' => $config->last_synced_at?->toIso8601String(),
            'last_sync_error' => $config->last_sync_error,
            'connected_at' => $config->connected_at?->toIso8601String(),
            'keys' => $config->relationLoaded('apiKeys')
                ? $config->apiKeys->map(fn ($k) => $this->formatKey($k))->values()
                : [],
            'created_at' => $config->created_at->toIso8601String(),
            'updated_at' => $config->updated_at->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatKey(OpenAiApiKey $key): array
    {
        return [
            'id' => $key->id,
            'name' => $key->name,
            'openai_service_account_id' => $key->openai_service_account_id,
            'openai_api_key_id' => $key->openai_api_key_id,
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
            'grace_notified_at' => $key->grace_notified_at?->toIso8601String(),
            'suspended_at' => $key->suspended_at?->toIso8601String(),
            'last_used_at' => $key->last_used_at?->toIso8601String(),
            'revoked_at' => $key->revoked_at?->toIso8601String(),
            'revoked_reason' => $key->revoked_reason,
            'created_at' => $key->created_at->toIso8601String(),
        ];
    }
}
