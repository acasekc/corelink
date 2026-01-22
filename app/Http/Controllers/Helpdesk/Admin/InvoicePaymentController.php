<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoicePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoicePaymentController extends Controller
{
    /**
     * Record a manual payment (cash, check, bank transfer, COD)
     */
    public function store(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->is_paid) {
            return response()->json([
                'message' => 'Invoice is already fully paid',
            ], 422);
        }

        if ($invoice->status === Invoice::STATUS_VOID) {
            return response()->json([
                'message' => 'Cannot add payment to a voided invoice',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$invoice->balance_due],
            'payment_method' => ['required', 'string', 'in:'.implode(',', [
                InvoicePayment::METHOD_CASH,
                InvoicePayment::METHOD_CHECK,
                InvoicePayment::METHOD_BANK_TRANSFER,
                InvoicePayment::METHOD_COD,
                InvoicePayment::METHOD_OTHER,
            ])],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'payment_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Default payment_date to today if not provided
        $validated['payment_date'] = $validated['payment_date'] ?? now()->toDateString();

        $payment = $invoice->payments()->create($validated);

        // The model observer will update invoice status automatically

        return response()->json([
            'data' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'method_name' => $payment->method_name,
                'reference_number' => $payment->reference_number,
                'payment_date' => $payment->payment_date->toDateString(),
                'notes' => $payment->notes,
                'created_at' => $payment->created_at->toIso8601String(),
            ],
            'invoice' => [
                'id' => $invoice->id,
                'status' => $invoice->fresh()->status,
                'paid_amount' => $invoice->fresh()->paid_amount,
                'balance_due' => $invoice->fresh()->balance_due,
                'is_paid' => $invoice->fresh()->is_paid,
            ],
            'message' => 'Payment recorded successfully',
        ], 201);
    }

    /**
     * Delete (soft-delete) a payment with a reason
     */
    public function destroy(Request $request, Invoice $invoice, InvoicePayment $payment): JsonResponse
    {
        if ($payment->invoice_id !== $invoice->id) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $payment->update([
            'deleted_reason' => $validated['reason'],
            'deleted_by' => $request->user()?->id,
        ]);

        $payment->delete();

        // The model observer will update invoice status automatically

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'status' => $invoice->fresh()->status,
                'paid_amount' => $invoice->fresh()->paid_amount,
                'balance_due' => $invoice->fresh()->balance_due,
                'is_paid' => $invoice->fresh()->is_paid,
            ],
            'message' => 'Payment removed successfully',
        ]);
    }
}
