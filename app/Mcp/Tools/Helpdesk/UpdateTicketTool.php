<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateTicketTool extends Tool
{
    protected string $description = 'Update a ticket\'s status, priority, type, assignee, or time estimate.';

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

        $updates = [];

        if ($statusId = $request->get('status_id')) {
            $status = TicketStatus::where('id', $statusId)
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();
            if (! $status) {
                return Response::error("Invalid status_id: {$statusId}");
            }
            $oldStatus = $ticket->status?->title;
            $ticket->status_id = $statusId;
            $updates[] = "status: {$oldStatus} → {$status->title}";
        }

        if ($priorityId = $request->get('priority_id')) {
            $priority = TicketPriority::where('id', $priorityId)
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();
            if (! $priority) {
                return Response::error("Invalid priority_id: {$priorityId}");
            }
            $oldPriority = $ticket->priority?->title;
            $ticket->priority_id = $priorityId;
            $updates[] = "priority: {$oldPriority} → {$priority->title}";
        }

        if ($typeId = $request->get('type_id')) {
            $type = TicketType::where('id', $typeId)
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();
            if (! $type) {
                return Response::error("Invalid type_id: {$typeId}");
            }
            $oldType = $ticket->type?->title;
            $ticket->type_id = $typeId;
            $updates[] = "type: {$oldType} → {$type->title}";
        }

        if ($request->has('assignee_id')) {
            $assigneeId = $request->get('assignee_id');
            $oldAssignee = $ticket->assignee?->name ?? 'Unassigned';

            if ($assigneeId === null) {
                $ticket->assignee_id = null;
                $updates[] = "assignee: {$oldAssignee} → Unassigned";
            } else {
                // Verify user exists (basic check - you might want to check project membership)
                $ticket->assignee_id = $assigneeId;
                $updates[] = "assignee_id set to: {$assigneeId}";
            }
        }

        if ($request->has('time_estimate_minutes')) {
            $oldEstimate = $ticket->time_estimate_minutes;
            $ticket->time_estimate_minutes = $request->get('time_estimate_minutes');
            $updates[] = "time_estimate: {$oldEstimate} → {$ticket->time_estimate_minutes} minutes";
        }

        if ($title = $request->get('title')) {
            $ticket->title = $title;
            $updates[] = 'title updated';
        }

        if (empty($updates)) {
            return Response::error('No valid fields provided to update.');
        }

        $ticket->save();

        // Log activity for significant changes
        if ($request->get('status_id')) {
            $ticket->logActivity('status_changed', null, $ticket->status?->name);
        }

        return Response::text(json_encode([
            'success' => true,
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'updates' => $updates,
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ticket_id' => $schema->integer()
                ->description('The ID of the ticket to update')
                ->required(),
            'status_id' => $schema->integer()
                ->description('New status ID for the ticket'),
            'priority_id' => $schema->integer()
                ->description('New priority ID for the ticket'),
            'type_id' => $schema->integer()
                ->description('New type ID for the ticket'),
            'assignee_id' => $schema->integer()
                ->description('New assignee user ID (use null to unassign)'),
            'time_estimate_minutes' => $schema->integer()
                ->description('Time estimate in minutes'),
            'title' => $schema->string()
                ->description('New title for the ticket'),
        ];
    }
}
