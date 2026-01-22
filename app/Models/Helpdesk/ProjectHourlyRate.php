<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectHourlyRate extends Model
{
    protected $table = 'helpdesk_project_hourly_rates';

    protected $fillable = [
        'project_id',
        'category_id',
        'rate',
        'effective_from',
        'effective_to',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:2',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(HourlyRateCategory::class, 'category_id');
    }

    /**
     * Get the effective rate for a specific date.
     */
    public static function getEffectiveRate(int $projectId, int $categoryId, string $date): ?float
    {
        return static::where('project_id', $projectId)
            ->where('category_id', $categoryId)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('effective_from')
            ->value('rate');
    }

    /**
     * Scope to get current rates only (no end date or end date in future).
     */
    public function scopeCurrent($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('effective_to')
                ->orWhere('effective_to', '>=', now()->toDateString());
        });
    }
}
