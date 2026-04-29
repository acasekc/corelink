<?php

namespace App\Mail;

use App\Models\ClientIntakeInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IntakeInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ClientIntakeInvite $invite) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Let's get your project started — CoreLink intake",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.intake-invite',
            with: [
                'invite' => $this->invite,
                'url' => $this->invite->publicUrl(),
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
