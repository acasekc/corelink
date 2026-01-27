<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;

    protected $table = 'helpdesk_comments';

    protected $fillable = [
        'ticket_id',
        'user_id',
        'submitter_name',
        'submitter_email',
        'content',
        'is_internal',
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function isFromAdmin(): bool
    {
        return $this->user_id !== null;
    }

    public function getAuthorNameAttribute(): string
    {
        return $this->user?->name ?? $this->submitter_name ?? 'Unknown';
    }

    /**
     * Check if the comment can be edited/deleted.
     * Returns true if within 3 minutes of creation AND user is author or admin.
     */
    public function canBeModifiedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        // Must be within 3 minutes of creation
        if ($this->created_at->diffInMinutes(now()) >= 3) {
            return false;
        }

        // Admin can modify any comment
        if ($user->is_admin) {
            return true;
        }

        // Author can modify their own comment
        if ($this->user_id && $this->user_id === $user->id) {
            return true;
        }

        // Non-admin user can modify their own comment (by email match)
        if (! $this->user_id && $this->submitter_email === $user->email) {
            return true;
        }

        return false;
    }

    /**
     * Get seconds remaining until edit window closes.
     */
    public function getEditWindowSecondsRemaining(): int
    {
        $elapsed = $this->created_at->diffInSeconds(now());
        $remaining = (3 * 60) - $elapsed;

        return max(0, $remaining);
    }
}
