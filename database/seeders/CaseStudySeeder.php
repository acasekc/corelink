<?php

namespace Database\Seeders;

use App\Models\CaseStudy;
use Illuminate\Database\Seeder;

class CaseStudySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CaseStudy::updateOrCreate(
            ['slug' => 'dusties-delights'],
            [
                'title' => "Dustie's Delights",
                'subtitle' => 'From Home Kitchen to Thriving Online Bakery',
                'description' => 'A custom e-commerce platform for a passionate baker to sell homemade cookies and sweet breads online.',
                'client_name' => 'Dustie',
                'industry' => 'Food & Beverage',
                'project_type' => 'E-commerce Website',
                'technologies' => ['Laravel', 'Vue.js', 'Stripe', 'PayPal', 'Tailwind CSS'],
                'hero_image' => '/images/case-studies/dusties-delights-hero.jpg',
                'content' => $this->getDustiesDelightsContent(),
                'metrics' => [
                    ['label' => 'Faster Order Processing', 'value' => '40%'],
                    ['label' => 'Customer Satisfaction', 'value' => '95%'],
                    ['label' => 'Revenue Growth', 'value' => '200%'],
                ],
                'is_published' => true,
                'order' => 1,
            ]
        );
    }

    private function getDustiesDelightsContent(): string
    {
        return <<<'MARKDOWN'
## Introduction

Dustie, a passionate young entrepreneur with a knack for baking irresistible cookies and sweet breads, dreamed of turning her homemade treats into a full-fledged business.

## The Challenge

Dustie approached CoreLink Development with a clear vision: sell her signature chocolate chip cookies, artisanal banana breads, cinnamon rolls, and custom orders directly to customers. She wanted a site that handled everything—from product listings and secure payments to shipping calculations and tax management—without needing constant technical help. 

Flexibility was key: support for Stripe and PayPal integrations, plus cash-on-delivery options for local pickups.

## Our Solution

At CoreLink, we built Dustie's Delights a fully custom e-commerce website tailored to her needs. Using modern, scalable technologies, we created an intuitive platform where Dustie can independently manage her entire store.

### Product Management
Easy uploading of photos, descriptions, variants (e.g., dozen packs or gluten-free options), and inventory tracking.

### Custom Quotes
A built-in form for personalized orders, like wedding cookie favors or bulk sweet bread requests.

### Flexible Payments
Seamless integration with Stripe and PayPal for secure online transactions, alongside COD for convenience.

### Shipping & Taxes
Automated rate calculations based on location, with full control over rules and zones.

### User-Friendly Dashboard
Dustie handles customers, orders, and site updates herself—no coding required.

## Results & Impact

Since launch, Dustie's Delights has seen steady growth: quicker order processing, happier customers with seamless shopping experiences, and the freedom for Dustie to focus on baking rather than backend hassles. The site's scalability means she's ready for expansion—whether adding new products or shipping nationwide.

### Key Metrics
- **40% Faster** order processing
- **95%** customer satisfaction
- **200%** revenue growth since launch

## Key Takeaways

This project highlights how CoreLink empowers startups with custom e-commerce solutions that are powerful yet simple. We deliver tools that let entrepreneurs like Dustie own their online success from day one.
MARKDOWN;
    }
}

