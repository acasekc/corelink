<?php

namespace App\Models\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Enums\Helpdesk\OverageMode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnthropicApiConfig extends Model
{
    protected $table = 'helpdesk_anthropic_api_configs';

    protected $fillable = [
        'project_id',
        'api_key_name',
        'api_key_encrypted',
        'plan_tier',
        'plan_tier_id',
        'included_allowance',
        'grace_threshold',
        'markup_percentage',
        'overage_mode',
        'notification_emails',
        'key_status',
        'cycle_start_day',
        'cycle_usage_cents',
        'last_synced_at',
        'disabled_reason',
    ];

    protected function casts(): array
    {
        return [
            'api_key_encrypted' => 'encrypted',
            'included_allowance' => 'decimal:2',
            'grace_threshold' => 'decimal:2',
            'markup_percentage' => 'decimal:2',
            'overage_mode' => OverageMode::class,
            'notification_emails' => 'array',
            'key_status' => ApiKeyStatus::class,
            'cycle_start_day' => 'integer',
            'cycle_usage_cents' => 'integer',
            'last_synced_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function planTier(): BelongsTo
    {
        return $this->belongsTo(AnthropicPlanTier::class, 'plan_tier_id');
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(AnthropicUsageLog::class, 'anthropic_config_id');
    }

    public function isActive(): bool
    {
        return $this->key_status === ApiKeyStatus::Active;
    }

    public function isInGrace(): bool
    {
        return $this->key_status === ApiKeyStatus::Grace;
    }

    public function isDisabled(): bool
    {
        return $this->key_status === ApiKeyStatus::Disabled;
    }

    public function isSuspended(): bool
    {
        return $this->key_status === ApiKeyStatus::Suspended;
    }

    /**
     * Get cycle usage as a dollar amount.
     */
    public function cycleUsageDollars(): float
    {
        return $this->cycle_usage_cents / 100;
    }

    /**
     * Get the included allowance in cents.
     */
    public function includedAllowanceCents(): int
    {
        return (int) round($this->included_allowance * 100);
    }

    /**
     * Get the grace threshold in cents.
     */
    public function graceThresholdCents(): int
    {
        return (int) round($this->grace_threshold * 100);
    }

    /**
     * Get remaining allowance in cents before entering grace zone.
     */
    public function allowanceRemainingCents(): int
    {
        return max(0, $this->includedAllowanceCents() - $this->cycle_usage_cents);
    }

    /**
     * Check if usage exceeds the included allowance.
     */
    public function isOverAllowance(): bool
    {
        return $this->cycle_usage_cents > $this->includedAllowanceCents();
    }

    /**
     * Check if usage exceeds the grace threshold.
     */
    public function isOverGraceThreshold(): bool
    {
        return $this->cycle_usage_cents >= $this->graceThresholdCents();
    }

    /**
     * Get the overage amount in cents (usage beyond included allowance).
     */
    public function overageCents(): int
    {
        return max(0, $this->cycle_usage_cents - $this->includedAllowanceCents());
    }

    /**
     * Get the overage amount with markup applied, in cents.
     */
    public function overageWithMarkupCents(): int
    {
        $overage = $this->overageCents();
        $markupMultiplier = 1 + ($this->markup_percentage / 100);

        return (int) round($overage * $markupMultiplier);
    }

    /**
     * Get the masked API key for display purposes.
     */
    public function maskedApiKey(): ?string
    {
        $key = $this->api_key_encrypted;

        if (! $key) {
            return null;
        }

        if (strlen($key) <= 12) {
            return str_repeat('•', strlen($key));
        }

        return substr($key, 0, 8).str_repeat('•', strlen($key) - 12).substr($key, -4);
    }
}
