<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'category' => $this->faker->randomElement([
                'Web Application',
                'Mobile App',
                'Tournament Platform',
                'E-commerce',
                'API Service',
                'Desktop Application'
            ]),
            'description' => $this->faker->paragraphs(3, true),
            'features' => [
                $this->faker->sentence(),
                $this->faker->sentence(),
                $this->faker->sentence(),
            ],
            'tech_stack' => [
                $this->faker->randomElement(['Laravel', 'React', 'Vue', 'Angular']),
                $this->faker->randomElement(['MySQL', 'PostgreSQL', 'MongoDB']),
                $this->faker->randomElement(['Tailwind CSS', 'Bootstrap', 'Material UI']),
            ],
            'link' => $this->faker->optional()->url(),
            'screenshots' => [],
            'order' => $this->faker->numberBetween(0, 100),
            'is_published' => $this->faker->boolean(80),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    public function ordered(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order' => $order,
        ]);
    }
}
