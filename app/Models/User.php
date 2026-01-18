<?php

namespace App\Models;

use App\Enums\Helpdesk\ProjectRole;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\ProjectUser;
use App\Models\Helpdesk\Ticket;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'force_password_change',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'force_password_change' => 'boolean',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->is_admin === true;
    }

    /**
     * Get invite codes created by this admin user
     */
    public function inviteCodes(): HasMany
    {
        return $this->hasMany(InviteCode::class, 'admin_user_id');
    }

    /**
     * Get bot sessions for this user
     */
    public function botSessions(): HasMany
    {
        return $this->hasMany(BotSession::class);
    }

    /**
     * Get all helpdesk projects the user has access to
     */
    public function helpdeskProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'helpdesk_project_users')
            ->using(ProjectUser::class)
            ->withPivot(['role', 'receive_notifications'])
            ->withTimestamps();
    }

    /**
     * Get projects where user is owner
     */
    public function ownedHelpdeskProjects(): BelongsToMany
    {
        return $this->helpdeskProjects()->wherePivot('role', ProjectRole::Owner->value);
    }

    /**
     * Get projects where user is staff (owner, manager, or agent)
     */
    public function staffHelpdeskProjects(): BelongsToMany
    {
        return $this->helpdeskProjects()->wherePivotIn('role', [
            ProjectRole::Owner->value,
            ProjectRole::Manager->value,
            ProjectRole::Agent->value,
        ]);
    }

    /**
     * Get tickets assigned to this user
     */
    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assignee_id');
    }

    /**
     * Get tickets submitted by this user
     */
    public function submittedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'submitter_user_id');
    }

    /**
     * Check if user has access to a specific project
     */
    public function hasAccessToProject(Project $project): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->helpdeskProjects()->where('helpdesk_projects.id', $project->id)->exists();
    }

    /**
     * Get user's role in a specific project
     */
    public function getRoleInProject(Project $project): ?ProjectRole
    {
        if ($this->isAdmin()) {
            return ProjectRole::Owner; // Admins have owner-level access
        }

        $pivot = $this->helpdeskProjects()
            ->where('helpdesk_projects.id', $project->id)
            ->first()
            ?->pivot;

        return $pivot?->role;
    }

    /**
     * Check if user has a specific permission in a project
     */
    public function hasProjectPermission(Project $project, string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $role = $this->getRoleInProject($project);

        return $role?->hasPermission($permission) ?? false;
    }

    /**
     * Check if user can view a specific ticket
     */
    public function canViewTicket(Ticket $ticket): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $role = $this->getRoleInProject($ticket->project);
        if (! $role) {
            return false;
        }

        if ($role->hasPermission('ticket.view_all')) {
            return true;
        }

        // User role - can only view own tickets
        // Use loose comparison to handle int/string type differences
        return $ticket->submitter_user_id == $this->id || $ticket->assignee_id == $this->id;
    }

    /**
     * Check if user can update a specific ticket
     */
    public function canUpdateTicket(Ticket $ticket): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $role = $this->getRoleInProject($ticket->project);
        if (! $role) {
            return false;
        }

        if ($role->hasPermission('ticket.update')) {
            return true;
        }

        if ($role->hasPermission('ticket.update_assigned') && $ticket->assignee_id == $this->id) {
            return true;
        }

        if ($role->hasPermission('ticket.update_own') && $ticket->submitter_user_id == $this->id) {
            return true;
        }

        return false;
    }
}
