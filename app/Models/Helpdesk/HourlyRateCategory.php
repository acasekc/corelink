<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HourlyRateCategory extends Model
{
    protected $table = 'helpdesk_hourly_rate_categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'default_rate',
        'is_active',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order' => 'integer',
            'default_rate' => 'decimal:2',
        ];
    }

    public function projectRates(): HasMany
    {
        return $this->hasMany(ProjectHourlyRate::class, 'category_id');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class, 'hourly_rate_category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }
}
