<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use SoftDeletes;

    protected $table = 'helpdesk_api_keys';

    protected $fillable = [
        'project_id',
        'key',
        'name',
        'last_used_at',
        'last_used_ip',
        'expires_at',
        'is_active',
        'permissions',
    ];

    protected $hidden = [
        'key',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public static function generateKey(): string
    {
        return Str::random(48);
    }

    public static function hashKey(string $key): string
    {
        return hash('sha256', $key);
    }

    public static function findByKey(string $key): ?self
    {
        return static::where('key', static::hashKey($key))
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first();
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function recordUsage(string $ip): void
    {
        $this->update([
            'last_used_at' => now(),
            'last_used_ip' => $ip,
        ]);
    }
}
