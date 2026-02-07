<?php

namespace Database\Factories;

use App\Enums\SuppressionType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailSuppression>
 */
class EmailSuppressionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'type' => fake()->randomElement(SuppressionType::cases()),
            'reason' => fake()->sentence(),
            'payload' => null,
        ];
    }

    public function bounce(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => SuppressionType::Bounce,
            'reason' => 'Hard bounce - address does not exist',
        ]);
    }

    public function spamComplaint(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => SuppressionType::SpamComplaint,
            'reason' => 'Recipient marked as spam',
        ]);
    }
}
