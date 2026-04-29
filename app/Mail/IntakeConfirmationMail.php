<?php

namespace App\Mail;

use App\Models\ClientIntake;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IntakeConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ClientIntake $intake) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We received your project intake',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.intake-confirmation',
            with: [
                'intake' => $this->intake,
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
