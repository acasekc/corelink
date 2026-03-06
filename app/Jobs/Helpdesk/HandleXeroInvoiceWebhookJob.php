<?php

namespace App\Jobs\Helpdesk;

use App\Services\Helpdesk\XeroService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class HandleXeroInvoiceWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public string $tenantId,
        public string $resourceId
    ) {}

    public function handle(XeroService $xeroService): void
    {
        $xeroService->applyRemoteInvoiceUpdate($this->tenantId, $this->resourceId);
    }
}
