<?php

namespace App\Services\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoiceLineItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnthropicBillingService
{
    /**
     * Generate a draft invoice for the given Anthropic config's current billing cycle.
     */
    public function generateInvoice(AnthropicApiConfig $config): ?Invoice
    {
        if ($config->cycle_usage_cents <= 0) {
            Log::info('Skipping invoice generation: zero usage', [
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
                'notes' => "Anthropic API usage for billing cycle {$periodStart} to {$periodEnd}",
            ]);

            $sortOrder = 1;

            // Line item 1: Included allowance (flat fee)
            $invoice->lineItems()->create([
                'type' => InvoiceLineItem::TYPE_CUSTOM,
                'description' => "Anthropic API — Included Allowance ({$config->plan_tier})",
                'quantity' => 1,
                'rate' => $config->included_allowance,
                'sort_order' => $sortOrder++,
            ]);

            // Line item 2: Overage (if any, with markup)
            $overageCents = $config->overageCents();
            if ($overageCents > 0) {
                $overageWithMarkup = $config->overageWithMarkupCents() / 100;

                $invoice->lineItems()->create([
                    'type' => InvoiceLineItem::TYPE_CUSTOM,
                    'description' => "Anthropic API — Overage ({$config->markup_percentage}% markup applied)",
                    'quantity' => 1,
                    'rate' => $overageWithMarkup,
                    'sort_order' => $sortOrder,
                ]);
            }

            $invoice->recalculateTotals();

            Log::info('Generated Anthropic billing invoice', [
                'config_id' => $config->id,
                'project_id' => $project->id,
                'invoice_id' => $invoice->id,
                'total' => $invoice->total,
            ]);

            return $invoice;
        });
    }

    /**
     * Reset the billing cycle: zero usage, restore Active status if usage-disabled.
     */
    public function resetCycle(AnthropicApiConfig $config): void
    {
        $updates = [
            'cycle_usage_cents' => 0,
        ];

        // Only restore to Active if disabled due to usage threshold
        if ($config->key_status === ApiKeyStatus::Disabled && $config->disabled_reason !== null
            && str_contains($config->disabled_reason, 'grace threshold')) {
            $updates['key_status'] = ApiKeyStatus::Active;
            $updates['disabled_reason'] = null;
        }

        // Grace status always resets to Active
        if ($config->key_status === ApiKeyStatus::Grace) {
            $updates['key_status'] = ApiKeyStatus::Active;
            $updates['disabled_reason'] = null;
        }

        $config->update($updates);

        Log::info('Anthropic billing cycle reset', [
            'config_id' => $config->id,
            'project_id' => $config->project_id,
            'new_status' => $config->key_status->value,
        ]);
    }

    /**
     * Check if today is the cycle end date for a given config.
     */
    public function isCycleEndDate(AnthropicApiConfig $config): bool
    {
        $today = now()->day;
        $cycleDay = $config->cycle_start_day;

        // Cycle ends the day before cycle_start_day
        // e.g., if cycle starts on the 1st, cycle ends on the last day of the previous period
        return $today === $cycleDay;
    }

    /**
     * Check if a project has overdue invoices and suspend the API key if so.
     */
    public function checkOverdueInvoices(AnthropicApiConfig $config): bool
    {
        $hasOverdue = Invoice::forProject($config->project_id)
            ->where('status', Invoice::STATUS_OVERDUE)
            ->exists();

        if ($hasOverdue && $config->key_status !== ApiKeyStatus::Suspended) {
            $config->update([
                'key_status' => ApiKeyStatus::Suspended,
                'disabled_reason' => 'Suspended due to overdue invoice',
            ]);

            Log::warning('Anthropic API key suspended due to overdue invoice', [
                'config_id' => $config->id,
                'project_id' => $config->project_id,
            ]);

            return true;
        }

        return false;
    }

    /**
     * Get the cycle period start date for the current billing cycle.
     */
    private function getCyclePeriodStart(AnthropicApiConfig $config): string
    {
        $cycleDay = $config->cycle_start_day;
        $today = now();

        // If today is on or after cycle day, period started this month
        if ($today->day >= $cycleDay) {
            return $today->copy()->day($cycleDay)->toDateString();
        }

        // Otherwise, period started last month
        return $today->copy()->subMonth()->day($cycleDay)->toDateString();
    }
}
