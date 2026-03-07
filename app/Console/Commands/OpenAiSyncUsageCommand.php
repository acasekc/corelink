<?php

namespace App\Console\Commands;

use App\Services\Helpdesk\OpenAiUsageSyncService;
use Illuminate\Console\Command;

class OpenAiSyncUsageCommand extends Command
{
    protected $signature = 'openai:sync-usage
                            {--project= : Sync a specific project by ID}';

    protected $description = 'Sync OpenAI API usage and costs for all connected projects';

    public function handle(OpenAiUsageSyncService $syncService): int
    {
        $projectId = $this->option('project');

        if ($projectId) {
            $config = \App\Models\Helpdesk\OpenAiConfig::where('project_id', (int) $projectId)
                ->whereNotNull('openai_project_id')
                ->first();

            if (! $config) {
                $this->error("No connected OpenAI config found for project ID {$projectId}.");

                return self::FAILURE;
            }

            try {
                $syncService->syncForConfig($config);
                $this->info("Synced OpenAI usage for project ID {$projectId}.");
            } catch (\Throwable $e) {
                $this->error("Sync failed: {$e->getMessage()}");

                return self::FAILURE;
            }

            return self::SUCCESS;
        }

        $synced = $syncService->syncAll();
        $this->info("Synced OpenAI usage for {$synced->count()} project(s).");

        return self::SUCCESS;
    }
}
