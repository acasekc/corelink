<?php

namespace App\Http\Controllers\Helpdesk\Public;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Invoice;
use App\Services\Helpdesk\InvoicePdfService;
use App\Services\Helpdesk\StripePaymentService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class InvoiceController extends Controller
{
    /**
     * View an invoice by UUID (public, no signature required).
     */
    public function showByUuid(Invoice $invoice): View
    {
        $invoice->load([
            'project:id,name',
            'lineItems.category:id,name',
            'lineItems.billableItem:id,name',
            'payments',
        ]);

        $stripeService = app(StripePaymentService::class);

        return view('invoice.public', [
            'invoice' => $invoice,
            'project' => $invoice->project,
            'pdfUrl' => route('invoice.public.pdf', ['invoice' => $invoice->uuid]),
            'payUrl' => $invoice->is_paid ? null : route('invoice.public.pay', ['invoice' => $invoice->uuid]),
            'stripeEnabled' => $stripeService->isConfigured(),
            'stripeKey' => config('services.stripe.key'),
        ]);
    }

    /**
     * View invoice PDF by UUID (no signature required).
     */
    public function pdfByUuid(Invoice $invoice, InvoicePdfService $pdfService): HttpResponse
    {
        return $pdfService->stream($invoice);
    }

    /**
     * Generate a public URL for invoice access using UUID.
     */
    public static function generatePublicUrl(Invoice $invoice): string
    {
        return route('invoice.public.show', ['invoice' => $invoice->uuid]);
    }

    /**
     * Create a Stripe Checkout session for payment (by UUID).
     */
    public function createCheckoutSessionByUuid(Invoice $invoice, StripePaymentService $stripeService): JsonResponse
    {
        if ($invoice->is_paid) {
            return response()->json(['message' => 'Invoice is already paid'], 422);
        }

        if (! $stripeService->isConfigured()) {
            return response()->json(['message' => 'Online payments are not configured'], 422);
        }

        // Build return URL using the UUID-based route
        $returnUrl = route('invoice.public.payment-success', ['invoice' => $invoice->uuid]);

        try {
            $checkoutUrl = $stripeService->createPaymentLink($invoice, $returnUrl);

            return response()->json(['checkout_url' => $checkoutUrl]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create payment session: '.$e->getMessage()], 500);
        }
    }

    /**
     * Handle successful payment return (informational only).
     * The actual payment recording happens via webhook.
     */
    public function paymentSuccessByUuid(Invoice $invoice): View
    {
        // Refresh invoice to get latest payment status
        $invoice->refresh();
        $invoice->load([
            'project:id,name',
            'lineItems.category:id,name',
            'lineItems.billableItem:id,name',
            'payments',
        ]);

        $stripeService = app(StripePaymentService::class);

        return view('invoice.public', [
            'invoice' => $invoice,
            'project' => $invoice->project,
            'pdfUrl' => route('invoice.public.pdf', ['invoice' => $invoice->uuid]),
            'payUrl' => null, // No pay button needed on success page
            'stripeEnabled' => $stripeService->isConfigured(),
            'stripeKey' => config('services.stripe.key'),
            'paymentSuccess' => true,
        ]);
    }
}
