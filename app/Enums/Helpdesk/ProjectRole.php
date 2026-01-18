<?php

namespace App\Enums\Helpdesk;

enum ProjectRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Agent = 'agent';
    case User = 'user';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Owner',
            self::Manager => 'Manager',
            self::Agent => 'Agent',
            self::User => 'User',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Owner => 'Full control over project settings, users, and all tickets',
            self::Manager => 'Manage tickets, assign agents, and view reports',
            self::Agent => 'Handle assigned tickets and communicate with users',
            self::User => 'Submit and track their own tickets',
        };
    }

    public function permissions(): array
    {
        return match ($this) {
            self::Owner => [
                'project.view',
                'project.update',
                'project.delete',
                'project.manage_users',
                'project.manage_api_keys',
                'ticket.view_all',
                'ticket.create',
                'ticket.update',
                'ticket.delete',
                'ticket.assign',
                'ticket.change_status',
                'ticket.change_priority',
                'comment.create',
                'comment.update',
                'comment.delete',
                'comment.internal',
            ],
            self::Manager => [
                'project.view',
                'project.update',
                'project.manage_users',
                'ticket.view_all',
                'ticket.create',
                'ticket.update',
                'ticket.assign',
                'ticket.change_status',
                'ticket.change_priority',
                'comment.create',
                'comment.update',
                'comment.internal',
            ],
            self::Agent => [
                'project.view',
                'ticket.view_all',
                'ticket.create',
                'ticket.update_assigned',
                'ticket.change_status',
                'comment.create',
                'comment.internal',
            ],
            self::User => [
                'project.view',
                'ticket.view_own',
                'ticket.create',
                'ticket.update_own',
                'comment.create',
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }

    public static function forSelect(): array
    {
        return array_map(
            fn (self $role) => ['value' => $role->value, 'label' => $role->label()],
            self::cases()
        );
    }
}
