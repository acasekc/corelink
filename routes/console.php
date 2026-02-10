<?php

use App\Models\ArticleCategory;
use App\Models\ArticleGenerationSettings;
use App\Services\ArticleService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
*/

// Publish scheduled articles every hour
Schedule::command('articles:publish-scheduled')->hourly();

// Clean up attachments from tickets closed for more than 30 days
Schedule::command('helpdesk:cleanup-attachments')->dailyAt('03:00');

// Auto-generate articles daily (if enabled)
Schedule::call(function () {
    $settings = ArticleGenerationSettings::get();

    if (! $settings->is_enabled) {
        return;
    }

    // Get a random active category
    $category = ArticleCategory::active()->inRandomOrder()->first();

    if (! $category) {
        Log::warning('No active categories for auto article generation');

        return;
    }

    $articleService = app(ArticleService::class);
    $result = $articleService->generateArticle($category);

    if ($result['success']) {
        Log::info('Auto-generated article', [
            'article_id' => $result['article']->id,
            'category' => $category->name,
        ]);
    } else {
        Log::error('Failed to auto-generate article', [
            'error' => $result['error'],
            'category' => $category->name,
        ]);
    }
})->dailyAt('09:00')->name('auto-generate-article');
