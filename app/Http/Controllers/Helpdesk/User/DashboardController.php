<?php

namespace App\Http\Controllers\Helpdesk\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get projects the user has access to
        $projects = $user->helpdeskProjects()
            ->where('is_active', true)
            ->withCount([
                'tickets',
                'tickets as open_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->where('slug', 'open')),
                'tickets as in_progress_tickets_count' => fn ($q) => $q->whereHas('status', fn ($sq) => $sq->where('slug', 'in_progress')),
            ])
            ->get()
            ->map(fn ($project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'color' => $project->color,
                'role' => $project->pivot->role->value,
                'role_label' => $project->pivot->role->label(),
                'total' => $project->tickets_count,
                'open' => $project->open_tickets_count,
                'in_progress' => $project->in_progress_tickets_count,
            ]);

        $projectIds = $projects->pluck('id');

        // Get stats based on user's role
        $canViewAll = $user->isAdmin() || $user->staffHelpdeskProjects()->exists();

        $ticketQuery = \App\Models\Helpdesk\Ticket::whereIn('project_id', $projectIds);

        if (! $canViewAll) {
            // Regular users can only see their own tickets
            $ticketQuery->where(function ($q) use ($user) {
                $q->where('submitter_user_id', $user->id)
                    ->orWhere('assignee_id', $user->id);
            });
        }

        $totalTickets = (clone $ticketQuery)->count();
        $openTickets = (clone $ticketQuery)->whereHas('status', fn ($q) => $q->where('slug', 'open'))->count();
        $inProgressTickets = (clone $ticketQuery)->whereHas('status', fn ($q) => $q->where('slug', 'in_progress'))->count();
        $resolvedTickets = (clone $ticketQuery)->whereHas('status', fn ($q) => $q->whereIn('slug', ['resolved', 'closed']))->count();

        // Recent tickets
        $recentTickets = (clone $ticketQuery)
            ->with(['project:id,name,slug,color,ticket_prefix', 'status', 'priority'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($ticket) => [
                'id' => $ticket->id,
                'number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'project' => [
                    'id' => $ticket->project->id,
                    'name' => $ticket->project->name,
                    'slug' => $ticket->project->slug,
                    'color' => $ticket->project->color,
                ],
                'status' => [
                    'slug' => $ticket->status?->slug,
                    'title' => $ticket->status?->title,
                    'color' => $ticket->status?->color,
                ],
                'priority' => [
                    'slug' => $ticket->priority?->slug,
                    'title' => $ticket->priority?->title,
                    'color' => $ticket->priority?->color,
                ],
                'created_at' => $ticket->created_at,
            ]);

        // Tickets assigned to me (for staff)
        $assignedToMe = [];
        if ($canViewAll) {
            $assignedToMe = \App\Models\Helpdesk\Ticket::whereIn('project_id', $projectIds)
                ->where('assignee_id', $user->id)
                ->whereHas('status', fn ($q) => $q->whereNotIn('slug', ['resolved', 'closed']))
                ->with(['project:id,name,slug,color,ticket_prefix', 'status', 'priority'])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get()
                ->map(fn ($ticket) => [
                    'id' => $ticket->id,
                    'number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'project' => [
                        'id' => $ticket->project->id,
                        'name' => $ticket->project->name,
                    ],
                    'status' => $ticket->status?->title,
                    'priority' => $ticket->priority?->title,
                    'created_at' => $ticket->created_at,
                ]);
        }

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'is_admin' => $user->is_admin,
                    'is_staff' => $canViewAll,
                ],
                'stats' => [
                    'total_tickets' => $totalTickets,
                    'open_tickets' => $openTickets,
                    'in_progress_tickets' => $inProgressTickets,
                    'resolved_tickets' => $resolvedTickets,
                ],
                'projects' => $projects,
                'recent_tickets' => $recentTickets,
                'assigned_to_me' => $assignedToMe,
            ],
        ]);
    }
}
