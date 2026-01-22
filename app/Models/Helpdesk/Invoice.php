<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use SoftDeletes;

    protected $table = 'helpdesk_invoices';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    public const STATUS_PAID = 'paid';

    public const STATUS_PARTIAL = 'partial';

    public const STATUS_OVERDUE = 'overdue';

    public const STATUS_VOID = 'void';

    protected $fillable = [
        'project_id',
        'uuid',
        'invoice_number',
        'status',
        'period_start',
        'period_end',
        'issue_date',
        'due_date',
        'subtotal',
        'discount_amount',
        'discount_description',
        'credit_amount',
        'credit_description',
        'tax_rate',
        'tax_amount',
        'total',
        'amount_paid',
        'currency',
        'notes',
        'internal_notes',
        'bill_to_name',
        'bill_to_email',
        'bill_to_address',
        'stripe_invoice_id',
        'stripe_payment_intent_id',
        'stripe_hosted_invoice_url',
        'stripe_checkout_session_id',
        'created_by',
        'sent_at',
        'paid_at',
        'voided_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = Str::uuid()->toString();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'credit_amount' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'sent_at' => 'datetime',
            'paid_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    /**
     * Accessor for billing_name (maps to bill_to_name column).
     */
    public function getBillingNameAttribute(): ?string
    {
        return $this->bill_to_name;
    }

    /**
     * Mutator for billing_name (maps to bill_to_name column).
     */
    public function setBillingNameAttribute(?string $value): void
    {
        $this->attributes['bill_to_name'] = $value;
    }

    /**
     * Accessor for billing_email (maps to bill_to_email column).
     */
    public function getBillingEmailAttribute(): ?string
    {
        return $this->bill_to_email;
    }

    /**
     * Mutator for billing_email (maps to bill_to_email column).
     */
    public function setBillingEmailAttribute(?string $value): void
    {
        $this->attributes['bill_to_email'] = $value;
    }

    /**
     * Accessor for billing_address (maps to bill_to_address column).
     */
    public function getBillingAddressAttribute(): ?string
    {
        return $this->bill_to_address;
    }

    /**
     * Mutator for billing_address (maps to bill_to_address column).
     */
    public function setBillingAddressAttribute(?string $value): void
    {
        $this->attributes['bill_to_address'] = $value;
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(InvoiceLineItem::class)->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(InvoicePayment::class)->orderBy('payment_date');
    }

    public function timeEntries(): HasManyThrough
    {
        return $this->hasManyThrough(
            TimeEntry::class,
            InvoiceLineItem::class,
            'invoice_id',
            'invoice_line_item_id',
            'id',
            'id'
        );
    }

    /**
     * Calculate the remaining balance.
     */
    public function getBalanceDueAttribute(): float
    {
        return max(0, (float) $this->total - (float) $this->amount_paid);
    }

    /**
     * Check if invoice is fully paid.
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->balance_due <= 0;
    }

    /**
     * Check if invoice is editable (only drafts can be edited).
     */
    public function getIsEditableAttribute(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if invoice can be voided.
     */
    public function getCanVoidAttribute(): bool
    {
        return $this->status !== self::STATUS_PAID;
    }

    /**
     * Recalculate totals from line items.
     */
    public function recalculateTotals(): void
    {
        $this->subtotal = $this->lineItems()->sum('amount');
        $adjustedSubtotal = $this->subtotal - ($this->discount_amount ?? 0) - ($this->credit_amount ?? 0);
        $this->tax_amount = $this->tax_rate && $adjustedSubtotal > 0
            ? round($adjustedSubtotal * ($this->tax_rate / 100), 2)
            : 0;
        $this->total = max(0, $adjustedSubtotal + $this->tax_amount);
        $this->save();
    }

    /**
     * Update payment status based on payments.
     */
    public function updatePaymentStatus(): void
    {
        $this->amount_paid = $this->payments()->sum('amount');

        if ($this->amount_paid >= $this->total) {
            $this->status = self::STATUS_PAID;
            $this->paid_at = now();
        } elseif ($this->amount_paid > 0) {
            $this->status = self::STATUS_PARTIAL;
        }

        $this->save();
    }

    /**
     * Scope for draft invoices.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope for unpaid invoices.
     */
    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', [self::STATUS_SENT, self::STATUS_PARTIAL, self::STATUS_OVERDUE]);
    }

    /**
     * Scope for a specific project.
     */
    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }
}
