<?php

namespace App\Console\Commands;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Console\Command;

class AnthropicEnableKeyCommand extends Command
{
    protected $signature = 'anthropic:enable-key
                            {--project= : Project ID to enable the key for}';

    protected $description = 'Re-enable an Anthropic API key that was disabled or suspended';

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

        if ($config->key_status === ApiKeyStatus::Active) {
            $this->info("Key for [{$projectName}] is already active.");

            return self::SUCCESS;
        }

        $previousStatus = $config->key_status->label();

        $config->update([
            'key_status' => ApiKeyStatus::Active,
            'disabled_reason' => null,
        ]);

        $this->info("Key re-enabled for [{$projectName}].");
        $this->info("Previous status: {$previousStatus}");

        return self::SUCCESS;
    }
}
