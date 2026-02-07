<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    /** @use HasFactory<\Database\Factories\EmailLogFactory> */
    use HasFactory;

    /**
     * Domains that should not be logged.
     *
     * @var array<int, string>
     */
    public const EXCLUDED_DOMAINS = [
        'corelink.dev',
        'pantrylink.app',
        'champlink.app',
    ];

    protected $fillable = [
        'to_email',
        'subject',
        'mailable_class',
        'status',
        'postmark_message_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Determine if an email address should be logged (external domain only).
     */
    public static function shouldLog(string $email): bool
    {
        $domain = strtolower(substr(strrchr($email, '@'), 1));

        return ! in_array($domain, self::EXCLUDED_DOMAINS, true);
    }
}
