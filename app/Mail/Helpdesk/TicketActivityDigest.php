<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\NotificationDigest;
use App\Models\Helpdesk\NotificationDigestEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class TicketActivityDigest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $tickets;

    public int $totalEvents;

    public int $ticketCount;

    /**
     * Create a new message instance.
     */
    public function __construct(public NotificationDigest $digest)
    {
        $this->digest->loadMissing(['events.ticket.project']);
        $this->tickets = $this->buildTickets();
        $this->totalEvents = $this->digest->events->count();
        $this->ticketCount = count($this->tickets);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $ticketLabel = $this->ticketCount === 1 ? 'ticket' : 'tickets';
        $updateLabel = $this->totalEvents === 1 ? 'update' : 'updates';

        return new Envelope(
            subject: "Helpdesk digest: {$this->totalEvents} {$updateLabel} across {$this->ticketCount} {$ticketLabel}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.ticket-activity-digest',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildTickets(): array
    {
        return $this->digest->events
            ->groupBy(fn (NotificationDigestEvent $event) => (string) ($event->ticket_id ?? $event->id))
            ->map(function (Collection $events): array {
                /** @var NotificationDigestEvent $firstEvent */
                $firstEvent = $events->first();
                $payload = $firstEvent->payload ?? [];
                $ticket = $firstEvent->ticket;

                return [
                    'ticket_id' => $firstEvent->ticket_id,
                    'ticket_number' => $payload['ticket_number'] ?? $ticket?->ticket_number ?? 'Archived Ticket',
                    'ticket_title' => $payload['ticket_title'] ?? $ticket?->title ?? 'Archived Ticket',
                    'project_name' => $payload['project_name'] ?? $ticket?->project?->name ?? 'Helpdesk',
                    'events' => $events->map(fn (NotificationDigestEvent $event) => $this->formatEvent($event))->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatEvent(NotificationDigestEvent $event): array
    {
        $payload = $event->payload ?? [];

        return match ($event->event_type) {
            'new_ticket' => [
                'type' => 'new_ticket',
                'label' => 'New ticket',
                'description' => 'A new ticket was created.',
                'meta' => trim(($payload['submitter_name'] ?? 'Unknown submitter').(($payload['submitter_email'] ?? null) ? ' · '.$payload['submitter_email'] : '')),
                'excerpt' => $payload['content_excerpt'] ?? null,
                'created_at' => $event->created_at?->format('M j, Y g:i A'),
            ],
            'status_changed' => [
                'type' => 'status_changed',
                'label' => 'Status changed',
                'description' => ($payload['old_status_title'] ?? 'Unknown').' → '.($payload['new_status_title'] ?? 'Unknown'),
                'meta' => null,
                'excerpt' => null,
                'created_at' => $event->created_at?->format('M j, Y g:i A'),
            ],
            'comment_added' => [
                'type' => 'comment_added',
                'label' => 'New comment',
                'description' => 'A new comment was added.',
                'meta' => $payload['author_name'] ?? 'Unknown author',
                'excerpt' => $payload['comment_excerpt'] ?? null,
                'created_at' => $event->created_at?->format('M j, Y g:i A'),
            ],
            default => [
                'type' => $event->event_type,
                'label' => 'Ticket update',
                'description' => $payload['summary'] ?? 'A ticket update is available.',
                'meta' => null,
                'excerpt' => null,
                'created_at' => $event->created_at?->format('M j, Y g:i A'),
            ],
        };
    }
}
