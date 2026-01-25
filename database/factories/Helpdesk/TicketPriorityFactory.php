<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\TicketPriority;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\TicketPriority>
 */
class TicketPriorityFactory extends Factory
{
    protected $model = TicketPriority::class;

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
            'text_color' => '#ffffff',
            'bg_color' => '#'.str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT),
        ];
    }
}
