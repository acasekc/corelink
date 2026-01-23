<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListTicketsTool extends Tool
{
    protected string $description = 'List tickets for the project. Can filter by status, priority, type, or assignee.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $query = $project->tickets()
            ->with(['status', 'priority', 'type', 'assignee', 'labels']);

        // Apply filters
        if ($statusId = $request->get('status_id')) {
            $query->where('status_id', $statusId);
        }

        if ($priorityId = $request->get('priority_id')) {
            $query->where('priority_id', $priorityId);
        }

        if ($typeId = $request->get('type_id')) {
            $query->where('type_id', $typeId);
        }

        if ($assigneeId = $request->get('assignee_id')) {
            $query->where('assignee_id', $assigneeId);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $limit = min($request->get('limit', 25), 100);
        $tickets = $query->orderByDesc('created_at')->limit($limit)->get();

        $result = $tickets->map(fn ($ticket) => [
            'id' => $ticket->id,
            'number' => $ticket->ticket_number,
            'title' => $ticket->title,
            'status' => $ticket->status?->title,
            'priority' => $ticket->priority?->title,
            'type' => $ticket->type?->title,
            'assignee' => $ticket->assignee?->name,
            'labels' => $ticket->labels->pluck('name')->toArray(),
            'submitter_name' => $ticket->submitter_name,
            'submitter_email' => $ticket->submitter_email,
            'time_estimate_minutes' => $ticket->time_estimate_minutes,
            'total_time_spent' => $ticket->total_time_spent,
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
        ]);

        return Response::text(json_encode([
            'count' => $tickets->count(),
            'tickets' => $result,
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'status_id' => $schema->integer()
                ->description('Filter by status ID'),
            'priority_id' => $schema->integer()
                ->description('Filter by priority ID'),
            'type_id' => $schema->integer()
                ->description('Filter by type ID'),
            'assignee_id' => $schema->integer()
                ->description('Filter by assignee user ID'),
            'search' => $schema->string()
                ->description('Search in title and content'),
            'limit' => $schema->integer()
                ->description('Maximum number of tickets to return (default 25, max 100)'),
        ];
    }
}
