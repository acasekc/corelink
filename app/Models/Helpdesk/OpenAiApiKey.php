<?php

namespace App\Models\Helpdesk;

use App\Enums\Helpdesk\OpenAiKeyStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpenAiApiKey extends Model
{
    protected $table = 'helpdesk_openai_api_keys';

    protected $fillable = [
        'openai_config_id',
        'name',
        'openai_service_account_id',
        'openai_api_key_id',
        'api_key_encrypted',
        'status',
        'max_spend_usd',
        'grace_amount_usd',
        'spend_usd',
        'grace_notified_at',
        'last_used_at',
        'suspended_at',
        'revoked_at',
        'revoked_reason',
    ];

    protected function casts(): array
    {
        return [
            'api_key_encrypted' => 'encrypted',
            'status' => OpenAiKeyStatus::class,
            'max_spend_usd' => 'decimal:2',
            'grace_amount_usd' => 'decimal:2',
            'spend_usd' => 'decimal:4',
            'grace_notified_at' => 'datetime',
            'last_used_at' => 'datetime',
            'suspended_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(OpenAiConfig::class, 'openai_config_id');
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(OpenAiUsageLog::class, 'openai_api_key_id');
    }

    public function isActive(): bool
    {
        return $this->status === OpenAiKeyStatus::Active;
    }

    public function isSuspended(): bool
    {
        return $this->status === OpenAiKeyStatus::Suspended;
    }

    public function isRevoked(): bool
    {
        return $this->status === OpenAiKeyStatus::Revoked;
    }

    public function hasMaxSpend(): bool
    {
        return ! is_null($this->max_spend_usd);
    }

    /**
     * The USD threshold at which the grace period ends and the key is suspended.
     * Equals max_spend_usd + grace_amount_usd. If no max is set, returns null.
     */
    public function graceThresholdUsd(): ?float
    {
        if (! $this->hasMaxSpend()) {
            return null;
        }

        return (float) $this->max_spend_usd + (float) ($this->grace_amount_usd ?? 0);
    }

    public function isOverMaxSpend(): bool
    {
        if (! $this->hasMaxSpend()) {
            return false;
        }

        return (float) $this->spend_usd >= (float) $this->max_spend_usd;
    }

    public function isOverGraceThreshold(): bool
    {
        $grace = $this->graceThresholdUsd();

        if ($grace === null) {
            return false;
        }

        return (float) $this->spend_usd >= $grace;
    }

    public function spendRemainingUsd(): ?float
    {
        if (! $this->hasMaxSpend()) {
            return null;
        }

        return max(0, (float) $this->max_spend_usd - (float) $this->spend_usd);
    }

    /**
     * Mask the stored API key for display.
     */
    public function maskedApiKey(): ?string
    {
        if (empty($this->api_key_encrypted)) {
            return null;
        }

        $key = $this->api_key_encrypted;

        if (strlen($key) <= 8) {
            return str_repeat('*', strlen($key));
        }

        return substr($key, 0, 7).'...'.substr($key, -4);
    }
}
