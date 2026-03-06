<?php

namespace App\Jobs\Helpdesk;

use App\Models\Helpdesk\InvoicePayment;
use App\Services\Helpdesk\XeroService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncPaymentToXeroJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public int $paymentId
    ) {}

    public function handle(XeroService $xeroService): void
    {
        $payment = InvoicePayment::query()->find($this->paymentId);

        if (! $payment || $payment->xero_payment_id) {
            return;
        }

        $xeroService->syncPayment($payment);
    }
}
