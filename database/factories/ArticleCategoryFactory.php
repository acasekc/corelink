<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ArticleCategory>
 */
class ArticleCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->word();

        return [
            'name' => ucfirst($name),
            'slug' => str($name)->slug(),
            'description' => fake()->sentence(),
            'prompt_guidance' => fake()->paragraph(),
            'image_prompt' => fake()->sentence(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
