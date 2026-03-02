<?php

namespace App\Console\Commands;

use App\Mail\Helpdesk\AnthropicWeeklyDigest;
use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AnthropicWeeklyDigestCommand extends Command
{
    protected $signature = 'anthropic:weekly-digest';

    protected $description = 'Send a weekly digest email summarizing Anthropic API usage across all projects';

    public function handle(): int
    {
        $configs = AnthropicApiConfig::with('project')->get();

        if ($configs->isEmpty()) {
            $this->info('No Anthropic API configs found.');

            return self::SUCCESS;
        }

        $summaries = $configs->map(function (AnthropicApiConfig $config) {
            $allowanceCents = $config->includedAllowanceCents();
            $usagePercent = $allowanceCents > 0
                ? (int) round(($config->cycle_usage_cents / $allowanceCents) * 100)
                : 0;

            return [
                'project_name' => $config->project->name ?? 'Unknown Project',
                'status' => $config->key_status->value,
                'plan_tier' => $config->plan_tier,
                'usage_dollars' => $config->cycleUsageDollars(),
                'allowance' => (float) $config->included_allowance,
                'grace_threshold' => (float) $config->grace_threshold,
                'usage_percent' => $usagePercent,
                'overage_dollars' => $config->overageCents() / 100,
                'overage_with_markup_dollars' => $config->overageWithMarkupCents() / 100,
                'markup_percentage' => (float) $config->markup_percentage,
                'last_synced' => $config->last_synced_at?->diffForHumans(),
            ];
        })->sortByDesc('usage_percent')->values();

        $adminEmail = config('mail.admin_address', config('mail.from.address'));

        if (! $adminEmail) {
            $this->error('No admin email configured.');
            Log::warning('Cannot send Anthropic weekly digest: no admin email configured');

            return self::FAILURE;
        }

        try {
            Mail::to($adminEmail)->send(new AnthropicWeeklyDigest($summaries));
            $this->info("Weekly digest sent to {$adminEmail} ({$summaries->count()} projects).");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to send digest: {$e->getMessage()}");
            Log::error('Failed to send Anthropic weekly digest', [
                'error' => $e->getMessage(),
            ]);

            return self::FAILURE;
        }
    }
}
