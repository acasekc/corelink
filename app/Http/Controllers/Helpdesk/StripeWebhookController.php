<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Invoice;
use App\Services\Helpdesk\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Event;

class StripeWebhookController extends Controller
{
    public function __construct(
        protected StripePaymentService $stripeService
    ) {}

    /**
     * Handle incoming Stripe webhooks.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        if (! $signature) {
            Log::warning('Stripe webhook received without signature');

            return response('Missing signature', 400);
        }

        try {
            $event = $this->stripeService->verifyWebhookSignature($payload, $signature);
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response('Invalid signature', 400);
        }

        Log::info('Stripe webhook received', [
            'type' => $event->type,
            'id' => $event->id,
        ]);

        return match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event),
            'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($event),
            'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($event),
            default => response('Webhook received', 200),
        };
    }

    /**
     * Handle checkout.session.completed event.
     * This is the primary event when a customer completes checkout.
     */
    protected function handleCheckoutSessionCompleted(Event $event): Response
    {
        $session = $event->data->object;

        // Get invoice from metadata
        $invoiceId = $session->metadata->invoice_id ?? null;

        if (! $invoiceId) {
            Log::warning('Stripe checkout session has no invoice_id in metadata', [
                'session_id' => $session->id,
            ]);

            return response('No invoice ID', 200);
        }

        $invoice = Invoice::find($invoiceId);

        if (! $invoice) {
            Log::warning('Invoice not found for Stripe payment', [
                'invoice_id' => $invoiceId,
            ]);

            return response('Invoice not found', 200);
        }

        // Check if payment is already recorded for this session
        $existingPayment = $invoice->payments()
            ->where('stripe_payment_id', $session->payment_intent)
            ->first();

        if ($existingPayment) {
            Log::info('Payment already recorded for this checkout session', [
                'invoice_id' => $invoiceId,
                'session_id' => $session->id,
            ]);

            return response('Payment already recorded', 200);
        }

        // Convert amount from cents to dollars
        $amount = $session->amount_total / 100;

        // Record the payment
        $this->stripeService->recordPayment(
            $invoice,
            $session->payment_intent,
            $amount
        );

        Log::info('Stripe payment recorded successfully', [
            'invoice_id' => $invoiceId,
            'invoice_number' => $invoice->invoice_number,
            'amount' => $amount,
            'session_id' => $session->id,
        ]);

        return response('Payment recorded', 200);
    }

    /**
     * Handle payment_intent.succeeded event.
     * This is a backup - checkout.session.completed should handle most cases.
     */
    protected function handlePaymentIntentSucceeded(Event $event): Response
    {
        $paymentIntent = $event->data->object;

        $invoiceId = $paymentIntent->metadata->invoice_id ?? null;

        if (! $invoiceId) {
            // This might be a subscription or non-invoice payment
            return response('No invoice ID', 200);
        }

        $invoice = Invoice::find($invoiceId);

        if (! $invoice) {
            Log::warning('Invoice not found for payment intent', [
                'invoice_id' => $invoiceId,
            ]);

            return response('Invoice not found', 200);
        }

        // Check if payment already exists
        $existingPayment = $invoice->payments()
            ->where('stripe_payment_id', $paymentIntent->id)
            ->first();

        if ($existingPayment) {
            return response('Payment already recorded', 200);
        }

        // Record the payment
        $amount = $paymentIntent->amount_received / 100;

        $chargeId = null;
        if (! empty($paymentIntent->latest_charge)) {
            $chargeId = $paymentIntent->latest_charge;
        }

        $this->stripeService->recordPayment(
            $invoice,
            $paymentIntent->id,
            $amount,
            $chargeId
        );

        Log::info('Stripe payment recorded from payment_intent.succeeded', [
            'invoice_id' => $invoiceId,
            'invoice_number' => $invoice->invoice_number,
            'amount' => $amount,
        ]);

        return response('Payment recorded', 200);
    }

    /**
     * Handle payment_intent.payment_failed event.
     */
    protected function handlePaymentIntentFailed(Event $event): Response
    {
        $paymentIntent = $event->data->object;

        $invoiceId = $paymentIntent->metadata->invoice_id ?? null;

        if ($invoiceId) {
            Log::warning('Stripe payment failed', [
                'invoice_id' => $invoiceId,
                'payment_intent' => $paymentIntent->id,
                'error' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
            ]);
        }

        return response('Webhook processed', 200);
    }
}
