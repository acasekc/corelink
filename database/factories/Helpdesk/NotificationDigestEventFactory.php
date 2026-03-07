<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\NotificationDigest;
use App\Models\Helpdesk\NotificationDigestEvent;
use App\Models\Helpdesk\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\NotificationDigestEvent>
 */
class NotificationDigestEventFactory extends Factory
{
    protected $model = NotificationDigestEvent::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'notification_digest_id' => NotificationDigest::factory(),
            'ticket_id' => Ticket::factory(),
            'event_type' => 'status_changed',
            'payload' => [
                'ticket_number' => 'TEST-0001',
                'ticket_title' => fake()->sentence(),
                'project_name' => fake()->company(),
            ],
        ];
    }
}
