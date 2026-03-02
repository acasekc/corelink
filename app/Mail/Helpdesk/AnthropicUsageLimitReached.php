<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnthropicUsageLimitReached extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AnthropicApiConfig $config,
    ) {}

    public function envelope(): Envelope
    {
        $projectName = $this->config->project->name ?? 'Unknown Project';

        return new Envelope(
            subject: "API Usage Limit Reached — {$projectName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.anthropic-usage-limit-reached',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
