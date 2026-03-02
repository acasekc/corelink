<?php

namespace App\Console\Commands;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Services\Helpdesk\AnthropicBillingService;
use Illuminate\Console\Command;

class AnthropicGenerateInvoicesCommand extends Command
{
    protected $signature = 'anthropic:generate-invoices
                            {--project= : Generate invoice for a specific project by ID}
                            {--force : Generate even if today is not the cycle end date}';

    protected $description = 'Generate draft invoices for Anthropic API billing cycles ending today';

    public function handle(AnthropicBillingService $service): int
    {
        $projectId = $this->option('project');
        $force = $this->option('force');

        if ($projectId) {
            return $this->generateForProject($service, (int) $projectId, $force);
        }

        return $this->generateAll($service, $force);
    }

    private function generateForProject(AnthropicBillingService $service, int $projectId, bool $force): int
    {
        $config = AnthropicApiConfig::where('project_id', $projectId)->first();

        if (! $config) {
            $this->error("No Anthropic API config found for project ID {$projectId}.");

            return self::FAILURE;
        }

        if (! $force && ! $service->isCycleEndDate($config)) {
            $this->info("Today is not the cycle end date for project: {$config->project->name}. Use --force to override.");

            return self::SUCCESS;
        }

        $this->info("Generating invoice for project: {$config->project->name}...");

        $invoice = $service->generateInvoice($config);

        if (! $invoice) {
            $this->info('No invoice generated (zero usage).');

            return self::SUCCESS;
        }

        $this->info("Invoice {$invoice->invoice_number} created — total: \${$invoice->total}");

        if (! $this->option('no-interaction')) {
            if ($this->confirm('Reset billing cycle?', true)) {
                $service->resetCycle($config);
                $this->info('Billing cycle reset.');
            }
        }

        return self::SUCCESS;
    }

    private function generateAll(AnthropicBillingService $service, bool $force): int
    {
        $configs = AnthropicApiConfig::whereIn('key_status', [
            ApiKeyStatus::Active->value,
            ApiKeyStatus::Grace->value,
            ApiKeyStatus::Disabled->value,
        ])->get();

        if ($configs->isEmpty()) {
            $this->info('No Anthropic API configs found.');

            return self::SUCCESS;
        }

        $generated = 0;
        $skipped = 0;

        foreach ($configs as $config) {
            $projectName = $config->project->name ?? "Project #{$config->project_id}";

            if (! $force && ! $service->isCycleEndDate($config)) {
                $skipped++;

                continue;
            }

            $invoice = $service->generateInvoice($config);

            if ($invoice) {
                $this->info("[{$projectName}] Invoice {$invoice->invoice_number} — \${$invoice->total}");
                $service->resetCycle($config);
                $generated++;
            } else {
                $this->info("[{$projectName}] Skipped (zero usage)");
                $service->resetCycle($config);
                $skipped++;
            }
        }

        $this->info("Done. Generated: {$generated}, Skipped/reset: {$skipped}");

        return self::SUCCESS;
    }
}
