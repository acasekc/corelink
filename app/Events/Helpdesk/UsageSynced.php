<?php

namespace App\Events\Helpdesk;

use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UsageSynced
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public AnthropicApiConfig $config,
        public AnthropicUsageLog $log,
    ) {}
}
