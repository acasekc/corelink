<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiscoveryMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $sessionId;
    public string $message;
    public string $role;
    public int $turnNumber;
    public ?string $turnStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $sessionId,
        string $message,
        string $role,
        int $turnNumber,
        ?string $turnStatus = null
    ) {
        $this->sessionId = $sessionId;
        $this->message = $message;
        $this->role = $role;
        $this->turnNumber = $turnNumber;
        $this->turnStatus = $turnStatus;
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
        return 'message.received';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'role' => $this->role,
            'turn_number' => $this->turnNumber,
            'turn_status' => $this->turnStatus,
        ];
    }
}
