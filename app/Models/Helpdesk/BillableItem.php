<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillableItem extends Model
{
    protected $table = 'helpdesk_billable_items';

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'default_rate',
        'unit',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function invoiceLineItems(): HasMany
    {
        return $this->hasMany(InvoiceLineItem::class, 'billable_item_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
