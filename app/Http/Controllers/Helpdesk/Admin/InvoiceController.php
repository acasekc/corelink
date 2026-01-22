<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpdesk\Public\InvoiceController as PublicInvoiceController;
use App\Mail\InvoiceSent;
use App\Models\Helpdesk\BillableItem;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoiceLineItem;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\ProjectHourlyRate;
use App\Models\Helpdesk\TimeEntry;
use App\Services\Helpdesk\InvoicePdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class InvoiceController extends Controller
{
    /**
     * List invoices, optionally filtered by project
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['project', 'lineItems.category', 'lineItems.billableItem', 'payments']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    /**
     * Get uninvoiced time entries for a project
     */
    public function uninvoicedTimeEntries(Project $project): JsonResponse
    {
        $timeEntries = TimeEntry::whereHas('ticket', fn ($q) => $q->where('project_id', $project->id))
            ->whereNull('invoice_line_item_id')
            ->where('is_billable', true)
            ->with(['ticket:id,title,number', 'user:id,name', 'hourlyRateCategory:id,name,slug'])
            ->orderBy('date_worked', 'desc')
            ->get();

        return response()->json([
            'data' => $timeEntries->map(fn ($entry) => [
                'id' => $entry->id,
                'ticket' => [
                    'id' => $entry->ticket->id,
                    'number' => $entry->ticket->number,
                    'title' => $entry->ticket->title,
                ],
                'user' => $entry->user ? [
                    'id' => $entry->user->id,
                    'name' => $entry->user->name,
                ] : null,
                'minutes' => $entry->minutes,
                'billable_minutes' => $entry->billable_minutes,
                'formatted_time' => TimeEntry::formatMinutes($entry->minutes),
                'formatted_billable_time' => TimeEntry::formatMinutes($entry->billable_minutes),
                'description' => $entry->description,
                'date_worked' => $entry->date_worked->toDateString(),
                'category' => $entry->hourlyRateCategory ? [
                    'id' => $entry->hourlyRateCategory->id,
                    'name' => $entry->hourlyRateCategory->name,
                ] : null,
            ]),
            'summary' => [
                'total_entries' => $timeEntries->count(),
                'total_minutes' => $timeEntries->sum('minutes'),
                'total_billable_minutes' => $timeEntries->sum('billable_minutes'),
            ],
        ]);
    }

    /**
     * Create a new invoice from time entries and/or billable items
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'time_entry_ids' => ['nullable', 'array'],
            'time_entry_ids.*' => ['integer', 'exists:helpdesk_time_entries,id'],
            'billable_items' => ['nullable', 'array'],
            'billable_items.*.billable_item_id' => ['required', 'exists:helpdesk_billable_items,id'],
            'billable_items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'billable_items.*.rate' => ['nullable', 'numeric', 'min:0'],
            'billable_items.*.description' => ['nullable', 'string', 'max:500'],
            'custom_items' => ['nullable', 'array'],
            'custom_items.*.description' => ['required', 'string', 'max:500'],
            'custom_items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'custom_items.*.rate' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'billing_name' => ['nullable', 'string', 'max:255'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'billing_address' => ['nullable', 'string', 'max:1000'],
            'issue_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_description' => ['nullable', 'string', 'max:255'],
            'credit_amount' => ['nullable', 'numeric', 'min:0'],
            'credit_description' => ['nullable', 'string', 'max:255'],
        ]);

        // Ensure at least one item type is provided
        $hasTimeEntries = ! empty($validated['time_entry_ids']);
        $hasBillableItems = ! empty($validated['billable_items']);
        $hasCustomItems = ! empty($validated['custom_items']);

        if (! $hasTimeEntries && ! $hasBillableItems && ! $hasCustomItems) {
            return response()->json([
                'message' => 'Invoice must include at least one time entry, billable item, or custom item',
            ], 422);
        }

        // Get invoice settings
        $settings = $project->getInvoiceSettings();

        try {
            $invoice = DB::transaction(function () use ($project, $validated, $settings, $hasTimeEntries, $hasBillableItems, $hasCustomItems) {
                // Create the invoice
                $invoice = Invoice::create([
                    'project_id' => $project->id,
                    'invoice_number' => $settings->generateInvoiceNumber(),
                    'status' => Invoice::STATUS_DRAFT,
                    'billing_name' => $validated['billing_name'] ?? $project->client_name ?? $project->name,
                    'billing_email' => $validated['billing_email'] ?? $project->client_email,
                    'billing_address' => $validated['billing_address'] ?? $project->client_address,
                    'notes' => $validated['notes'] ?? null,
                    'issue_date' => $validated['issue_date'] ?? now()->toDateString(),
                    'due_date' => $validated['due_date'] ?? null,
                    'subtotal' => 0,
                    'discount_amount' => $validated['discount_amount'] ?? 0,
                    'discount_description' => $validated['discount_description'] ?? null,
                    'credit_amount' => $validated['credit_amount'] ?? 0,
                    'credit_description' => $validated['credit_description'] ?? null,
                    'tax_rate' => $validated['tax_rate'] ?? 0,
                    'tax_amount' => 0,
                    'total' => 0,
                    'paid_amount' => 0,
                ]);

                // Process time entries
                if ($hasTimeEntries) {
                    $this->processTimeEntries($invoice, $validated['time_entry_ids'], $project);
                }

                // Process billable items
                if ($hasBillableItems) {
                    $this->processBillableItems($invoice, $validated['billable_items']);
                }

                // Process custom items
                if ($hasCustomItems) {
                    $this->processCustomItems($invoice, $validated['custom_items']);
                }

                // Recalculate totals
                $invoice->recalculateTotals();

                return $invoice;
            });

            return response()->json([
                'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
                'message' => 'Invoice created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create invoice: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single invoice
     */
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load([
            'project',
            'lineItems.category',
            'lineItems.billableItem',
            'lineItems.timeEntries.ticket:id,number,title',
            'payments',
        ]);

        return response()->json([
            'data' => $this->formatInvoice($invoice),
        ]);
    }

    /**
     * Update invoice (only draft invoices)
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        if (! $invoice->is_editable) {
            return response()->json([
                'message' => 'Only draft invoices can be edited',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
            'billing_name' => ['nullable', 'string', 'max:255'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'billing_address' => ['nullable', 'string', 'max:1000'],
            'issue_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_description' => ['nullable', 'string', 'max:255'],
            'credit_amount' => ['nullable', 'numeric', 'min:0'],
            'credit_description' => ['nullable', 'string', 'max:255'],
            'line_items' => ['nullable', 'array'],
            'line_items.*.id' => ['nullable', 'integer'],
            'line_items.*.type' => ['required_with:line_items', 'string', 'in:time,billable_item,custom'],
            'line_items.*.description' => ['required_with:line_items', 'string', 'max:500'],
            'line_items.*.quantity' => ['required_with:line_items', 'numeric', 'min:0'],
            'line_items.*.rate' => ['required_with:line_items', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($invoice, $validated) {
            // Update invoice fields
            $invoice->update([
                'notes' => $validated['notes'] ?? $invoice->notes,
                'billing_name' => $validated['billing_name'] ?? $invoice->billing_name,
                'billing_email' => $validated['billing_email'] ?? $invoice->billing_email,
                'billing_address' => $validated['billing_address'] ?? $invoice->billing_address,
                'issue_date' => $validated['issue_date'] ?? $invoice->issue_date,
                'due_date' => $validated['due_date'] ?? $invoice->due_date,
                'tax_rate' => $validated['tax_rate'] ?? $invoice->tax_rate,
                'discount_amount' => $validated['discount_amount'] ?? $invoice->discount_amount,
                'discount_description' => $validated['discount_description'] ?? $invoice->discount_description,
                'credit_amount' => $validated['credit_amount'] ?? $invoice->credit_amount,
                'credit_description' => $validated['credit_description'] ?? $invoice->credit_description,
            ]);

            // Process line items if provided
            if (isset($validated['line_items'])) {
                $existingIds = [];

                foreach ($validated['line_items'] as $itemData) {
                    if (! empty($itemData['id'])) {
                        // Update existing line item
                        $lineItem = $invoice->lineItems()->find($itemData['id']);
                        if ($lineItem) {
                            $lineItem->update([
                                'description' => $itemData['description'],
                                'quantity' => $itemData['quantity'],
                                'rate' => $itemData['rate'],
                            ]);
                            $existingIds[] = $lineItem->id;
                        }
                    } else {
                        // Create new line item
                        $lineItem = $invoice->lineItems()->create([
                            'type' => $itemData['type'],
                            'description' => $itemData['description'],
                            'quantity' => $itemData['quantity'],
                            'rate' => $itemData['rate'],
                        ]);
                        $existingIds[] = $lineItem->id;
                    }
                }

                // Delete line items that were removed (not for time entries - they need special handling)
                $invoice->lineItems()
                    ->whereNotIn('id', $existingIds)
                    ->where('type', '!=', InvoiceLineItem::TYPE_TIME)
                    ->delete();
            }

            // Recalculate totals
            $invoice->recalculateTotals();
        });

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'message' => 'Invoice updated successfully',
        ]);
    }

    /**
     * Add a line item to a draft invoice
     */
    public function addLineItem(Request $request, Invoice $invoice): JsonResponse
    {
        if (! $invoice->is_editable) {
            return response()->json([
                'message' => 'Only draft invoices can be edited',
            ], 422);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:time,billable_item,custom'],
            'time_entry_ids' => ['required_if:type,time', 'array'],
            'time_entry_ids.*' => ['integer', 'exists:helpdesk_time_entries,id'],
            'billable_item_id' => ['required_if:type,billable_item', 'exists:helpdesk_billable_items,id'],
            'quantity' => ['required_unless:type,time', 'numeric', 'min:0.01'],
            'rate' => ['required_if:type,custom', 'numeric', 'min:0'],
            'description' => ['required_if:type,custom', 'string', 'max:500'],
        ]);

        switch ($validated['type']) {
            case 'time':
                $this->processTimeEntries($invoice, $validated['time_entry_ids'], $invoice->project);
                break;
            case 'billable_item':
                $this->processBillableItems($invoice, [[
                    'billable_item_id' => $validated['billable_item_id'],
                    'quantity' => $validated['quantity'],
                    'rate' => $validated['rate'] ?? null,
                ]]);
                break;
            case 'custom':
                $this->processCustomItems($invoice, [[
                    'description' => $validated['description'],
                    'quantity' => $validated['quantity'],
                    'rate' => $validated['rate'],
                ]]);
                break;
        }

        $invoice->recalculateTotals();

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'message' => 'Line item added successfully',
        ]);
    }

    /**
     * Remove a line item from a draft invoice
     */
    public function removeLineItem(Invoice $invoice, InvoiceLineItem $lineItem): JsonResponse
    {
        if (! $invoice->is_editable) {
            return response()->json([
                'message' => 'Only draft invoices can be edited',
            ], 422);
        }

        if ($lineItem->invoice_id !== $invoice->id) {
            return response()->json(['message' => 'Line item not found'], 404);
        }

        // Unlink time entries if this was a time line item
        TimeEntry::where('invoice_line_item_id', $lineItem->id)
            ->update(['invoice_line_item_id' => null]);

        $lineItem->delete();
        $invoice->recalculateTotals();

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'message' => 'Line item removed successfully',
        ]);
    }

    /**
     * Send invoice (change status from draft to sent)
     */
    public function send(Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== Invoice::STATUS_DRAFT) {
            return response()->json([
                'message' => 'Only draft invoices can be sent',
            ], 422);
        }

        // Ensure we have a billing email
        $billingEmail = $invoice->billing_email ?: $invoice->project->client_email;
        if (! $billingEmail) {
            return response()->json([
                'message' => 'Invoice requires a billing email address before sending',
            ], 422);
        }

        // Set due date if not already set
        if (! $invoice->due_date) {
            $settings = $invoice->project->getInvoiceSettings();
            $invoice->due_date = now()->addDays($settings->payment_terms_days ?? 30);
        }

        $invoice->status = Invoice::STATUS_SENT;
        $invoice->sent_at = now();
        $invoice->save();

        // Generate public URL for client access
        $publicUrl = PublicInvoiceController::generatePublicUrl($invoice);

        // Send email notification
        Mail::to($billingEmail)->send(
            new InvoiceSent($invoice, $publicUrl, attachPdf: true)
        );

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'public_url' => $publicUrl,
            'message' => 'Invoice sent successfully',
        ]);
    }

    /**
     * Resend an invoice that has already been sent
     */
    public function resend(Invoice $invoice): JsonResponse
    {
        if (! in_array($invoice->status, [Invoice::STATUS_SENT, Invoice::STATUS_PARTIAL, Invoice::STATUS_OVERDUE])) {
            return response()->json([
                'message' => 'Can only resend invoices that have been sent',
            ], 422);
        }

        // Ensure we have a billing email
        $billingEmail = $invoice->billing_email ?: $invoice->project->client_email;
        if (! $billingEmail) {
            return response()->json([
                'message' => 'Invoice requires a billing email address before sending',
            ], 422);
        }

        // Generate new public URL
        $publicUrl = PublicInvoiceController::generatePublicUrl($invoice);

        // Send email notification
        Mail::to($billingEmail)->send(
            new InvoiceSent($invoice, $publicUrl, attachPdf: true)
        );

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'public_url' => $publicUrl,
            'message' => 'Invoice resent successfully',
        ]);
    }

    /**
     * Void an invoice
     */
    public function void(Invoice $invoice): JsonResponse
    {
        if (! $invoice->can_void) {
            return response()->json([
                'message' => 'Cannot void this invoice (has payments or already void)',
            ], 422);
        }

        DB::transaction(function () use ($invoice) {
            // Unlink all time entries
            TimeEntry::whereIn('invoice_line_item_id', $invoice->lineItems->pluck('id'))
                ->update(['invoice_line_item_id' => null]);

            $invoice->status = Invoice::STATUS_VOID;
            $invoice->save();
        });

        return response()->json([
            'data' => $this->formatInvoice($invoice->fresh(['lineItems', 'payments', 'project'])),
            'message' => 'Invoice voided successfully',
        ]);
    }

    /**
     * Delete a draft invoice
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== Invoice::STATUS_DRAFT) {
            return response()->json([
                'message' => 'Only draft invoices can be deleted',
            ], 422);
        }

        DB::transaction(function () use ($invoice) {
            // Unlink time entries
            TimeEntry::whereIn('invoice_line_item_id', $invoice->lineItems->pluck('id'))
                ->update(['invoice_line_item_id' => null]);

            // Delete line items and invoice
            $invoice->lineItems()->delete();
            $invoice->delete();
        });

        return response()->json([
            'message' => 'Invoice deleted successfully',
        ]);
    }

    private function processTimeEntries(Invoice $invoice, array $timeEntryIds, Project $project): void
    {
        // Validate time entries belong to this project and are unbilled
        $timeEntries = TimeEntry::whereIn('id', $timeEntryIds)
            ->whereHas('ticket', fn ($q) => $q->where('project_id', $project->id))
            ->whereNull('invoice_line_item_id')
            ->where('is_billable', true)
            ->get();

        // Group by category
        $grouped = $timeEntries->groupBy('hourly_rate_category_id');

        foreach ($grouped as $categoryId => $entries) {
            $totalMinutes = $entries->sum('billable_minutes');
            $hours = $totalMinutes / 60;

            // Get the effective rate for this category
            $rate = $categoryId
                ? ProjectHourlyRate::getEffectiveRate($project->id, $categoryId, now()->toDateString()) ?? 0
                : 0;

            $description = $categoryId
                ? $entries->first()->hourlyRateCategory?->name.' - '.count($entries).' entries'
                : 'Miscellaneous Time - '.count($entries).' entries';

            $lineItem = $invoice->lineItems()->create([
                'type' => InvoiceLineItem::TYPE_TIME,
                'category_id' => $categoryId ?: null,
                'description' => $description,
                'quantity' => round($hours, 2),
                'rate' => $rate,
            ]);

            // Link time entries to this line item
            TimeEntry::whereIn('id', $entries->pluck('id'))
                ->update(['invoice_line_item_id' => $lineItem->id]);
        }
    }

    private function processBillableItems(Invoice $invoice, array $items): void
    {
        foreach ($items as $item) {
            $billableItem = BillableItem::find($item['billable_item_id']);
            $rate = $item['rate'] ?? $billableItem->default_rate;

            $invoice->lineItems()->create([
                'type' => InvoiceLineItem::TYPE_BILLABLE_ITEM,
                'billable_item_id' => $billableItem->id,
                'description' => $item['description'] ?? $billableItem->name,
                'quantity' => $item['quantity'],
                'rate' => $rate,
            ]);
        }
    }

    private function processCustomItems(Invoice $invoice, array $items): void
    {
        foreach ($items as $item) {
            $invoice->lineItems()->create([
                'type' => InvoiceLineItem::TYPE_CUSTOM,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'rate' => $item['rate'],
            ]);
        }
    }

    private function formatInvoice(Invoice $invoice): array
    {
        $project = $invoice->project;

        return [
            'id' => $invoice->id,
            'uuid' => $invoice->uuid,
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'invoice_number' => $invoice->invoice_number,
            'status' => $invoice->status,
            'billing_name' => $invoice->billing_name ?: $project->client_name ?: $project->name,
            'billing_email' => $invoice->billing_email ?: $project->client_email,
            'billing_address' => $invoice->billing_address ?: $project->client_address,
            'subtotal' => $invoice->subtotal,
            'discount_amount' => $invoice->discount_amount,
            'discount_description' => $invoice->discount_description,
            'credit_amount' => $invoice->credit_amount,
            'credit_description' => $invoice->credit_description,
            'tax_rate' => $invoice->tax_rate,
            'tax_amount' => $invoice->tax_amount,
            'total' => $invoice->total,
            'paid_amount' => $invoice->paid_amount,
            'balance_due' => $invoice->balance_due,
            'notes' => $invoice->notes,
            'issue_date' => $invoice->issue_date?->toDateString(),
            'due_date' => $invoice->due_date?->toDateString(),
            'sent_at' => $invoice->sent_at?->toIso8601String(),
            'paid_at' => $invoice->paid_at?->toIso8601String(),
            'is_editable' => $invoice->is_editable,
            'is_paid' => $invoice->is_paid,
            'can_void' => $invoice->can_void,
            'line_items' => $invoice->lineItems->map(fn ($item) => [
                'id' => $item->id,
                'type' => $item->type,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'rate' => $item->rate,
                'amount' => $item->amount,
                'category' => $item->category ? [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ] : null,
                'billable_item' => $item->billableItem ? [
                    'id' => $item->billableItem->id,
                    'name' => $item->billableItem->name,
                ] : null,
                'time_entries' => $item->timeEntries?->map(fn ($entry) => [
                    'id' => $entry->id,
                    'ticket_number' => $entry->ticket?->number,
                    'ticket_title' => $entry->ticket?->title,
                    'minutes' => $entry->minutes,
                    'billable_minutes' => $entry->billable_minutes,
                    'date_worked' => $entry->date_worked->toDateString(),
                ]) ?? [],
            ]),
            'payments' => $invoice->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'method_name' => $payment->method_name,
                'reference_number' => $payment->reference_number,
                'notes' => $payment->notes,
                'paid_at' => $payment->created_at->toIso8601String(),
            ]),
            'created_at' => $invoice->created_at->toIso8601String(),
            'updated_at' => $invoice->updated_at->toIso8601String(),
        ];
    }

    /**
     * Download invoice as PDF.
     */
    public function downloadPdf(Invoice $invoice, InvoicePdfService $pdfService): Response
    {
        return $pdfService->download($invoice);
    }

    /**
     * View invoice PDF in browser.
     */
    public function viewPdf(Invoice $invoice, InvoicePdfService $pdfService): Response
    {
        return $pdfService->stream($invoice);
    }
}
