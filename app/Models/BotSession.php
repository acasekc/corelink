<?php

namespace App\Models;

use App\Enums\SessionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class BotSession extends Model
{
    use HasFactory, HasUuids;

    public const ACTIVE_WINDOW_MINUTES = 5;

    private const HEARTBEAT_THROTTLE_SECONDS = 20;

    protected $fillable = [
        'user_id',
        'invite_code_id',
        'session_token',
        'started_at',
        'last_seen_at',
        'completed_at',
        'status',
        'turn_count',
        'conversation_state',
        'extracted_requirements',
        'metadata',
        'voice_enabled',
        'voice_mode',
        'voice_settings',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'completed_at' => 'datetime',
        'status' => SessionStatus::class,
        'conversation_state' => 'array',
        'extracted_requirements' => 'array',
        'metadata' => 'array',
        'voice_enabled' => 'boolean',
        'voice_settings' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->session_token)) {
                $model->session_token = Str::random(64);
            }
            if (empty($model->started_at)) {
                $model->started_at = now();
            }
            if (empty($model->last_seen_at)) {
                $model->last_seen_at = $model->started_at;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviteCode(): BelongsTo
    {
        return $this->belongsTo(InviteCode::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(BotConversation::class, 'session_id')->orderBy('turn_number');
    }

    public function plan(): HasOne
    {
        return $this->hasOne(DiscoveryPlan::class, 'session_id');
    }

    /**
     * Alias for plan relationship for cleaner access
     */
    public function discoveryPlan(): HasOne
    {
        return $this->plan();
    }

    public function getConversationHistory(): array
    {
        return $this->conversations->flatMap(function ($conv) {
            $messages = [];
            if ($conv->user_message) {
                $messages[] = ['role' => 'user', 'content' => $conv->user_message];
            }
            if ($conv->assistant_message) {
                $messages[] = ['role' => 'assistant', 'content' => $conv->assistant_message];
            }

            return $messages;
        })->toArray();
    }

    public function incrementTurnCount(): void
    {
        $this->increment('turn_count');
    }

    public static function activeWindowStart(?Carbon $referenceTime = null): Carbon
    {
        return ($referenceTime ?? now())->copy()->subMinutes(self::ACTIVE_WINDOW_MINUTES);
    }

    public function markAsSeen(bool $force = false): void
    {
        if (
            ! $force
            && $this->last_seen_at instanceof Carbon
            && $this->last_seen_at->gte(now()->subSeconds(self::HEARTBEAT_THROTTLE_SECONDS))
        ) {
            return;
        }

        $timestamps = $this->timestamps;

        $this->timestamps = false;
        $this->forceFill([
            'last_seen_at' => now(),
        ])->saveQuietly();
        $this->timestamps = $timestamps;
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => SessionStatus::Completed,
            'completed_at' => now(),
        ]);
    }

    public function isActive(): bool
    {
        return $this->status === SessionStatus::Active;
    }

    public function isRecentlyActive(?Carbon $referenceTime = null): bool
    {
        return $this->isActive()
            && $this->last_seen_at instanceof Carbon
            && $this->last_seen_at->gte(self::activeWindowStart($referenceTime));
    }
}
