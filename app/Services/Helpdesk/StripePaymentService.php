<?php

namespace App\Services\Helpdesk;

use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoicePayment;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

class StripePaymentService
{
    protected ?StripeClient $stripe = null;

    /**
     * Check if Stripe is configured.
     */
    public function isConfigured(): bool
    {
        return ! empty(config('services.stripe.secret'));
    }

    /**
     * Get the Stripe client instance.
     */
    protected function getClient(): StripeClient
    {
        if (! $this->stripe) {
            $this->stripe = new StripeClient(config('services.stripe.secret'));
        }

        return $this->stripe;
    }

    /**
     * Create a Stripe Checkout Session for an invoice.
     *
     * This allows clients to pay via Stripe's hosted checkout page.
     */
    public function createCheckoutSession(Invoice $invoice, string $successUrl, string $cancelUrl): Session
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Stripe is not configured. Please set STRIPE_KEY and STRIPE_SECRET in your environment.');
        }

        if ($invoice->is_paid) {
            throw new \InvalidArgumentException('Invoice is already paid.');
        }

        if ($invoice->status === Invoice::STATUS_VOID) {
            throw new \InvalidArgumentException('Cannot create payment for a voided invoice.');
        }

        $client = $this->getClient();

        // Use balance_due as a single line item to ensure accuracy
        // This accounts for discounts, credits, taxes, and partial payments
        $balanceDue = (float) $invoice->balance_due;

        if ($balanceDue <= 0) {
            throw new \InvalidArgumentException('Invoice has no balance due.');
        }

        $lineItems = [
            [
                'price_data' => [
                    'currency' => strtolower($invoice->currency ?? 'usd'),
                    'product_data' => [
                        'name' => 'Invoice #'.$invoice->invoice_number,
                        'description' => $invoice->project?->name ?? 'Services',
                    ],
                    'unit_amount' => (int) round($balanceDue * 100), // Stripe uses cents
                ],
                'quantity' => 1,
            ],
        ];

        $sessionData = [
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $successUrl.'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
            ],
            'payment_intent_data' => [
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                ],
            ],
        ];

        // Only include customer_email if it's a valid email address
        $billingEmail = $invoice->billing_email;
        if ($billingEmail && filter_var($billingEmail, FILTER_VALIDATE_EMAIL)) {
            $sessionData['customer_email'] = $billingEmail;
        }

        $session = $client->checkout->sessions->create($sessionData);

        // Store session ID on invoice for reference
        $invoice->update([
            'stripe_checkout_session_id' => $session->id,
        ]);

        return $session;
    }

    /**
     * Create a simple payment link for the invoice balance due.
     * Returns the checkout session URL.
     */
    public function createPaymentLink(Invoice $invoice, string $returnUrl): string
    {
        $successUrl = $returnUrl.'?payment=success';
        $cancelUrl = $returnUrl.'?payment=cancelled';

        $session = $this->createCheckoutSession($invoice, $successUrl, $cancelUrl);

        return $session->url;
    }

    /**
     * Record a successful Stripe payment on an invoice.
     */
    public function recordPayment(Invoice $invoice, string $paymentIntentId, float $amount, ?string $chargeId = null): InvoicePayment
    {
        return $invoice->payments()->create([
            'amount' => $amount,
            'payment_method' => InvoicePayment::METHOD_STRIPE,
            'stripe_payment_id' => $paymentIntentId,
            'stripe_charge_id' => $chargeId,
            'payment_date' => now()->toDateString(),
            'notes' => 'Paid via Stripe',
        ]);
    }

    /**
     * Retrieve a PaymentIntent from Stripe.
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return $this->getClient()->paymentIntents->retrieve($paymentIntentId);
    }

    /**
     * Retrieve a Checkout Session from Stripe.
     */
    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return $this->getClient()->checkout->sessions->retrieve($sessionId, [
            'expand' => ['payment_intent'],
        ]);
    }

    /**
     * Verify webhook signature.
     */
    public function verifyWebhookSignature(string $payload, string $signature): \Stripe\Event
    {
        $secret = config('services.stripe.webhook.secret');

        if (! $secret) {
            throw new \RuntimeException('Stripe webhook secret is not configured.');
        }

        return \Stripe\Webhook::constructEvent($payload, $signature, $secret);
    }
}
