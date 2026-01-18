<?php

namespace Database\Seeders;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Database\Seeder;

class HelpdeskSeeder extends Seeder
{
    public function run(): void
    {
        // Create global statuses
        $statuses = [
            ['title' => 'Open', 'slug' => 'open', 'bg_color' => '#3b82f6', 'text_color' => '#ffffff', 'is_default' => true, 'order' => 1],
            ['title' => 'In Progress', 'slug' => 'in-progress', 'bg_color' => '#f59e0b', 'text_color' => '#ffffff', 'is_default' => false, 'order' => 2],
            ['title' => 'Pending', 'slug' => 'pending', 'bg_color' => '#8b5cf6', 'text_color' => '#ffffff', 'is_default' => false, 'order' => 3],
            ['title' => 'Resolved', 'slug' => 'resolved', 'bg_color' => '#10b981', 'text_color' => '#ffffff', 'is_default' => false, 'order' => 4],
            ['title' => 'Closed', 'slug' => 'closed', 'bg_color' => '#6b7280', 'text_color' => '#ffffff', 'is_default' => false, 'order' => 5],
        ];

        foreach ($statuses as $status) {
            TicketStatus::firstOrCreate(['slug' => $status['slug'], 'project_id' => null], $status);
        }

        // Create global priorities
        $priorities = [
            ['title' => 'Low', 'slug' => 'low', 'bg_color' => '#6b7280', 'text_color' => '#ffffff', 'order' => 1],
            ['title' => 'Medium', 'slug' => 'medium', 'bg_color' => '#3b82f6', 'text_color' => '#ffffff', 'order' => 2],
            ['title' => 'High', 'slug' => 'high', 'bg_color' => '#f59e0b', 'text_color' => '#ffffff', 'order' => 3],
            ['title' => 'Critical', 'slug' => 'critical', 'bg_color' => '#ef4444', 'text_color' => '#ffffff', 'order' => 4],
        ];

        foreach ($priorities as $priority) {
            TicketPriority::firstOrCreate(['slug' => $priority['slug'], 'project_id' => null], $priority);
        }

        // Create global types
        $types = [
            ['title' => 'Bug', 'slug' => 'bug', 'bg_color' => '#ef4444', 'text_color' => '#ffffff', 'icon' => 'bug'],
            ['title' => 'Feature Request', 'slug' => 'feature', 'bg_color' => '#10b981', 'text_color' => '#ffffff', 'icon' => 'lightbulb'],
            ['title' => 'Question', 'slug' => 'question', 'bg_color' => '#8b5cf6', 'text_color' => '#ffffff', 'icon' => 'help-circle'],
            ['title' => 'Task', 'slug' => 'task', 'bg_color' => '#3b82f6', 'text_color' => '#ffffff', 'icon' => 'check-square'],
        ];

        foreach ($types as $type) {
            TicketType::firstOrCreate(['slug' => $type['slug'], 'project_id' => null], $type);
        }

        // Create default projects
        $projects = [
            [
                'name' => 'PantryLink',
                'slug' => 'pantrylink',
                'description' => 'Food pantry management system',
                'ticket_prefix' => 'PANT',
                'github_repo' => 'acasekc/pantrylink',
                'color' => '#10b981',
            ],
            [
                'name' => 'ChampLink',
                'slug' => 'champlink',
                'description' => 'Championship/sports platform',
                'ticket_prefix' => 'CHMP',
                'github_repo' => 'acasekc/champlink',
                'color' => '#f59e0b',
            ],
            [
                'name' => 'EcomLink',
                'slug' => 'ecomlink',
                'description' => 'E-commerce platform',
                'ticket_prefix' => 'ECOM',
                'github_repo' => 'acasekc/ecomlink',
                'color' => '#8b5cf6',
            ],
        ];

        foreach ($projects as $projectData) {
            $project = Project::firstOrCreate(['slug' => $projectData['slug']], $projectData);

            // Create an API key for each project if it doesn't exist
            if ($project->apiKeys()->count() === 0) {
                $plainKey = ApiKey::generateKey();
                $project->apiKeys()->create([
                    'key' => ApiKey::hashKey($plainKey),
                    'name' => 'Default Key',
                    'is_active' => true,
                ]);

                $this->command->info("API Key for {$project->name}: {$plainKey}");
            }
        }
    }
}
