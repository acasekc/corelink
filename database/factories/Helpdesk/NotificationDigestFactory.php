<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\NotificationDigest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\NotificationDigest>
 */
class NotificationDigestFactory extends Factory
{
    protected $model = NotificationDigest::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'recipient_email' => fake()->safeEmail(),
            'dispatch_after' => now()->addMinutes(10),
            'sent_at' => null,
        ];
    }
}
