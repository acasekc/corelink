<?php

namespace App\Console\Commands;

use App\Models\Helpdesk\AnthropicApiConfig;
use App\Services\Helpdesk\AnthropicBillingService;
use Illuminate\Console\Command;

class AnthropicResetCycleCommand extends Command
{
    protected $signature = 'anthropic:reset-cycle
                            {--project= : Reset cycle for a specific project by ID}';

    protected $description = 'Reset the Anthropic API billing cycle for a project (zeros usage, restores key if usage-disabled)';

    public function handle(AnthropicBillingService $service): int
    {
        $projectId = $this->option('project');

        if (! $projectId) {
            $this->error('The --project option is required.');

            return self::FAILURE;
        }

        $config = AnthropicApiConfig::where('project_id', (int) $projectId)->first();

        if (! $config) {
            $this->error("No Anthropic API config found for project ID {$projectId}.");

            return self::FAILURE;
        }

        $projectName = $config->project->name ?? "Project #{$config->project_id}";

        $this->info("Resetting billing cycle for: {$projectName}");
        $this->info('Current usage: $'.number_format($config->cycleUsageDollars(), 2));
        $this->info("Current status: {$config->key_status->label()}");

        $service->resetCycle($config);
        $config->refresh();

        $this->info('Cycle reset complete.');
        $this->info('New usage: $'.number_format($config->cycleUsageDollars(), 2));
        $this->info("New status: {$config->key_status->label()}");

        return self::SUCCESS;
    }
}
