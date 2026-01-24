<?php

namespace Database\Seeders;

use App\Models\ArticleCategory;
use Illuminate\Database\Seeder;

class ArticleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Tips, tutorials, and best practices for building modern websites and web applications.',
                'prompt_guidance' => 'Focus on practical web development topics for small businesses: responsive design, website speed optimization, choosing the right platform (WordPress, custom), mobile-first design, accessibility basics, and how to work with a web developer effectively.',
                'image_prompt' => 'Modern web development workspace with code on screen, blue and teal accent lighting',
                'sort_order' => 1,
            ],
            [
                'name' => 'SEO & Marketing',
                'slug' => 'seo-marketing',
                'description' => 'Digital marketing strategies and SEO tips to help your business get found online.',
                'prompt_guidance' => 'Write about practical SEO and digital marketing for local and small businesses: Google Business Profile optimization, local SEO tactics, content marketing basics, social media for trades, getting more reviews, and measuring marketing success without being too technical.',
                'image_prompt' => 'Digital marketing analytics dashboard with growth charts, search icons, blue and teal color scheme',
                'sort_order' => 2,
            ],
            [
                'name' => 'Business Software',
                'slug' => 'business-software',
                'description' => 'How custom software and modern tools can streamline your business operations.',
                'prompt_guidance' => 'Cover topics about software that helps small businesses run better: CRM systems, invoicing and accounting software, project management tools, automation opportunities, when to consider custom software, and how to evaluate software options without technical jargon.',
                'image_prompt' => 'Business software interface with charts and productivity tools, clean modern design, blue accents',
                'sort_order' => 3,
            ],
            [
                'name' => 'Small Business Digital',
                'slug' => 'small-business-digital',
                'description' => 'Helping small businesses and tradespeople succeed online with practical digital advice.',
                'prompt_guidance' => 'Write for small business owners and tradespeople (plumbers, electricians, contractors, etc.) who want to establish or improve their online presence: getting your first website, online booking systems, accepting online payments, professional email setup, and practical tech tips that save time and money.',
                'image_prompt' => 'Small business owner using tablet to manage online business, friendly professional setting, blue tones',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            ArticleCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
