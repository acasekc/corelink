<?php

namespace App\Services\Helpdesk;

use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoiceLineItem;
use App\Models\Helpdesk\OpenAiConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OpenAiBillingService
{
    /**
     * Generate a draft invoice for the current billing cycle.
     */
    public function generateInvoice(OpenAiConfig $config): ?Invoice
    {
        if ($config->cycle_usage_cents <= 0) {
            Log::info('Skipping OpenAI invoice: zero usage', [
                'config_id' => $config->id,
                'project_id' => $config->project_id,
            ]);

            return null;
        }

        $project = $config->project;
        $settings = $project->getInvoiceSettings();

        return DB::transaction(function () use ($config, $project, $settings) {
            $periodStart = $this->getCyclePeriodStart($config);
            $periodEnd = now()->toDateString();

            $invoice = Invoice::create([
                'project_id' => $project->id,
                'invoice_number' => $settings->generateInvoiceNumber(),
                'status' => Invoice::STATUS_DRAFT,
                'bill_to_name' => $project->client_name ?? $project->name,
                'bill_to_email' => $project->client_email,
                'bill_to_address' => $project->client_address,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays($settings->default_payment_terms ?? 30)->toDateString(),
                'subtotal' => 0,
                'discount_amount' => 0,
                'tax_rate' => $settings->default_tax_rate ?? 0,
                'tax_amount' => 0,
                'total' => 0,
                'amount_paid' => 0,
                'notes' => "OpenAI API usage for billing cycle {$periodStart} to {$periodEnd}",
            ]);

            $usageCostUsd = $config->cycle_usage_cents / 100;
            $withMarkup = round($usageCostUsd * $config->markupMultiplier(), 2);

            $description = $config->markup_percentage > 0
                ? "OpenAI API Usage ({$config->markup_percentage}% markup applied)"
                : 'OpenAI API Usage';

            $invoice->lineItems()->create([
                'type' => InvoiceLineItem::TYPE_CUSTOM,
                'description' => $description,
                'quantity' => 1,
                'rate' => $withMarkup,
                'sort_order' => 1,
            ]);

            $invoice->recalculateTotals();

            Log::info('Generated OpenAI billing invoice', [
                'config_id' => $config->id,
                'project_id' => $project->id,
                'invoice_id' => $invoice->id,
                'total' => $invoice->total,
            ]);

            return $invoice;
        });
    }

    /**
     * Reset the billing cycle: zero usage.
     */
    public function resetCycle(OpenAiConfig $config): void
    {
        $config->update(['cycle_usage_cents' => 0]);

        // Also zero out key spend tallies
        $config->apiKeys()->update(['spend_usd' => 0]);

        Log::info('OpenAI billing cycle reset', [
            'config_id' => $config->id,
            'project_id' => $config->project_id,
        ]);
    }

    private function getCyclePeriodStart(OpenAiConfig $config): string
    {
        $day = $config->billing_cycle_start_day;
        $now = now();

        $start = $now->copy()->setDay($day)->startOfDay();

        if ($start->gt($now)) {
            $start->subMonth();
        }

        return $start->toDateString();
    }
}
