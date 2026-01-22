<?php

namespace App\Services\Helpdesk;

use App\Models\Helpdesk\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoicePdfService
{
    /**
     * Generate a PDF for an invoice.
     */
    public function generate(Invoice $invoice): \Barryvdh\DomPDF\PDF
    {
        $invoice->load([
            'project',
            'lineItems.category',
            'lineItems.billableItem',
            'lineItems.timeEntries.ticket:id,number,title',
            'payments',
        ]);

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'project' => $invoice->project,
        ])->setPaper('letter');
    }

    /**
     * Generate and stream the PDF for download.
     */
    public function download(Invoice $invoice): \Symfony\Component\HttpFoundation\Response
    {
        $pdf = $this->generate($invoice);
        $filename = $this->getFilename($invoice);

        return $pdf->download($filename);
    }

    /**
     * Generate and stream the PDF for inline viewing.
     */
    public function stream(Invoice $invoice): \Symfony\Component\HttpFoundation\Response
    {
        $pdf = $this->generate($invoice);
        $filename = $this->getFilename($invoice);

        return $pdf->stream($filename);
    }

    /**
     * Save the PDF to storage and return the path.
     */
    public function save(Invoice $invoice, string $disk = 'local'): string
    {
        $pdf = $this->generate($invoice);
        $filename = $this->getFilename($invoice);
        $path = 'invoices/'.$invoice->project_id.'/'.$filename;

        Storage::disk($disk)->put($path, $pdf->output());

        return $path;
    }

    /**
     * Get the filename for the invoice PDF.
     */
    private function getFilename(Invoice $invoice): string
    {
        return sprintf(
            'Invoice-%s-%s.pdf',
            $invoice->invoice_number,
            $invoice->created_at->format('Y-m-d')
        );
    }
}
