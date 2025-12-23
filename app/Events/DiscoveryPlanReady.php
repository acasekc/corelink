<?php

namespace App\Events;

use App\Models\DiscoveryPlan;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiscoveryPlanReady implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $sessionId;
    public string $planId;
    public string $status;
    public ?array $summary;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $sessionId,
        string $planId,
        string $status,
        ?array $summary = null
    ) {
        $this->sessionId = $sessionId;
        $this->planId = $planId;
        $this->status = $status;
        $this->summary = $summary;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('discovery.' . $this->sessionId);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'plan.ready';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'plan_id' => $this->planId,
            'status' => $this->status,
            'summary' => $this->summary,
        ];
    }
}
