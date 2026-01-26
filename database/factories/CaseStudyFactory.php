<?php

namespace Database\Factories;

use App\Models\CaseStudy;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CaseStudyFactory extends Factory
{
    protected $model = CaseStudy::class;

    public function definition(): array
    {
        $title = fake()->sentence(6);

        return [
            'slug' => Str::slug($title),
            'title' => $title,
            'subtitle' => fake()->sentence(8),
            'description' => fake()->paragraph(3),
            'client_name' => fake()->company(),
            'industry' => fake()->randomElement(['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Manufacturing']),
            'project_type' => fake()->randomElement(['Web Application', 'Mobile App', 'API Integration', 'Custom Software', 'Cloud Migration']),
            'technologies' => fake()->randomElements(['Laravel', 'React', 'Vue', 'Tailwind CSS', 'MySQL', 'Redis', 'AWS', 'Docker', 'PostgreSQL'], 4),
            'hero_image' => '/storage/case-studies/placeholder.jpg',
            'content' => implode("\n\n", fake()->paragraphs(5)),
            'metrics' => [
                ['label' => 'Performance Increase', 'value' => fake()->numberBetween(50, 500).'%'],
                ['label' => 'User Growth', 'value' => fake()->numberBetween(10, 300).'%'],
                ['label' => 'Cost Reduction', 'value' => fake()->numberBetween(20, 80).'%'],
            ],
            'is_published' => false,
            'order' => fake()->numberBetween(0, 100),
        ];
    }

    public function published(): self
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    public function ordered(int $order): self
    {
        return $this->state(fn (array $attributes) => [
            'order' => $order,
        ]);
    }
}
