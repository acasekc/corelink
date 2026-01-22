<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\HourlyRateCategory;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\ProjectHourlyRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectHourlyRateController extends Controller
{
    /**
     * List all hourly rates for a project
     */
    public function index(Project $project): JsonResponse
    {
        $rates = $project->hourlyRates()
            ->with('category')
            ->orderBy('effective_from', 'desc')
            ->get();

        // Also get active categories with their current rates
        $categories = HourlyRateCategory::active()->ordered()->get();
        $currentRates = [];
        $today = now()->toDateString();

        foreach ($categories as $category) {
            $currentRate = ProjectHourlyRate::getEffectiveRate($project->id, $category->id, $today);
            $currentRates[] = [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'current_rate' => $currentRate,
            ];
        }

        return response()->json([
            'data' => $rates->map(fn ($rate) => $this->formatRate($rate)),
            'current_rates' => $currentRates,
        ]);
    }

    /**
     * Set or update an hourly rate for a project/category
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:helpdesk_hourly_rate_categories,id'],
            'rate' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
        ]);

        $effectiveFrom = $validated['effective_from'] ?? now()->toDateString();

        // End the previous rate if setting a new one without explicit effective_to
        if (empty($validated['effective_to'])) {
            $previousRate = $project->hourlyRates()
                ->where('category_id', $validated['category_id'])
                ->whereNull('effective_to')
                ->where('effective_from', '<', $effectiveFrom)
                ->first();

            if ($previousRate) {
                $previousRate->update([
                    'effective_to' => date('Y-m-d', strtotime($effectiveFrom) - 86400),
                ]);
            }
        }

        $rate = $project->hourlyRates()->create([
            'category_id' => $validated['category_id'],
            'rate' => $validated['rate'],
            'effective_from' => $effectiveFrom,
            'effective_to' => $validated['effective_to'] ?? null,
        ]);

        return response()->json([
            'data' => $this->formatRate($rate->load('category')),
            'message' => 'Hourly rate set successfully',
        ], 201);
    }

    /**
     * Update an hourly rate
     */
    public function update(Request $request, Project $project, ProjectHourlyRate $hourlyRate): JsonResponse
    {
        if ($hourlyRate->project_id !== $project->id) {
            return response()->json(['message' => 'Rate not found'], 404);
        }

        $validated = $request->validate([
            'rate' => ['sometimes', 'numeric', 'min:0'],
            'effective_from' => ['sometimes', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
        ]);

        $hourlyRate->update($validated);

        return response()->json([
            'data' => $this->formatRate($hourlyRate->fresh('category')),
            'message' => 'Hourly rate updated successfully',
        ]);
    }

    /**
     * Delete an hourly rate
     */
    public function destroy(Project $project, ProjectHourlyRate $hourlyRate): JsonResponse
    {
        if ($hourlyRate->project_id !== $project->id) {
            return response()->json(['message' => 'Rate not found'], 404);
        }

        $hourlyRate->delete();

        return response()->json([
            'message' => 'Hourly rate deleted successfully',
        ]);
    }

    /**
     * Get the effective rate for a specific category
     */
    public function getEffectiveRate(Project $project, HourlyRateCategory $category): JsonResponse
    {
        $rate = ProjectHourlyRate::getEffectiveRate($project->id, $category->id, now()->toDateString());

        return response()->json([
            'data' => [
                'project_id' => $project->id,
                'category_id' => $category->id,
                'category_name' => $category->name,
                'effective_rate' => $rate,
            ],
        ]);
    }

    private function formatRate(ProjectHourlyRate $rate): array
    {
        return [
            'id' => $rate->id,
            'project_id' => $rate->project_id,
            'category' => $rate->category ? [
                'id' => $rate->category->id,
                'name' => $rate->category->name,
                'slug' => $rate->category->slug,
            ] : null,
            'rate' => $rate->rate,
            'effective_from' => $rate->effective_from->toDateString(),
            'effective_to' => $rate->effective_to?->toDateString(),
            'is_current' => $rate->effective_to === null && $rate->effective_from <= now(),
            'created_at' => $rate->created_at->toIso8601String(),
            'updated_at' => $rate->updated_at->toIso8601String(),
        ];
    }
}
