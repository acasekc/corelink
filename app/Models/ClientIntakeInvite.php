<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ClientIntakeInvite extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';

    public const STATUS_OPENED = 'opened';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'code',
        'prospect_name',
        'prospect_email',
        'business_name',
        'created_by_user_id',
        'status',
        'expires_at',
        'opened_at',
        'last_seen_at',
        'submitted_at',
        'draft_data',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'opened_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'submitted_at' => 'datetime',
            'draft_data' => 'array',
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $invite) {
            if (empty($invite->code)) {
                $invite->code = self::generateUniqueCode();
            }
        });
    }

    public static function generateUniqueCode(int $length = 20): string
    {
        do {
            $code = Str::lower(Str::random($length));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function intake(): HasOne
    {
        return $this->hasOne(ClientIntake::class, 'invite_id');
    }

    /**
     * Whether the code can be used to open or submit the form.
     */
    public function isUsable(): bool
    {
        if (in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_REVOKED, self::STATUS_EXPIRED], true)) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Stamp the invite as opened (idempotent on first open).
     */
    public function markOpened(?string $ip = null, ?string $userAgent = null): void
    {
        $now = now();
        $metadata = $this->metadata ?? [];

        if ($this->opened_at === null) {
            $this->opened_at = $now;
            $metadata['first_open'] = [
                'ip' => $ip,
                'user_agent' => $userAgent,
                'at' => $now->toIso8601String(),
            ];

            if ($this->status === self::STATUS_PENDING) {
                $this->status = self::STATUS_OPENED;
            }
        }

        $this->last_seen_at = $now;
        $this->metadata = $metadata;
        $this->save();
    }

    public function markSubmitted(): void
    {
        $this->update([
            'status' => self::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);
    }

    public function publicUrl(): string
    {
        return url('/intake/'.$this->code);
    }
}
