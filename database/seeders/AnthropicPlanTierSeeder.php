<?php

namespace Database\Seeders;

use App\Enums\Helpdesk\OverageMode;
use App\Models\Helpdesk\AnthropicPlanTier;
use Illuminate\Database\Seeder;

class AnthropicPlanTierSeeder extends Seeder
{
    /**
     * Seed the default Anthropic plan tiers.
     */
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Basic plan for small projects with minimal AI usage',
                'monthly_price' => 49.00,
                'included_allowance' => 25.00,
                'grace_threshold' => 35.00,
                'markup_percentage' => 20.00,
                'overage_mode' => OverageMode::Silent,
                'sort_order' => 1,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'description' => 'For growing projects with moderate AI usage',
                'monthly_price' => 149.00,
                'included_allowance' => 100.00,
                'grace_threshold' => 150.00,
                'markup_percentage' => 15.00,
                'overage_mode' => OverageMode::Proactive,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Professional plan for high-volume AI usage',
                'monthly_price' => 499.00,
                'included_allowance' => 500.00,
                'grace_threshold' => 750.00,
                'markup_percentage' => 10.00,
                'overage_mode' => OverageMode::Proactive,
                'sort_order' => 3,
            ],
            [
                'name' => 'Custom',
                'slug' => 'custom',
                'description' => 'Custom plan with negotiated terms',
                'monthly_price' => 0.00,
                'included_allowance' => 0.00,
                'grace_threshold' => 0.00,
                'markup_percentage' => 0.00,
                'overage_mode' => OverageMode::Silent,
                'sort_order' => 4,
            ],
        ];

        foreach ($tiers as $tier) {
            AnthropicPlanTier::updateOrCreate(
                ['slug' => $tier['slug']],
                $tier,
            );
        }
    }
}
