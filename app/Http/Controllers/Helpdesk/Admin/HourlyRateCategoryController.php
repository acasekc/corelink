<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\HourlyRateCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class HourlyRateCategoryController extends Controller
{
    /**
     * List all hourly rate categories
     */
    public function index(): JsonResponse
    {
        $categories = HourlyRateCategory::ordered()->get();

        return response()->json([
            'data' => $categories->map(fn ($category) => $this->formatCategory($category)),
        ]);
    }

    /**
     * Create a new hourly rate category
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:helpdesk_hourly_rate_categories,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'default_rate' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'is_active' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $maxOrder = HourlyRateCategory::max('order') ?? 0;

        $category = HourlyRateCategory::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'default_rate' => $validated['default_rate'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'order' => $validated['order'] ?? $maxOrder + 1,
        ]);

        return response()->json([
            'data' => $this->formatCategory($category),
            'message' => 'Hourly rate category created successfully',
        ], 201);
    }

    /**
     * Show a single hourly rate category
     */
    public function show(HourlyRateCategory $hourlyRateCategory): JsonResponse
    {
        return response()->json([
            'data' => $this->formatCategory($hourlyRateCategory),
        ]);
    }

    /**
     * Update an hourly rate category
     */
    public function update(Request $request, HourlyRateCategory $hourlyRateCategory): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('helpdesk_hourly_rate_categories', 'slug')->ignore($hourlyRateCategory->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'default_rate' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'is_active' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $hourlyRateCategory->update($validated);

        return response()->json([
            'data' => $this->formatCategory($hourlyRateCategory->fresh()),
            'message' => 'Hourly rate category updated successfully',
        ]);
    }

    /**
     * Delete an hourly rate category
     */
    public function destroy(HourlyRateCategory $hourlyRateCategory): JsonResponse
    {
        // Check if category is in use
        if ($hourlyRateCategory->timeEntries()->exists() || $hourlyRateCategory->projectRates()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category that is in use. Deactivate it instead.',
            ], 422);
        }

        $hourlyRateCategory->delete();

        return response()->json([
            'message' => 'Hourly rate category deleted successfully',
        ]);
    }

    /**
     * Reorder categories
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer', 'exists:helpdesk_hourly_rate_categories,id'],
        ]);

        foreach ($validated['order'] as $position => $categoryId) {
            HourlyRateCategory::where('id', $categoryId)->update(['order' => $position]);
        }

        return response()->json([
            'message' => 'Categories reordered successfully',
        ]);
    }

    private function formatCategory(HourlyRateCategory $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'default_rate' => $category->default_rate,
            'is_active' => $category->is_active,
            'order' => $category->order,
            'usage' => [
                'time_entries_count' => $category->timeEntries()->count(),
                'project_rates_count' => $category->projectRates()->count(),
            ],
            'created_at' => $category->created_at->toIso8601String(),
            'updated_at' => $category->updated_at->toIso8601String(),
        ];
    }
}
