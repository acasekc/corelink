<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetTicketTool extends Tool
{
    protected string $description = 'Get detailed information about a specific ticket including comments and time entries.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $ticketId = $request->get('ticket_id');

        $ticket = $project->tickets()
            ->with([
                'status',
                'priority',
                'type',
                'assignee',
                'labels',
                'comments' => fn ($q) => $q->with('user')->latest()->limit(20),
                'timeEntries' => fn ($q) => $q->with('user')->latest()->limit(20),
            ])
            ->find($ticketId);

        if (! $ticket) {
            return Response::error("Ticket not found with ID: {$ticketId}");
        }

        $result = [
            'id' => $ticket->id,
            'number' => $ticket->ticket_number,
            'title' => $ticket->title,
            'content' => $ticket->content,
            'status' => [
                'id' => $ticket->status?->id,
                'name' => $ticket->status?->title,
            ],
            'priority' => [
                'id' => $ticket->priority?->id,
                'name' => $ticket->priority?->title,
            ],
            'type' => [
                'id' => $ticket->type?->id,
                'name' => $ticket->type?->title,
            ],
            'assignee' => $ticket->assignee ? [
                'id' => $ticket->assignee->id,
                'name' => $ticket->assignee->name,
                'email' => $ticket->assignee->email,
            ] : null,
            'labels' => $ticket->labels->map(fn ($l) => ['id' => $l->id, 'name' => $l->name])->toArray(),
            'submitter_name' => $ticket->submitter_name,
            'submitter_email' => $ticket->submitter_email,
            'github_issue_url' => $ticket->github_issue_url,
            'time_estimate_minutes' => $ticket->time_estimate_minutes,
            'time_estimate_formatted' => $ticket->formatted_time_estimate,
            'total_time_spent' => $ticket->total_time_spent,
            'total_time_spent_formatted' => $ticket->formatted_time_spent,
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
            'comments' => $ticket->comments->map(fn ($c) => [
                'id' => $c->id,
                'author' => $c->author_name,
                'content' => $c->content,
                'is_internal' => $c->is_internal,
                'created_at' => $c->created_at->toIso8601String(),
            ])->toArray(),
            'time_entries' => $ticket->timeEntries->map(fn ($t) => [
                'id' => $t->id,
                'user' => $t->user?->name,
                'minutes' => $t->minutes,
                'description' => $t->description,
                'date_worked' => $t->date_worked?->toDateString(),
                'is_billable' => $t->is_billable,
            ])->toArray(),
        ];

        return Response::text(json_encode($result, JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ticket_id' => $schema->integer()
                ->description('The ID of the ticket to retrieve')
                ->required(),
        ];
    }
}
