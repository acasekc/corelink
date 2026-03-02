<?php

namespace App\Console\Commands;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Console\Command;

class AnthropicDisableKeyCommand extends Command
{
    protected $signature = 'anthropic:disable-key
                            {--project= : Project ID to disable the key for}
                            {--reason= : Reason for disabling}';

    protected $description = 'Manually disable an Anthropic API key for a project (e.g., overdue payment)';

    public function handle(): int
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

        if ($config->key_status === ApiKeyStatus::Disabled) {
            $this->info("Key for [{$projectName}] is already disabled.");
            $this->info("Reason: {$config->disabled_reason}");

            return self::SUCCESS;
        }

        $reason = $this->option('reason') ?? 'Manually disabled via CLI';

        $config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => $reason,
        ]);

        $this->info("Key disabled for [{$projectName}].");
        $this->info("Reason: {$reason}");

        return self::SUCCESS;
    }
}
