<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Webhook extends Model
{
    protected $table = 'helpdesk_webhooks';

    protected $fillable = [
        'project_id',
        'url',
        'secret',
        'events',
        'is_active',
        'last_triggered_at',
        'last_response_code',
    ];

    protected $hidden = [
        'secret',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'is_active' => 'boolean',
            'last_triggered_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public static function generateSecret(): string
    {
        return Str::random(32);
    }

    public function shouldTriggerFor(string $event): bool
    {
        return $this->is_active && in_array($event, $this->events ?? []);
    }
}
