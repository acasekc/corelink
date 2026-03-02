<?php

namespace App\Mail\Helpdesk;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AnthropicWeeklyDigest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  Collection<int, array<string, mixed>>  $summaries
     */
    public function __construct(
        public Collection $summaries,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Anthropic API — Weekly Usage Digest',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.anthropic-weekly-digest',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
