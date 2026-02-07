<?php

namespace App\Models;

use App\Enums\SuppressionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailSuppression extends Model
{
    /** @use HasFactory<\Database\Factories\EmailSuppressionFactory> */
    use HasFactory;

    protected $fillable = [
        'email',
        'type',
        'reason',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'type' => SuppressionType::class,
            'payload' => 'array',
        ];
    }

    /**
     * Check if an email address is suppressed (bounced or spam-complained).
     */
    public static function isSuppressed(string $email): bool
    {
        return static::query()
            ->where('email', strtolower($email))
            ->exists();
    }

    /**
     * Get the suppression record for an email address.
     */
    public static function findByEmail(string $email): ?self
    {
        return static::query()
            ->where('email', strtolower($email))
            ->first();
    }
}
