<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpenAiUsageLog extends Model
{
    protected $table = 'helpdesk_openai_usage_logs';

    protected $fillable = [
        'openai_config_id',
        'openai_api_key_id',
        'usage_date',
        'model',
        'input_tokens',
        'output_tokens',
        'requests',
        'cost_usd',
        'cost_cents',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'usage_date' => 'date',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'requests' => 'integer',
            'cost_usd' => 'decimal:6',
            'cost_cents' => 'integer',
            'raw_response' => 'array',
        ];
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(OpenAiConfig::class, 'openai_config_id');
    }

    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(OpenAiApiKey::class, 'openai_api_key_id');
    }

    public function totalTokens(): int
    {
        return $this->input_tokens + $this->output_tokens;
    }

    public function costDollars(): float
    {
        return round((float) $this->cost_usd, 6);
    }
}
