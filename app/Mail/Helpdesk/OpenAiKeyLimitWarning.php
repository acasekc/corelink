<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OpenAiKeyLimitWarning extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public OpenAiConfig $config,
        public OpenAiApiKey $key,
        public string $type, // 'limit_reached' | 'suspended'
    ) {}

    public function envelope(): Envelope
    {
        $projectName = $this->config->project->name ?? 'Unknown Project';

        $subject = $this->type === 'suspended'
            ? "OpenAI Key Suspended — {$projectName}"
            : "OpenAI Key Limit Reached — {$projectName}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.openai-key-limit-warning',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
