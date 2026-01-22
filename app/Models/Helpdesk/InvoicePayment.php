<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoicePayment extends Model
{
    protected $table = 'helpdesk_invoice_payments';

    public const METHOD_STRIPE = 'stripe';

    public const METHOD_CASH = 'cash';

    public const METHOD_COD = 'cod';

    public const METHOD_CHECK = 'check';

    public const METHOD_BANK_TRANSFER = 'bank_transfer';

    public const METHOD_OTHER = 'other';

    protected $fillable = [
        'invoice_id',
        'amount',
        'payment_method',
        'stripe_payment_id',
        'stripe_charge_id',
        'reference_number',
        'payment_date',
        'notes',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get human-readable payment method name.
     */
    public function getMethodNameAttribute(): string
    {
        return match ($this->payment_method) {
            self::METHOD_STRIPE => 'Credit Card (Stripe)',
            self::METHOD_CASH => 'Cash',
            self::METHOD_COD => 'Cash on Delivery',
            self::METHOD_CHECK => 'Check',
            self::METHOD_BANK_TRANSFER => 'Bank Transfer',
            default => 'Other',
        };
    }

    protected static function booted(): void
    {
        static::saved(function (InvoicePayment $payment) {
            $payment->invoice->updatePaymentStatus();
        });

        static::deleted(function (InvoicePayment $payment) {
            $payment->invoice->updatePaymentStatus();
        });
    }
}
