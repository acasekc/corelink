<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvoiceLineItem extends Model
{
    protected $table = 'helpdesk_invoice_line_items';

    public const TYPE_TIME = 'time';

    public const TYPE_BILLABLE_ITEM = 'billable_item';

    public const TYPE_CUSTOM = 'custom';

    protected $fillable = [
        'invoice_id',
        'type',
        'category_id',
        'billable_item_id',
        'description',
        'quantity',
        'unit',
        'rate',
        'amount',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'rate' => 'decimal:2',
            'amount' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(HourlyRateCategory::class, 'category_id');
    }

    public function billableItem(): BelongsTo
    {
        return $this->belongsTo(BillableItem::class, 'billable_item_id');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class, 'invoice_line_item_id');
    }

    /**
     * Calculate and set the amount based on quantity and rate.
     */
    public function calculateAmount(): void
    {
        $this->amount = round($this->quantity * $this->rate, 2);
    }

    protected static function booted(): void
    {
        static::saving(function (InvoiceLineItem $item) {
            $item->amount = round($item->quantity * $item->rate, 2);
        });

        static::saved(function (InvoiceLineItem $item) {
            $item->invoice->recalculateTotals();
        });

        static::deleted(function (InvoiceLineItem $item) {
            $item->invoice->recalculateTotals();
        });
    }
}
