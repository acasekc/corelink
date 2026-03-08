<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Throwable;

class StartTimeEntrySessionTool extends Tool
{
    protected string $description = 'Start a tracked work session for a ticket. Use this when work begins so time can be recorded with exact start and end times.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $ticketId = $request->get('ticket_id');
        $ticket = $project->tickets()->with('timeEntries')->find($ticketId);

        if (! $ticket) {
            return Response::error("Ticket not found with ID: {$ticketId}");
        }

        $activeEntry = $ticket->timeEntries()
            ->whereNotNull('started_at')
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();

        if ($activeEntry) {
            return Response::error('This ticket already has an active work session. End that session before starting a new one.');
        }

        try {
            $startedAt = $request->get('started_at')
                ? Carbon::parse((string) $request->get('started_at'))
                : now();
        } catch (Throwable) {
            return Response::error('Invalid started_at value. Use an ISO 8601 datetime, such as 2026-03-07T14:30:00Z.');
        }

        $timeEntry = $ticket->timeEntries()->create([
            'minutes' => 0,
            'description' => $request->get('description'),
            'date_worked' => $startedAt->toDateString(),
            'started_at' => $startedAt,
            'ended_at' => null,
            'is_billable' => $request->get('is_billable', true),
            'billable_minutes' => 0,
        ]);

        $ticket->logActivity('time_tracking_started', null, $startedAt->toIso8601String());

        return Response::text(json_encode([
            'success' => true,
            'message' => 'Work session started. Call end_time_entry_session when the work is complete.',
            'time_entry' => [
                'id' => $timeEntry->id,
                'ticket_id' => $ticket->id,
                'description' => $timeEntry->description,
                'started_at' => $timeEntry->started_at?->toIso8601String(),
                'is_billable' => $timeEntry->is_billable,
                'status' => 'active',
            ],
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ticket_id' => $schema->integer()
                ->description('The ID of the ticket to start tracking work on')
                ->required(),
            'description' => $schema->string()
                ->description('Optional description of the work you are starting'),
            'started_at' => $schema->string()
                ->description('Optional ISO 8601 datetime for when the work started. Defaults to now.'),
            'is_billable' => $schema->boolean()
                ->description('Whether this tracked session should be billable (default: true)'),
        ];
    }
}
