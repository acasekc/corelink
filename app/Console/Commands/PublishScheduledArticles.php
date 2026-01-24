<?php

namespace App\Console\Commands;

use App\Services\ArticleService;
use Illuminate\Console\Command;

class PublishScheduledArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish articles that are scheduled for publication';

    /**
     * Execute the console command.
     */
    public function handle(ArticleService $articleService): int
    {
        $count = $articleService->publishScheduledArticles();

        if ($count > 0) {
            $this->info("Published {$count} scheduled article(s).");
        } else {
            $this->info('No articles due for publication.');
        }

        return self::SUCCESS;
    }
}
