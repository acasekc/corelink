<?php

namespace App\Mail\Helpdesk;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $resetUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Helpdesk Password',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.password-reset',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
