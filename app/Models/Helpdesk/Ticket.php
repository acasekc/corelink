<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'helpdesk_tickets';

    protected $fillable = [
        'number',
        'title',
        'content',
        'project_id',
        'status_id',
        'priority_id',
        'type_id',
        'assignee_id',
        'submitter_name',
        'submitter_email',
        'submitter_user_id',
        'metadata',
        'github_issue_url',
        'time_estimate_minutes',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TicketStatus::class);
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(TicketPriority::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'helpdesk_ticket_labels', 'ticket_id', 'label_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->orderBy('created_at');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TicketActivity::class)->orderByDesc('created_at');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class)->orderByDesc('created_at');
    }

    /**
     * Get the total time spent on this ticket in minutes
     */
    public function getTotalTimeSpentAttribute(): int
    {
        return $this->timeEntries()->sum('minutes');
    }

    /**
     * Get the formatted time estimate (e.g., "2w 4d 6h 45m")
     */
    public function getFormattedTimeEstimateAttribute(): ?string
    {
        if ($this->time_estimate_minutes === null) {
            return null;
        }

        return TimeEntry::formatMinutes($this->time_estimate_minutes);
    }

    /**
     * Get the formatted total time spent (e.g., "2w 4d 6h 45m")
     */
    public function getFormattedTimeSpentAttribute(): string
    {
        return TimeEntry::formatMinutes($this->total_time_spent);
    }

    public function getTicketNumberAttribute(): string
    {
        return $this->project->ticket_prefix.'-'.str_pad($this->number, 4, '0', STR_PAD_LEFT);
    }

    public function logActivity(string $action, ?string $oldValue = null, ?string $newValue = null, ?int $userId = null): TicketActivity
    {
        return $this->activities()->create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'old_value' => $oldValue,
            'new_value' => $newValue,
        ]);
    }
}
