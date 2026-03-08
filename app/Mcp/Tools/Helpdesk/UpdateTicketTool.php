<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Services\Helpdesk\TicketNotificationService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateTicketTool extends Tool
{
    protected string $description = 'Update a ticket\'s status, priority, type, assignee, or time estimate. Status accepts either status_id or status (slug, title, or numeric ID).';

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
        $oldStatus = null;
        $newStatus = null;
        $statusReference = null;

        if ($request->has('status_id') || $request->has('status')) {
            $statusReference = $request->has('status_id')
                ? $request->get('status_id')
                : trim((string) $request->get('status'));

            $status = $this->resolveStatus($statusReference, $project->id);

            if (! $status) {
                return Response::error("Invalid status: {$statusReference}");
            }

            $oldStatus = $ticket->status;
            $newStatus = $status;
            $ticket->status()->associate($status);
            $updates[] = "status: {$oldStatus?->title} → {$status->title}";
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
        $ticket->refresh()->load(['status', 'priority', 'type', 'assignee']);

        // Send notification if status changed
        if ($oldStatus && $newStatus) {
            app(TicketNotificationService::class)->notifyStatusChanged($ticket, $oldStatus, $newStatus);
        }

        // Log activity for significant changes
        if ($statusReference !== null && $statusReference !== '') {
            $ticket->logActivity('status_changed', $oldStatus?->title, $newStatus?->title);
        }

        return Response::text(json_encode([
            'success' => true,
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'status' => [
                'id' => $ticket->status?->id,
                'name' => $ticket->status?->title,
                'title' => $ticket->status?->title,
                'slug' => $ticket->status?->slug,
            ],
            'updates' => $updates,
        ], JSON_PRETTY_PRINT));
    }

    private function resolveStatus(mixed $statusReference, int $projectId): ?TicketStatus
    {
        if ($statusReference === null || $statusReference === '') {
            return null;
        }

        $query = TicketStatus::query()
            ->where(fn ($builder) => $builder->where('project_id', $projectId)->orWhereNull('project_id'));

        if (is_numeric($statusReference)) {
            return $query->whereKey((int) $statusReference)->first();
        }

        $normalizedReference = $this->normalizeStatusReference((string) $statusReference);

        return $query->get()->first(function (TicketStatus $status) use ($normalizedReference) {
            $normalizedSlug = $this->normalizeStatusReference($status->slug ?? '');
            $normalizedTitle = $this->normalizeStatusReference($status->title);

            return $normalizedReference === $normalizedSlug
                || $normalizedReference === $normalizedTitle;
        });
    }

    private function normalizeStatusReference(string $value): string
    {
        return Str::of($value)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->trim()
            ->replace(' ', '-')
            ->value();
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
            'status' => $schema->string()
                ->description('Alternative status reference. Accepts a status slug, title, or numeric ID from list_statuses'),
            'priority_id' => $schema->integer()
                ->description('New priority ID for the ticket'),
            'type_id' => $schema->integer()
                ->description('New type ID for the ticket'),
            'assignee_id' => $schema->integer()
                ->nullable()
                ->description('New assignee user ID (use null to unassign)'),
            'time_estimate_minutes' => $schema->integer()
                ->description('Time estimate in minutes'),
            'title' => $schema->string()
                ->description('New title for the ticket'),
        ];
    }
}
