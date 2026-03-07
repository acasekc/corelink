<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDigestEvent extends Model
{
    /** @use HasFactory<\Database\Factories\Helpdesk\NotificationDigestEventFactory> */
    use HasFactory;

    protected $table = 'helpdesk_notification_digest_events';

    protected $fillable = [
        'notification_digest_id',
        'ticket_id',
        'event_type',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function digest(): BelongsTo
    {
        return $this->belongsTo(NotificationDigest::class, 'notification_digest_id');
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class)->withTrashed();
    }
}
