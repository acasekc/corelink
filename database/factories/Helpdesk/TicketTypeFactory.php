<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\TicketType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\TicketType>
 */
class TicketTypeFactory extends Factory
{
    protected $model = TicketType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->word(),
            'slug' => $this->faker->slug(),
        ];
    }
}
