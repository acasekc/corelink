<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationDigest extends Model
{
    /** @use HasFactory<\Database\Factories\Helpdesk\NotificationDigestFactory> */
    use HasFactory;

    protected $table = 'helpdesk_notification_digests';

    protected $fillable = [
        'recipient_email',
        'dispatch_after',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'dispatch_after' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(NotificationDigestEvent::class)
            ->orderBy('created_at');
    }
}
