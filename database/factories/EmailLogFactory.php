<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailLog>
 */
class EmailLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'to_email' => fake()->unique()->safeEmail(),
            'subject' => fake()->sentence(),
            'mailable_class' => 'App\\Mail\\ContactFormSubmission',
            'status' => 'sent',
            'postmark_message_id' => fake()->uuid(),
            'metadata' => null,
        ];
    }
}
