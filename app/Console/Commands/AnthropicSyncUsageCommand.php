<?php

namespace App\Console\Commands;

use App\Models\Helpdesk\AnthropicApiConfig;
use App\Services\Helpdesk\AnthropicUsageSyncService;
use Illuminate\Console\Command;

class AnthropicSyncUsageCommand extends Command
{
    protected $signature = 'anthropic:sync-usage
                            {--project= : Sync a specific project by ID}';

    protected $description = 'Sync Anthropic API usage data for all active configs or a specific project';

    public function handle(AnthropicUsageSyncService $service): int
    {
        $projectId = $this->option('project');

        if ($projectId) {
            return $this->syncSingleProject($service, (int) $projectId);
        }

        return $this->syncAll($service);
    }

    private function syncSingleProject(AnthropicUsageSyncService $service, int $projectId): int
    {
        $config = AnthropicApiConfig::where('project_id', $projectId)->first();

        if (! $config) {
            $this->error("No Anthropic API config found for project ID {$projectId}.");

            return self::FAILURE;
        }

        $this->info("Syncing usage for project: {$config->project->name}...");

        try {
            $log = $service->syncForConfig($config);

            if ($log) {
                $this->info("Synced: {$log->totalTokens()} tokens, \${$log->costDollars()} cost");
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Sync failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    private function syncAll(AnthropicUsageSyncService $service): int
    {
        $this->info('Syncing usage for all active Anthropic API configs...');

        $logs = $service->syncAll();

        if ($logs->isEmpty()) {
            $this->info('No configs to sync (none active/grace with API keys).');

            return self::SUCCESS;
        }

        $this->info("Successfully synced {$logs->count()} config(s).");

        foreach ($logs as $log) {
            $this->line("  - Config #{$log->anthropic_config_id}: {$log->totalTokens()} tokens, \${$log->costDollars()} cost");
        }

        return self::SUCCESS;
    }
}
