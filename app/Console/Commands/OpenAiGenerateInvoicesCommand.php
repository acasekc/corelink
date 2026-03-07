<?php

namespace App\Console\Commands;

use App\Models\Helpdesk\OpenAiConfig;
use App\Services\Helpdesk\OpenAiBillingService;
use Illuminate\Console\Command;

class OpenAiGenerateInvoicesCommand extends Command
{
    protected $signature = 'openai:generate-invoices
                            {--project= : Generate invoice for a specific project by ID}';

    protected $description = 'Generate OpenAI billing invoices for projects with outstanding usage';

    public function handle(OpenAiBillingService $billingService): int
    {
        $projectId = $this->option('project');

        $query = OpenAiConfig::query()
            ->whereNotNull('openai_project_id')
            ->where('cycle_usage_cents', '>', 0);

        if ($projectId) {
            $query->where('project_id', (int) $projectId);
        }

        $configs = $query->get();

        if ($configs->isEmpty()) {
            $this->info('No OpenAI configs with outstanding usage found.');

            return self::SUCCESS;
        }

        $generated = 0;

        foreach ($configs as $config) {
            try {
                $invoice = $billingService->generateInvoice($config);

                if ($invoice) {
                    $this->info("Generated invoice {$invoice->invoice_number} for project ID {$config->project_id}.");
                    $generated++;
                }
            } catch (\Throwable $e) {
                $this->error("Failed for project ID {$config->project_id}: {$e->getMessage()}");
            }
        }

        $this->info("Generated {$generated} invoice(s).");

        return self::SUCCESS;
    }
}
