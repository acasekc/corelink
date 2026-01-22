<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\BillableItem;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillableItemController extends Controller
{
    /**
     * List billable items for a project
     */
    public function index(Project $project): JsonResponse
    {
        $items = $project->billableItems()->orderBy('name')->get();

        return response()->json([
            'data' => $items->map(fn ($item) => $this->formatItem($item)),
        ]);
    }

    /**
     * Create a new billable item
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'default_rate' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $item = $project->billableItems()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'default_rate' => $validated['default_rate'],
            'unit' => $validated['unit'] ?? 'each',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'data' => $this->formatItem($item),
            'message' => 'Billable item created successfully',
        ], 201);
    }

    /**
     * Show a single billable item
     */
    public function show(Project $project, BillableItem $billableItem): JsonResponse
    {
        if ($billableItem->project_id !== $project->id) {
            return response()->json(['message' => 'Billable item not found'], 404);
        }

        return response()->json([
            'data' => $this->formatItem($billableItem),
        ]);
    }

    /**
     * Update a billable item
     */
    public function update(Request $request, Project $project, BillableItem $billableItem): JsonResponse
    {
        if ($billableItem->project_id !== $project->id) {
            return response()->json(['message' => 'Billable item not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'default_rate' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $billableItem->update($validated);

        return response()->json([
            'data' => $this->formatItem($billableItem->fresh()),
            'message' => 'Billable item updated successfully',
        ]);
    }

    /**
     * Delete a billable item
     */
    public function destroy(Project $project, BillableItem $billableItem): JsonResponse
    {
        if ($billableItem->project_id !== $project->id) {
            return response()->json(['message' => 'Billable item not found'], 404);
        }

        // Check if item is in use
        if ($billableItem->invoiceLineItems()->exists()) {
            return response()->json([
                'message' => 'Cannot delete billable item that has been invoiced. Deactivate it instead.',
            ], 422);
        }

        $billableItem->delete();

        return response()->json([
            'message' => 'Billable item deleted successfully',
        ]);
    }

    private function formatItem(BillableItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'description' => $item->description,
            'default_rate' => $item->default_rate,
            'unit' => $item->unit,
            'is_active' => $item->is_active,
            'invoiced_count' => $item->invoiceLineItems()->count(),
            'created_at' => $item->created_at->toIso8601String(),
            'updated_at' => $item->updated_at->toIso8601String(),
        ];
    }
}
