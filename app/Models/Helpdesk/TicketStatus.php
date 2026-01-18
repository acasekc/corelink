<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketStatus extends Model
{
    use SoftDeletes;

    protected $table = 'helpdesk_ticket_statuses';

    protected $fillable = [
        'project_id',
        'title',
        'slug',
        'text_color',
        'bg_color',
        'is_default',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'status_id');
    }

    public static function getDefaultForProject(?int $projectId): ?self
    {
        // First try to find a default status
        $default = static::where(fn ($q) => $q->where('project_id', $projectId)->orWhereNull('project_id'))
            ->where('is_default', true)
            ->orderByRaw('project_id IS NULL')
            ->first();

        // Fall back to first status by order
        if (! $default) {
            $default = static::where(fn ($q) => $q->where('project_id', $projectId)->orWhereNull('project_id'))
                ->orderBy('order')
                ->first();
        }

        return $default;
    }
}
