<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Helpdesk\OverageMode;
use App\Http\Controllers\Controller;
use App\Models\Helpdesk\AnthropicPlanTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AnthropicPlanTierController extends Controller
{
    /**
     * List all plan tiers.
     */
    public function index(): JsonResponse
    {
        $tiers = AnthropicPlanTier::query()
            ->ordered()
            ->withCount('anthropicConfigs')
            ->get();

        return response()->json([
            'data' => $tiers->map(fn (AnthropicPlanTier $tier) => $this->formatTier($tier)),
        ]);
    }

    /**
     * Get a single plan tier.
     */
    public function show(AnthropicPlanTier $anthropicPlanTier): JsonResponse
    {
        $anthropicPlanTier->loadCount('anthropicConfigs');

        return response()->json([
            'data' => $this->formatTier($anthropicPlanTier),
        ]);
    }

    /**
     * Create a new plan tier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->validationRules());

        $tier = AnthropicPlanTier::create([
            ...$validated,
            'slug' => Str::slug($validated['name']),
        ]);

        $tier->loadCount('anthropicConfigs');

        return response()->json([
            'data' => $this->formatTier($tier),
            'message' => "Plan tier \"{$tier->name}\" created successfully",
        ], 201);
    }

    /**
     * Update an existing plan tier.
     */
    public function update(Request $request, AnthropicPlanTier $anthropicPlanTier): JsonResponse
    {
        $validated = $request->validate($this->validationRules($anthropicPlanTier));

        $data = $validated;
        if (isset($validated['name'])) {
            $data['slug'] = Str::slug($validated['name']);
        }

        $anthropicPlanTier->update($data);
        $anthropicPlanTier->loadCount('anthropicConfigs');

        return response()->json([
            'data' => $this->formatTier($anthropicPlanTier),
            'message' => "Plan tier \"{$anthropicPlanTier->name}\" updated successfully",
        ]);
    }

    /**
     * Delete a plan tier (only if not in use).
     */
    public function destroy(AnthropicPlanTier $anthropicPlanTier): JsonResponse
    {
        if ($anthropicPlanTier->isInUse()) {
            return response()->json([
                'message' => "Cannot delete \"{$anthropicPlanTier->name}\" — it is assigned to active project configurations",
            ], 422);
        }

        $name = $anthropicPlanTier->name;
        $anthropicPlanTier->delete();

        return response()->json([
            'message' => "Plan tier \"{$name}\" deleted successfully",
        ]);
    }

    /**
     * Reorder plan tiers.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:helpdesk_anthropic_plan_tiers,id'],
        ]);

        foreach ($validated['order'] as $index => $tierId) {
            AnthropicPlanTier::where('id', $tierId)->update(['sort_order' => $index]);
        }

        return response()->json([
            'message' => 'Plan tiers reordered successfully',
        ]);
    }

    /**
     * Validation rules for store/update.
     *
     * @return array<string, mixed>
     */
    private function validationRules(?AnthropicPlanTier $tier = null): array
    {
        $uniqueNameRule = Rule::unique('helpdesk_anthropic_plan_tiers', 'name');
        if ($tier) {
            $uniqueNameRule->ignore($tier->id);
        }

        return [
            'name' => ['required', 'string', 'max:32', $uniqueNameRule],
            'description' => ['nullable', 'string', 'max:500'],
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'included_allowance' => ['required', 'numeric', 'min:0'],
            'grace_threshold' => ['required', 'numeric', 'min:0', 'gte:included_allowance'],
            'markup_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'overage_mode' => ['required', Rule::enum(OverageMode::class)],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    /**
     * Format a tier for API response.
     *
     * @return array<string, mixed>
     */
    private function formatTier(AnthropicPlanTier $tier): array
    {
        return [
            'id' => $tier->id,
            'name' => $tier->name,
            'slug' => $tier->slug,
            'description' => $tier->description,
            'monthly_price' => $tier->monthly_price,
            'included_allowance' => $tier->included_allowance,
            'grace_threshold' => $tier->grace_threshold,
            'markup_percentage' => $tier->markup_percentage,
            'overage_mode' => $tier->overage_mode->value,
            'overage_mode_label' => $tier->overage_mode->label(),
            'sort_order' => $tier->sort_order,
            'is_active' => $tier->is_active,
            'configs_count' => $tier->anthropic_configs_count ?? 0,
            'created_at' => $tier->created_at?->toIso8601String(),
            'updated_at' => $tier->updated_at?->toIso8601String(),
        ];
    }
}
