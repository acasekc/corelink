<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectInvoiceSettingsController extends Controller
{
    /**
     * Get invoice settings for a project
     */
    public function show(Project $project): JsonResponse
    {
        $settings = $project->getInvoiceSettings();

        return response()->json([
            'data' => [
                'id' => $settings->id,
                'project_id' => $settings->project_id,
                'invoice_prefix' => $settings->invoice_prefix,
                'next_invoice_number' => $settings->next_invoice_number,
                'default_payment_terms' => $settings->default_payment_terms,
                'default_hourly_rate' => $settings->default_hourly_rate,
                'billing_increment_minutes' => $settings->billing_increment_minutes,
                'minimum_billing_minutes' => $settings->minimum_billing_minutes,
                'stripe_enabled' => $settings->stripe_enabled,
                'invoice_footer' => $settings->invoice_footer,
                'created_at' => $settings->created_at->toIso8601String(),
                'updated_at' => $settings->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update invoice settings for a project
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $settings = $project->getInvoiceSettings();

        $validated = $request->validate([
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'next_invoice_number' => ['nullable', 'integer', 'min:1'],
            'default_payment_terms' => ['nullable', 'integer', 'min:0', 'max:365'],
            'default_hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'billing_increment_minutes' => ['nullable', 'integer', 'min:1'],
            'minimum_billing_minutes' => ['nullable', 'integer', 'min:0'],
            'stripe_enabled' => ['nullable', 'boolean'],
            'invoice_footer' => ['nullable', 'string', 'max:2000'],
        ]);

        $settings->update($validated);

        return response()->json([
            'data' => [
                'id' => $settings->id,
                'project_id' => $settings->project_id,
                'invoice_prefix' => $settings->invoice_prefix,
                'next_invoice_number' => $settings->next_invoice_number,
                'default_payment_terms' => $settings->default_payment_terms,
                'default_hourly_rate' => $settings->default_hourly_rate,
                'billing_increment_minutes' => $settings->billing_increment_minutes,
                'minimum_billing_minutes' => $settings->minimum_billing_minutes,
                'stripe_enabled' => $settings->stripe_enabled,
                'invoice_footer' => $settings->invoice_footer,
                'created_at' => $settings->created_at->toIso8601String(),
                'updated_at' => $settings->updated_at->toIso8601String(),
            ],
            'message' => 'Invoice settings updated successfully',
        ]);
    }
}
