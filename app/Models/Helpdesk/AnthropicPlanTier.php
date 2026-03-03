<?php

namespace App\Models\Helpdesk;

use App\Enums\Helpdesk\OverageMode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnthropicPlanTier extends Model
{
    /** @use HasFactory<\Database\Factories\Helpdesk\AnthropicPlanTierFactory> */
    use HasFactory;

    protected $table = 'helpdesk_anthropic_plan_tiers';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'monthly_price',
        'included_allowance',
        'grace_threshold',
        'markup_percentage',
        'overage_mode',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'included_allowance' => 'decimal:2',
            'grace_threshold' => 'decimal:2',
            'markup_percentage' => 'decimal:2',
            'overage_mode' => OverageMode::class,
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function anthropicConfigs(): HasMany
    {
        return $this->hasMany(AnthropicApiConfig::class, 'plan_tier_id');
    }

    /**
     * Scope to only active tiers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<self>  $query
     * @return \Illuminate\Database\Eloquent\Builder<self>
     */
    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort_order.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<self>  $query
     * @return \Illuminate\Database\Eloquent\Builder<self>
     */
    public function scopeOrdered(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Check if this tier is currently assigned to any configs.
     */
    public function isInUse(): bool
    {
        return $this->anthropicConfigs()->exists();
    }
}
