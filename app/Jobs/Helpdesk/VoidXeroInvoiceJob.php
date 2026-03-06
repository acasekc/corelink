<?php

namespace App\Jobs\Helpdesk;

use App\Models\Helpdesk\Invoice;
use App\Services\Helpdesk\XeroService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class VoidXeroInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public int $invoiceId
    ) {}

    public function handle(XeroService $xeroService): void
    {
        $invoice = Invoice::query()->find($this->invoiceId);

        if (! $invoice || ! $invoice->xero_invoice_id) {
            return;
        }

        $xeroService->voidInvoice($invoice);
    }
}
