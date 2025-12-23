<?php

namespace App\Mail;

use App\Models\BotSession;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanReadyMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public BotSession $session,
        public array $userSummary
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Project Discovery Summary is Ready!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.plan-ready',
            with: [
                'session' => $this->session,
                'summary' => $this->userSummary,
                'projectName' => $this->userSummary['project_name'] ?? 'Your Project',
                'overview' => $this->userSummary['overview'] ?? '',
                'keyFeatures' => $this->userSummary['key_features'] ?? [],
                'nextSteps' => $this->userSummary['next_steps'] ?? '',
            ],
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
}
