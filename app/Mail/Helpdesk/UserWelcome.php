<?php

namespace App\Mail\Helpdesk;

use App\Models\Helpdesk\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $password,
        public ?Project $project = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Corelink Helpdesk - Your Account Details',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.helpdesk.user-welcome',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
