<?php

namespace App\Listeners\Helpdesk;

use App\Events\Helpdesk\UsageSynced;
use App\Services\Helpdesk\AnthropicThresholdMonitorService;

class EvaluateUsageThresholds
{
    public function __construct(
        private AnthropicThresholdMonitorService $monitorService,
    ) {}

    /**
     * Handle the UsageSynced event.
     */
    public function handle(UsageSynced $event): void
    {
        $this->monitorService->evaluate($event->config);
    }
}
