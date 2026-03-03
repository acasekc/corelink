<?php

namespace Database\Factories\Helpdesk;

use App\Enums\Helpdesk\OverageMode;
use App\Models\Helpdesk\AnthropicPlanTier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Helpdesk\AnthropicPlanTier>
 */
class AnthropicPlanTierFactory extends Factory
{
    protected $model = AnthropicPlanTier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'monthly_price' => fake()->randomFloat(2, 0, 500),
            'included_allowance' => fake()->randomFloat(2, 0, 500),
            'grace_threshold' => fake()->randomFloat(2, 500, 1000),
            'markup_percentage' => fake()->randomFloat(2, 0, 50),
            'overage_mode' => fake()->randomElement(OverageMode::cases()),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function starter(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Starter',
            'slug' => 'starter',
            'description' => 'Basic plan for small projects',
            'monthly_price' => 49.00,
            'included_allowance' => 25.00,
            'grace_threshold' => 35.00,
            'markup_percentage' => 20.00,
            'overage_mode' => OverageMode::Silent,
            'sort_order' => 1,
        ]);
    }

    public function growth(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Growth',
            'slug' => 'growth',
            'description' => 'Growing projects with moderate usage',
            'monthly_price' => 149.00,
            'included_allowance' => 100.00,
            'grace_threshold' => 150.00,
            'markup_percentage' => 15.00,
            'overage_mode' => OverageMode::Proactive,
            'sort_order' => 2,
        ]);
    }

    public function pro(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Pro',
            'slug' => 'pro',
            'description' => 'Professional plan for high-volume usage',
            'monthly_price' => 499.00,
            'included_allowance' => 500.00,
            'grace_threshold' => 750.00,
            'markup_percentage' => 10.00,
            'overage_mode' => OverageMode::Proactive,
            'sort_order' => 3,
        ]);
    }
}
