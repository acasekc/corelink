<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnthropicUsageLog extends Model
{
    protected $table = 'helpdesk_anthropic_usage_logs';

    protected $fillable = [
        'anthropic_config_id',
        'synced_at',
        'period_start',
        'period_end',
        'tokens_input',
        'tokens_output',
        'cost_cents',
        'model_breakdown',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
            'period_start' => 'date',
            'period_end' => 'date',
            'tokens_input' => 'integer',
            'tokens_output' => 'integer',
            'cost_cents' => 'integer',
            'model_breakdown' => 'array',
            'raw_response' => 'array',
        ];
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(AnthropicApiConfig::class, 'anthropic_config_id');
    }

    /**
     * Get cost as a dollar amount.
     */
    public function costDollars(): float
    {
        return $this->cost_cents / 100;
    }

    /**
     * Get total tokens (input + output).
     */
    public function totalTokens(): int
    {
        return $this->tokens_input + $this->tokens_output;
    }
}
