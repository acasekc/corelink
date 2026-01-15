<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'title' => 'ChampLink',
                'category' => 'Tournament Platform',
                'description' => 'A powerful tournament bracket management platform for competition organizers. Create and manage single elimination, double elimination, round robin, and group knockout tournaments with real-time updates and participant engagement.',
                'features' => [
                    'Multiple tournament formats (single/double elimination, round robin)',
                    'Interactive visual bracket editor',
                    'Real-time score updates via WebSockets',
                    'Email invitations and participant management',
                    'Team and individual competition support',
                    'Public spectator mode for followers',
                ],
                'tech_stack' => [
                    'Laravel 12',
                    'React 19',
                    'TypeScript',
                    'Laravel Reverb',
                    'WebSockets',
                    'MariaDB',
                    'Tailwind CSS v4',
                    'AWS EC2',
                    'GitHub Actions',
                    'Stripe Payments API',
                ],
                'link' => 'https://champlink.app/',
                'screenshots' => [],
                'is_published' => true,
                'order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'PantryLink',
                'category' => 'Web & Mobile App',
                'description' => 'A comprehensive inventory and shopping list management application for household and personal organization. Users can manage multiple inventory locations, create smart shopping lists, integrate with Walmart for direct ordering, and earn achievements through gamification. AI-powered meal generator suggests recipes based on available inventory.',
                'features' => [
                    'Hierarchical inventory management by location',
                    'Smart shopping list generation',
                    'AI meal generator with recipe suggestions',
                    'Recipe management and bookmarking',
                    'Crew system for family collaboration',
                    'Barcode scanning with image recognition',
                    'Walmart integration for seamless ordering',
                    'Gamification with badges and leaderboards',
                ],
                'tech_stack' => [
                    'Laravel 12',
                    'Vue 3',
                    'Inertia.js',
                    'React Native',
                    'Laravel Octane',
                    'PWA',
                    'Barcode API',
                    'Walmart API',
                    'AWS RDS',
                    'AWS EC2',
                    'WebSockets',
                    'Push Notifications',
                    'Kroger API',
                    'Stripe Payments API',
                ],
                'link' => 'https://pantrylink.app/',
                'screenshots' => [],
                'is_published' => true,
                'order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'CoreLink Platform',
                'category' => 'Web Application',
                'description' => 'A comprehensive platform for AI-powered project discovery and client management. Features intelligent conversation flows, automated plan generation, and seamless project management.',
                'features' => [
                    'AI-powered discovery conversations',
                    'Automated project plan generation',
                    'Real-time client communication',
                    'Comprehensive admin dashboard',
                    'Secure authentication system',
                ],
                'tech_stack' => [
                    'Laravel 12',
                    'React 19',
                    'MySQL',
                    'Tailwind CSS',
                    'Vite',
                    'Inertia.js',
                ],
                'link' => 'https://corelink.app/',
                'screenshots' => [],
                'is_published' => true,
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(
                ['title' => $project['title']],
                $project
            );
        }
    }
}
