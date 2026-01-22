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
                'payment_terms_days' => $settings->payment_terms_days,
                'stripe_enabled' => $settings->stripe_enabled,
                'default_notes' => $settings->default_notes,
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
            'payment_terms_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'stripe_enabled' => ['nullable', 'boolean'],
            'default_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $settings->update($validated);

        return response()->json([
            'data' => [
                'id' => $settings->id,
                'project_id' => $settings->project_id,
                'invoice_prefix' => $settings->invoice_prefix,
                'next_invoice_number' => $settings->next_invoice_number,
                'payment_terms_days' => $settings->payment_terms_days,
                'stripe_enabled' => $settings->stripe_enabled,
                'default_notes' => $settings->default_notes,
                'created_at' => $settings->created_at->toIso8601String(),
                'updated_at' => $settings->updated_at->toIso8601String(),
            ],
            'message' => 'Invoice settings updated successfully',
        ]);
    }
}
