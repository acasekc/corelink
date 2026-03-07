<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Relationships to OpenAiApiKey and OpenAiUsageLog are in the same namespace

class OpenAiConfig extends Model
{
    protected $table = 'helpdesk_openai_configs';

    protected $fillable = [
        'project_id',
        'openai_project_id',
        'openai_project_name',
        'markup_percentage',
        'billing_cycle_start_day',
        'cycle_usage_cents',
        'notification_emails',
        'last_synced_at',
        'last_sync_error',
        'connected_at',
    ];

    protected function casts(): array
    {
        return [
            'markup_percentage' => 'decimal:2',
            'billing_cycle_start_day' => 'integer',
            'cycle_usage_cents' => 'integer',
            'notification_emails' => 'array',
            'last_synced_at' => 'datetime',
            'connected_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(OpenAiApiKey::class, 'openai_config_id');
    }

    public function activeKeys(): HasMany
    {
        return $this->hasMany(OpenAiApiKey::class, 'openai_config_id')->where('status', 'active');
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(OpenAiUsageLog::class, 'openai_config_id');
    }

    public function isConnected(): bool
    {
        return ! empty($this->openai_project_id);
    }

    public function cycleUsageDollars(): float
    {
        return round($this->cycle_usage_cents / 100, 2);
    }

    public function markupMultiplier(): float
    {
        return 1 + ($this->markup_percentage / 100);
    }
}
