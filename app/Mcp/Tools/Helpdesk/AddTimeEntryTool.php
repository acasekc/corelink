<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TimeEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class AddTimeEntryTool extends Tool
{
    protected string $description = 'Log time spent on a ticket. Time can be specified in minutes or using shorthand like "1h 30m", "2h", "45m".';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $ticketId = $request->get('ticket_id');
        $ticket = $project->tickets()->find($ticketId);

        if (! $ticket) {
            return Response::error("Ticket not found with ID: {$ticketId}");
        }

        // Parse time - accept either minutes or time string
        $minutes = $request->get('minutes');
        $timeString = $request->get('time');

        if ($timeString) {
            $minutes = $this->parseTimeString($timeString);
            if ($minutes === null) {
                return Response::error("Could not parse time string: {$timeString}. Use formats like '1h 30m', '2h', '45m', or '90'.");
            }
        }

        if (! $minutes || $minutes <= 0) {
            return Response::error('Time must be greater than 0 minutes.');
        }

        $dateWorked = $request->get('date_worked') ?? now()->toDateString();

        $timeEntry = $ticket->timeEntries()->create([
            'minutes' => $minutes,
            'description' => $request->get('description'),
            'date_worked' => $dateWorked,
            'is_billable' => $request->get('is_billable', true),
            'billable_minutes' => $request->get('is_billable', true) ? $minutes : 0,
        ]);

        // Log activity
        $ticket->logActivity('time_logged', null, TimeEntry::formatMinutes($minutes));

        return Response::text(json_encode([
            'success' => true,
            'time_entry' => [
                'id' => $timeEntry->id,
                'minutes' => $timeEntry->minutes,
                'formatted' => TimeEntry::formatMinutes($timeEntry->minutes),
                'description' => $timeEntry->description,
                'date_worked' => $timeEntry->date_worked->toDateString(),
                'is_billable' => $timeEntry->is_billable,
                'created_at' => $timeEntry->created_at->toIso8601String(),
            ],
            'ticket_total_time' => [
                'minutes' => $ticket->fresh()->total_time_spent,
                'formatted' => $ticket->fresh()->formatted_time_spent,
            ],
        ], JSON_PRETTY_PRINT));
    }

    /**
     * Parse a time string like "1h 30m", "2h", "45m" into minutes.
     */
    private function parseTimeString(string $time): ?int
    {
        // If it's just a number, treat as minutes
        if (is_numeric($time)) {
            return (int) $time;
        }

        $minutes = 0;
        $time = strtolower(trim($time));

        // Match hours
        if (preg_match('/(\d+(?:\.\d+)?)\s*h/', $time, $matches)) {
            $minutes += (float) $matches[1] * 60;
        }

        // Match minutes
        if (preg_match('/(\d+)\s*m/', $time, $matches)) {
            $minutes += (int) $matches[1];
        }

        return $minutes > 0 ? (int) $minutes : null;
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ticket_id' => $schema->integer()
                ->description('The ID of the ticket to log time for')
                ->required(),
            'time' => $schema->string()
                ->description('Time spent in shorthand format like "1h 30m", "2h", "45m"'),
            'minutes' => $schema->integer()
                ->description('Time spent in minutes (alternative to time parameter)'),
            'description' => $schema->string()
                ->description('Description of work done'),
            'date_worked' => $schema->string()
                ->description('Date the work was done (YYYY-MM-DD format, defaults to today)'),
            'is_billable' => $schema->boolean()
                ->description('Whether this time is billable (default: true)'),
        ];
    }
}
