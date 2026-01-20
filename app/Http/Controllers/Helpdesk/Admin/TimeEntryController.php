<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
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
        $ticket->load('timeEntries.user');

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
     * Add a new time entry
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'time_spent' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date_worked' => ['nullable', 'date'],
        ]);

        $minutes = TimeEntry::parseTimeString($validated['time_spent']);

        if ($minutes <= 0) {
            return response()->json([
                'message' => 'Invalid time format. Use format like: 2w 4d 6h 45m',
            ], 422);
        }

        $timeEntry = $ticket->timeEntries()->create([
            'user_id' => $request->user()->id,
            'minutes' => $minutes,
            'description' => $validated['description'] ?? null,
            'date_worked' => $validated['date_worked'] ?? now()->toDateString(),
        ]);

        $ticket->logActivity(
            'time_logged',
            null,
            TimeEntry::formatMinutes($minutes),
            $request->user()->id
        );

        return response()->json([
            'data' => $this->formatTimeEntry($timeEntry->load('user')),
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

        $validated = $request->validate([
            'time_spent' => ['sometimes', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date_worked' => ['nullable', 'date'],
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

        $timeEntry->update($updateData);

        return response()->json([
            'data' => $this->formatTimeEntry($timeEntry->fresh('user')),
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
            'created_at' => $entry->created_at->toIso8601String(),
            'updated_at' => $entry->updated_at->toIso8601String(),
        ];
    }
}
