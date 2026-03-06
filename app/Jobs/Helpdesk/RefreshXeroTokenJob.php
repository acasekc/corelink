<?php

namespace App\Jobs\Helpdesk;

use App\Models\Helpdesk\XeroConnection;
use App\Services\Helpdesk\XeroService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshXeroTokenJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function handle(XeroService $xeroService): void
    {
        XeroConnection::query()
            ->whereNotNull('refresh_token')
            ->get()
            ->each(function (XeroConnection $connection) use ($xeroService): void {
                if ($connection->needsRefresh()) {
                    $xeroService->refreshConnection($connection);
                }
            });
    }
}
