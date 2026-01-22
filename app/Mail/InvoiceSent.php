<?php

namespace App\Mail;

use App\Models\Helpdesk\Invoice;
use App\Services\Helpdesk\InvoicePdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceSent extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice,
        public string $publicUrl,
        public bool $attachPdf = true
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice #'.$this->invoice->invoice_number.' from CoreLink Development',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-sent',
            with: [
                'invoice' => $this->invoice,
                'publicUrl' => $this->publicUrl,
                'projectName' => $this->invoice->project->name,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->attachPdf) {
            return [];
        }

        $pdfService = app(InvoicePdfService::class);
        $pdf = $pdfService->generate($this->invoice);

        return [
            Attachment::fromData(
                fn () => $pdf->output(),
                'Invoice-'.$this->invoice->invoice_number.'.pdf'
            )->withMime('application/pdf'),
        ];
    }
}
