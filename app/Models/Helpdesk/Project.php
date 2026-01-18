<?php

namespace App\Models\Helpdesk;

use App\Enums\Helpdesk\ProjectRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $table = 'helpdesk_projects';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'ticket_prefix',
        'github_repo',
        'color',
        'icon',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function webhooks(): HasMany
    {
        return $this->hasMany(Webhook::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    public function statuses(): HasMany
    {
        return $this->hasMany(TicketStatus::class);
    }

    public function priorities(): HasMany
    {
        return $this->hasMany(TicketPriority::class);
    }

    public function types(): HasMany
    {
        return $this->hasMany(TicketType::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'helpdesk_project_users')
            ->using(ProjectUser::class)
            ->withPivot(['role', 'receive_notifications'])
            ->withTimestamps();
    }

    public function owners(): BelongsToMany
    {
        return $this->users()->wherePivot('role', ProjectRole::Owner->value);
    }

    public function managers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', ProjectRole::Manager->value);
    }

    public function agents(): BelongsToMany
    {
        return $this->users()->wherePivot('role', ProjectRole::Agent->value);
    }

    public function regularUsers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', ProjectRole::User->value);
    }

    public function staff(): BelongsToMany
    {
        return $this->users()->wherePivotIn('role', [
            ProjectRole::Owner->value,
            ProjectRole::Manager->value,
            ProjectRole::Agent->value,
        ]);
    }

    public function projectUsers(): HasMany
    {
        return $this->hasMany(ProjectUser::class);
    }

    public function getUserRole(User $user): ?ProjectRole
    {
        $projectUser = $this->projectUsers()->where('user_id', $user->id)->first();

        return $projectUser?->role;
    }

    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    public function addUser(User $user, ProjectRole $role = ProjectRole::User): ProjectUser
    {
        $this->users()->syncWithoutDetaching([
            $user->id => ['role' => $role->value],
        ]);

        return $this->projectUsers()->where('user_id', $user->id)->first();
    }

    public function removeUser(User $user): bool
    {
        return $this->users()->detach($user->id) > 0;
    }

    public function updateUserRole(User $user, ProjectRole $role): bool
    {
        return $this->users()->updateExistingPivot($user->id, ['role' => $role->value]) > 0;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getNextTicketNumber(): int
    {
        return ($this->tickets()->withTrashed()->max('number') ?? 0) + 1;
    }
}
