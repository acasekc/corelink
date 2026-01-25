<?php

namespace Database\Factories\Helpdesk;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'number' => $this->faker->numberBetween(1000, 9999),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(3),
            'status_id' => fn (array $attributes) => TicketStatus::factory()->create([
                'project_id' => $attributes['project_id'],
            ])->id,
            'priority_id' => fn (array $attributes) => TicketPriority::factory()->create([
                'project_id' => $attributes['project_id'],
            ])->id,
            'type_id' => fn (array $attributes) => TicketType::factory()->create([
                'project_id' => $attributes['project_id'],
            ])->id,
            'assignee_id' => User::factory(),
            'submitter_name' => $this->faker->name(),
            'submitter_email' => $this->faker->email(),
            'time_estimate_minutes' => $this->faker->numberBetween(30, 480),
        ];
    }
}
