<?php

namespace App\Services\Helpdesk;

use App\Jobs\Helpdesk\DispatchWebhookJob;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;

class WebhookService
{
    public const EVENT_TICKET_CREATED = 'ticket.created';

    public const EVENT_TICKET_UPDATED = 'ticket.updated';

    public const EVENT_TICKET_STATUS_CHANGED = 'ticket.status_changed';

    public const EVENT_TICKET_ASSIGNED = 'ticket.assigned';

    public const EVENT_COMMENT_CREATED = 'comment.created';

    /**
     * Get all available webhook events
     */
    public static function getAvailableEvents(): array
    {
        return [
            self::EVENT_TICKET_CREATED => 'Ticket Created',
            self::EVENT_TICKET_UPDATED => 'Ticket Updated',
            self::EVENT_TICKET_STATUS_CHANGED => 'Ticket Status Changed',
            self::EVENT_TICKET_ASSIGNED => 'Ticket Assigned',
            self::EVENT_COMMENT_CREATED => 'Comment Created',
        ];
    }

    /**
     * Dispatch webhooks for a project event
     */
    public function dispatch(Project $project, string $event, array $payload): void
    {
        $webhooks = $project->webhooks()
            ->where('is_active', true)
            ->get();

        foreach ($webhooks as $webhook) {
            if ($webhook->shouldTriggerFor($event)) {
                DispatchWebhookJob::dispatch($webhook, $event, $payload);
            }
        }
    }

    /**
     * Dispatch ticket created webhooks
     */
    public function ticketCreated(Ticket $ticket): void
    {
        $payload = $this->formatTicketPayload($ticket);
        $this->dispatch($ticket->project, self::EVENT_TICKET_CREATED, $payload);
    }

    /**
     * Dispatch ticket updated webhooks
     */
    public function ticketUpdated(Ticket $ticket, array $changes = []): void
    {
        $payload = $this->formatTicketPayload($ticket);
        $payload['changes'] = $changes;
        $this->dispatch($ticket->project, self::EVENT_TICKET_UPDATED, $payload);
    }

    /**
     * Dispatch ticket status changed webhooks
     */
    public function ticketStatusChanged(Ticket $ticket, ?string $oldStatus, string $newStatus): void
    {
        $payload = $this->formatTicketPayload($ticket);
        $payload['old_status'] = $oldStatus;
        $payload['new_status'] = $newStatus;
        $this->dispatch($ticket->project, self::EVENT_TICKET_STATUS_CHANGED, $payload);
    }

    /**
     * Dispatch ticket assigned webhooks
     */
    public function ticketAssigned(Ticket $ticket, ?int $oldAssigneeId, ?int $newAssigneeId): void
    {
        $payload = $this->formatTicketPayload($ticket);
        $payload['old_assignee_id'] = $oldAssigneeId;
        $payload['new_assignee_id'] = $newAssigneeId;
        $this->dispatch($ticket->project, self::EVENT_TICKET_ASSIGNED, $payload);
    }

    /**
     * Dispatch comment created webhooks
     */
    public function commentCreated(Comment $comment): void
    {
        $ticket = $comment->ticket;
        $payload = [
            'event' => self::EVENT_COMMENT_CREATED,
            'timestamp' => now()->toIso8601String(),
            'ticket' => $this->formatTicketPayload($ticket),
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'is_internal' => $comment->is_internal,
                'user' => $comment->user ? [
                    'id' => $comment->user_id,
                    'name' => $comment->user->name,
                    'email' => $comment->user->email,
                ] : null,
                'created_at' => $comment->created_at->toIso8601String(),
            ],
        ];
        $this->dispatch($ticket->project, self::EVENT_COMMENT_CREATED, $payload);
    }

    /**
     * Format ticket data for webhook payload
     */
    protected function formatTicketPayload(Ticket $ticket): array
    {
        $ticket->loadMissing(['status', 'priority', 'type', 'assignee', 'project']);

        return [
            'event' => 'ticket',
            'timestamp' => now()->toIso8601String(),
            'ticket' => [
                'id' => $ticket->id,
                'number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'content' => $ticket->content,
                'status' => $ticket->status?->slug,
                'priority' => $ticket->priority?->slug,
                'type' => $ticket->type?->slug,
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee_id,
                    'name' => $ticket->assignee->name,
                    'email' => $ticket->assignee->email,
                ] : null,
                'submitter' => [
                    'name' => $ticket->submitter_name,
                    'email' => $ticket->submitter_email,
                    'user_id' => $ticket->submitter_user_id,
                ],
                'metadata' => $ticket->metadata,
                'created_at' => $ticket->created_at->toIso8601String(),
                'updated_at' => $ticket->updated_at->toIso8601String(),
            ],
            'project' => [
                'id' => $ticket->project_id,
                'name' => $ticket->project->name,
                'slug' => $ticket->project->slug,
            ],
        ];
    }
}
