<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnthropicUsageAdminAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AnthropicApiConfig $config,
        public string $alertType,
    ) {}

    public function envelope(): Envelope
    {
        $projectName = $this->config->project->name ?? 'Unknown Project';
        $typeLabel = $this->alertType === 'limit_reached' ? 'LIMIT REACHED' : 'Usage Warning';

        return new Envelope(
            subject: "[Admin] Anthropic {$typeLabel} — {$projectName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.anthropic-usage-admin-alert',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
