<?php

namespace App\Models\Helpdesk;

use App\Enums\Helpdesk\ProjectRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProjectUser extends Pivot
{
    protected $table = 'helpdesk_project_users';

    public $incrementing = true;

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'receive_notifications',
        'auto_watch_all_tickets',
    ];

    protected function casts(): array
    {
        return [
            'role' => ProjectRole::class,
            'receive_notifications' => 'boolean',
            'auto_watch_all_tickets' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->role->hasPermission($permission);
    }

    public function isOwner(): bool
    {
        return $this->role === ProjectRole::Owner;
    }

    public function isManager(): bool
    {
        return $this->role === ProjectRole::Manager;
    }

    public function isAgent(): bool
    {
        return $this->role === ProjectRole::Agent;
    }

    public function isUser(): bool
    {
        return $this->role === ProjectRole::User;
    }

    public function canManageUsers(): bool
    {
        return $this->hasPermission('project.manage_users');
    }

    public function canViewAllTickets(): bool
    {
        return $this->hasPermission('ticket.view_all');
    }

    public function canAssignTickets(): bool
    {
        return $this->hasPermission('ticket.assign');
    }
}
