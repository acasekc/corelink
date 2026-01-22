<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\HourlyRateCategory;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeEntryController extends Controller
{
    /**
     * List time entries for a ticket
     */
    public function index(Ticket $ticket): JsonResponse
    {
        $ticket->load('timeEntries.user', 'timeEntries.hourlyRateCategory');

        return response()->json([
            'data' => $ticket->timeEntries->map(fn ($entry) => $this->formatTimeEntry($entry)),
            'summary' => [
                'total_minutes' => $ticket->total_time_spent,
                'total_formatted' => $ticket->formatted_time_spent,
                'estimate_minutes' => $ticket->time_estimate_minutes,
                'estimate_formatted' => $ticket->formatted_time_estimate,
            ],
        ]);
    }

    /**
     * Get available rate categories for time entry billing
     */
    public function categories(): JsonResponse
    {
        $categories = HourlyRateCategory::active()->ordered()->get();

        return response()->json([
            'data' => $categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ]),
        ]);
    }

    /**
     * Add a new time entry
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'time_spent' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date_worked' => ['nullable', 'date'],
            'hourly_rate_category_id' => ['nullable', 'exists:helpdesk_hourly_rate_categories,id'],
            'is_billable' => ['nullable', 'boolean'],
        ]);

        $minutes = TimeEntry::parseTimeString($validated['time_spent']);

        if ($minutes <= 0) {
            return response()->json([
                'message' => 'Invalid time format. Use format like: 2w 4d 6h 45m',
            ], 422);
        }

        $isBillable = $validated['is_billable'] ?? true;
        $billableMinutes = $isBillable ? TimeEntry::calculateBillableMinutes($minutes) : 0;

        $timeEntry = $ticket->timeEntries()->create([
            'user_id' => $request->user()->id,
            'minutes' => $minutes,
            'description' => $validated['description'] ?? null,
            'date_worked' => $validated['date_worked'] ?? now()->toDateString(),
            'hourly_rate_category_id' => $validated['hourly_rate_category_id'] ?? null,
            'is_billable' => $isBillable,
            'billable_minutes' => $billableMinutes,
        ]);

        $ticket->logActivity(
            'time_logged',
            null,
            TimeEntry::formatMinutes($minutes),
            $request->user()->id
        );

        return response()->json([
            'data' => $this->formatTimeEntry($timeEntry->load('user', 'hourlyRateCategory')),
            'message' => 'Time entry added successfully',
            'summary' => [
                'total_minutes' => $ticket->fresh()->total_time_spent,
                'total_formatted' => $ticket->fresh()->formatted_time_spent,
            ],
        ], 201);
    }

    /**
     * Update a time entry
     */
    public function update(Request $request, Ticket $ticket, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->ticket_id !== $ticket->id) {
            return response()->json([
                'message' => 'Time entry does not belong to this ticket',
            ], 404);
        }

        // Cannot edit invoiced time entries
        if ($timeEntry->is_invoiced) {
            return response()->json([
                'message' => 'Cannot edit time entries that have been invoiced',
            ], 422);
        }

        $validated = $request->validate([
            'time_spent' => ['sometimes', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date_worked' => ['nullable', 'date'],
            'hourly_rate_category_id' => ['nullable', 'exists:helpdesk_hourly_rate_categories,id'],
            'is_billable' => ['nullable', 'boolean'],
        ]);

        $updateData = [];

        if (isset($validated['time_spent'])) {
            $minutes = TimeEntry::parseTimeString($validated['time_spent']);
            if ($minutes <= 0) {
                return response()->json([
                    'message' => 'Invalid time format. Use format like: 2w 4d 6h 45m',
                ], 422);
            }
            $updateData['minutes'] = $minutes;
        }

        if (array_key_exists('description', $validated)) {
            $updateData['description'] = $validated['description'];
        }

        if (array_key_exists('date_worked', $validated)) {
            $updateData['date_worked'] = $validated['date_worked'];
        }

        if (array_key_exists('hourly_rate_category_id', $validated)) {
            $updateData['hourly_rate_category_id'] = $validated['hourly_rate_category_id'];
        }

        if (array_key_exists('is_billable', $validated)) {
            $updateData['is_billable'] = $validated['is_billable'];
        }

        // Recalculate billable minutes if time or billable status changed
        if (isset($updateData['minutes']) || isset($updateData['is_billable'])) {
            $minutes = $updateData['minutes'] ?? $timeEntry->minutes;
            $isBillable = $updateData['is_billable'] ?? $timeEntry->is_billable;
            $updateData['billable_minutes'] = $isBillable ? TimeEntry::calculateBillableMinutes($minutes) : 0;
        }

        $timeEntry->update($updateData);

        return response()->json([
            'data' => $this->formatTimeEntry($timeEntry->fresh('user', 'hourlyRateCategory')),
            'message' => 'Time entry updated successfully',
            'summary' => [
                'total_minutes' => $ticket->fresh()->total_time_spent,
                'total_formatted' => $ticket->fresh()->formatted_time_spent,
            ],
        ]);
    }

    /**
     * Delete a time entry
     */
    public function destroy(Request $request, Ticket $ticket, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->ticket_id !== $ticket->id) {
            return response()->json([
                'message' => 'Time entry does not belong to this ticket',
            ], 404);
        }

        // Cannot delete invoiced time entries
        if ($timeEntry->is_invoiced) {
            return response()->json([
                'message' => 'Cannot delete time entries that have been invoiced',
            ], 422);
        }

        $formattedTime = $timeEntry->formatted_time;
        $timeEntry->delete();

        $ticket->logActivity(
            'time_removed',
            $formattedTime,
            null,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Time entry deleted successfully',
            'summary' => [
                'total_minutes' => $ticket->fresh()->total_time_spent,
                'total_formatted' => $ticket->fresh()->formatted_time_spent,
            ],
        ]);
    }

    private function formatTimeEntry(TimeEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'minutes' => $entry->minutes,
            'formatted_time' => $entry->formatted_time,
            'description' => $entry->description,
            'date_worked' => $entry->date_worked?->toDateString(),
            'user' => $entry->user ? [
                'id' => $entry->user->id,
                'name' => $entry->user->name,
            ] : null,
            'hourly_rate_category' => $entry->hourlyRateCategory ? [
                'id' => $entry->hourlyRateCategory->id,
                'name' => $entry->hourlyRateCategory->name,
                'slug' => $entry->hourlyRateCategory->slug,
            ] : null,
            'is_billable' => $entry->is_billable,
            'billable_minutes' => $entry->billable_minutes,
            'formatted_billable_time' => $entry->billable_minutes ? TimeEntry::formatMinutes($entry->billable_minutes) : null,
            'is_invoiced' => $entry->is_invoiced,
            'created_at' => $entry->created_at->toIso8601String(),
            'updated_at' => $entry->updated_at->toIso8601String(),
        ];
    }
}
