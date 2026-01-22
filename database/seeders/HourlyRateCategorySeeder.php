<?php

namespace Database\Seeders;

use App\Models\Helpdesk\HourlyRateCategory;
use Illuminate\Database\Seeder;

class HourlyRateCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Development',
                'slug' => 'development',
                'description' => 'Code changes, bug fixes, feature implementation',
                'order' => 1,
            ],
            [
                'name' => 'Data Entry',
                'slug' => 'data-entry',
                'description' => 'Manual data input, imports, migrations',
                'order' => 2,
            ],
            [
                'name' => 'SEO',
                'slug' => 'seo',
                'description' => 'Search engine optimization work',
                'order' => 3,
            ],
            [
                'name' => 'Marketing',
                'slug' => 'marketing',
                'description' => 'Marketing-related tasks',
                'order' => 4,
            ],
            [
                'name' => 'Consulting',
                'slug' => 'consulting',
                'description' => 'Advisory, meetings, planning',
                'order' => 5,
            ],
            [
                'name' => 'Support',
                'slug' => 'support',
                'description' => 'General support, troubleshooting',
                'order' => 6,
            ],
            [
                'name' => 'Miscellaneous',
                'slug' => 'misc',
                'description' => 'Uncategorized work',
                'order' => 7,
            ],
        ];

        foreach ($categories as $category) {
            HourlyRateCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
