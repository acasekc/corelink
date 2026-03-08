<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TimeEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Throwable;

class EndTimeEntrySessionTool extends Tool
{
    protected string $description = 'End a tracked work session for a ticket and automatically record the elapsed time.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $timeEntry = $this->resolveTimeEntry($request, $project->id);

        if (! $timeEntry) {
            return Response::error('No active work session found. Provide a valid time_entry_id or ticket_id for an active session.');
        }

        if (! $timeEntry->started_at) {
            return Response::error('This time entry does not have a recorded start time and cannot be ended as a tracked session.');
        }

        if ($timeEntry->ended_at) {
            return Response::error('This work session has already been ended.');
        }

        try {
            $endedAt = $request->get('ended_at')
                ? Carbon::parse((string) $request->get('ended_at'))
                : now();
        } catch (Throwable) {
            return Response::error('Invalid ended_at value. Use an ISO 8601 datetime, such as 2026-03-07T15:00:00Z.');
        }

        if ($endedAt->lt($timeEntry->started_at)) {
            return Response::error('ended_at must be after the work session started.');
        }

        $minutes = TimeEntry::calculateTrackedMinutes($timeEntry->started_at, $endedAt);
        $description = $request->get('description') ?: $timeEntry->description;

        $timeEntry->update([
            'minutes' => $minutes,
            'description' => $description,
            'ended_at' => $endedAt,
            'billable_minutes' => $timeEntry->is_billable ? $minutes : 0,
        ]);

        $ticket = $timeEntry->ticket;
        $ticket->logActivity('time_logged', null, TimeEntry::formatMinutes($minutes));

        $freshTicket = $ticket->fresh();

        return Response::text(json_encode([
            'success' => true,
            'message' => 'Work session ended and time logged successfully.',
            'time_entry' => [
                'id' => $timeEntry->id,
                'ticket_id' => $timeEntry->ticket_id,
                'minutes' => $timeEntry->minutes,
                'formatted' => TimeEntry::formatMinutes($timeEntry->minutes),
                'description' => $timeEntry->description,
                'started_at' => $timeEntry->started_at?->toIso8601String(),
                'ended_at' => $timeEntry->ended_at?->toIso8601String(),
                'date_worked' => $timeEntry->date_worked?->toDateString(),
                'is_billable' => $timeEntry->is_billable,
            ],
            'ticket_total_time' => [
                'minutes' => $freshTicket->total_time_spent,
                'formatted' => $freshTicket->formatted_time_spent,
            ],
        ], JSON_PRETTY_PRINT));
    }

    private function resolveTimeEntry(Request $request, int $projectId): ?TimeEntry
    {
        $timeEntryId = $request->get('time_entry_id');

        if ($timeEntryId) {
            return TimeEntry::query()
                ->whereKey($timeEntryId)
                ->whereHas('ticket', fn ($query) => $query->where('project_id', $projectId))
                ->with('ticket')
                ->first();
        }

        $ticketId = $request->get('ticket_id');

        if (! $ticketId) {
            return null;
        }

        return TimeEntry::query()
            ->where('ticket_id', $ticketId)
            ->whereNotNull('started_at')
            ->whereNull('ended_at')
            ->whereHas('ticket', fn ($query) => $query->where('project_id', $projectId))
            ->with('ticket')
            ->latest('started_at')
            ->first();
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'time_entry_id' => $schema->integer()
                ->description('The active time entry session to end. Preferred when available.'),
            'ticket_id' => $schema->integer()
                ->description('The ticket ID to end the current active work session for. Use this when there is only one active session on the ticket.'),
            'description' => $schema->string()
                ->description('Optional final description of the work completed. This replaces an empty or draft description on the time entry.'),
            'ended_at' => $schema->string()
                ->description('Optional ISO 8601 datetime for when the work ended. Defaults to now.'),
        ];
    }
}
