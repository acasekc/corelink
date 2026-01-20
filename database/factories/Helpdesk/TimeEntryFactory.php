<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\TimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\TimeEntry>
 */
class TimeEntryFactory extends Factory
{
    protected $model = TimeEntry::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'minutes' => $this->faker->numberBetween(15, 480), // 15 minutes to 8 hours
            'description' => $this->faker->optional(0.7)->sentence(),
            'date_worked' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
        ];
    }

    /**
     * Indicate a short time entry (under 1 hour)
     */
    public function short(): static
    {
        return $this->state(fn (array $attributes) => [
            'minutes' => $this->faker->numberBetween(5, 60),
        ]);
    }

    /**
     * Indicate a long time entry (multiple hours)
     */
    public function long(): static
    {
        return $this->state(fn (array $attributes) => [
            'minutes' => $this->faker->numberBetween(240, 960), // 4-16 hours
        ]);
    }
}
