<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanOutput extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'plan_id',
        'output_type',
        'content',
        'recipient_email',
        'sent_at',
    ];

    protected $casts = [
        'content' => 'array',
        'sent_at' => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(DiscoveryPlan::class, 'plan_id');
    }

    public function markAsSent(): void
    {
        $this->update(['sent_at' => now()]);
    }
}
