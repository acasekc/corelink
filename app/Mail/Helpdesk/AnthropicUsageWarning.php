<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnthropicUsageWarning extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AnthropicApiConfig $config,
    ) {}

    public function envelope(): Envelope
    {
        $projectName = $this->config->project->name ?? 'Unknown Project';

        return new Envelope(
            subject: "API Usage Warning — {$projectName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.anthropic-usage-warning',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
