<?php

namespace App\Http\Controllers\Helpdesk\User;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * List projects the user has access to
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $projects = $user->helpdeskProjects()
            ->where('is_active', true)
            ->withCount([
                'tickets',
                'tickets as open_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->where('slug', 'open')),
            ])
            ->get()
            ->map(fn ($project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'icon' => $project->icon,
                'role' => $project->pivot->role->value,
                'role_label' => $project->pivot->role->label(),
                'total_tickets' => $project->tickets_count,
                'open_tickets' => $project->open_tickets_count,
            ]);

        return response()->json([
            'data' => $projects,
        ]);
    }

    /**
     * Get a specific project the user has access to
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAccessToProject($project)) {
            return response()->json([
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $role = $user->getRoleInProject($project);
        $canViewAll = $role?->hasPermission('ticket.view_all') ?? false;

        // Load counts based on permissions
        $project->loadCount([
            'tickets',
            'tickets as open_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->where('slug', 'open')),
            'tickets as in_progress_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->where('slug', 'in_progress')),
            'tickets as resolved_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->whereIn('slug', ['resolved', 'closed'])),
        ]);

        // Recent tickets
        $ticketQuery = $project->tickets()
            ->with(['status', 'priority', 'assignee:id,name'])
            ->orderByDesc('created_at')
            ->limit(10);

        if (! $canViewAll) {
            $ticketQuery->where(function ($q) use ($user) {
                $q->where('submitter_user_id', $user->id)
                    ->orWhere('assignee_id', $user->id);
            });
        }

        $recentTickets = $ticketQuery->get();

        return response()->json([
            'data' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'icon' => $project->icon,
                'role' => $role?->value,
                'role_label' => $role?->label(),
                'stats' => [
                    'total' => $project->tickets_count,
                    'open' => $project->open_tickets_count,
                    'in_progress' => $project->in_progress_tickets_count,
                    'resolved' => $project->resolved_tickets_count,
                ],
                'recent_tickets' => $recentTickets,
                'permissions' => [
                    'can_create_ticket' => $user->hasProjectPermission($project, 'ticket.create'),
                    'can_view_all_tickets' => $canViewAll,
                    'can_assign' => $user->hasProjectPermission($project, 'ticket.assign'),
                    'can_manage_users' => $user->hasProjectPermission($project, 'project.manage_users'),
                ],
            ],
        ]);
    }

    /**
     * Get reference data for a project (statuses, priorities, types)
     */
    public function referenceData(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAccessToProject($project)) {
            return response()->json([
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $canAssign = $user->hasProjectPermission($project, 'ticket.assign');

        // Get project-specific items or fall back to global items
        $statuses = $project->statuses()->orderBy('order')->get();
        if ($statuses->isEmpty()) {
            $statuses = TicketStatus::whereNull('project_id')->orderBy('order')->get();
        }

        $priorities = $project->priorities()->orderBy('order')->get();
        if ($priorities->isEmpty()) {
            $priorities = TicketPriority::whereNull('project_id')->orderBy('order')->get();
        }

        $types = $project->types()->get();
        if ($types->isEmpty()) {
            $types = TicketType::whereNull('project_id')->get();
        }

        $data = [
            'statuses' => $statuses,
            'priorities' => $priorities,
            'types' => $types,
            'labels' => $project->labels()->orderBy('name')->get(),
        ];

        // Only include assignable users if user can assign
        if ($canAssign) {
            $data['assignees'] = $project->staff()->get(['users.id', 'name', 'email']);
        }

        return response()->json([
            'data' => $data,
        ]);
    }
}
