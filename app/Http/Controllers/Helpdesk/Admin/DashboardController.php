<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function global(): JsonResponse
    {
        $projects = Project::where('is_active', true)
            ->withCount([
                'tickets as total_tickets',
                'tickets as open_tickets' => function ($q) {
                    $q->whereHas('status', fn ($s) => $s->where('slug', 'open'));
                },
                'tickets as in_progress' => function ($q) {
                    $q->whereHas('status', fn ($s) => $s->where('slug', 'in-progress'));
                },
            ])
            ->get();

        $totalTickets = Ticket::count();
        $openTickets = Ticket::whereHas('status', fn ($q) => $q->where('slug', 'open'))->count();
        $inProgressTickets = Ticket::whereHas('status', fn ($q) => $q->where('slug', 'in-progress'))->count();
        $resolvedTickets = Ticket::whereHas('status', fn ($q) => $q->where('slug', 'resolved'))->count();

        $recentTickets = Ticket::with(['project', 'status', 'priority', 'type', 'assignee'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $ticketsByStatus = DB::table('helpdesk_tickets')
            ->join('helpdesk_ticket_statuses', 'helpdesk_tickets.status_id', '=', 'helpdesk_ticket_statuses.id')
            ->select('helpdesk_ticket_statuses.title', 'helpdesk_ticket_statuses.slug', 'helpdesk_ticket_statuses.bg_color', DB::raw('COUNT(*) as count'))
            ->whereNull('helpdesk_tickets.deleted_at')
            ->groupBy('helpdesk_ticket_statuses.id', 'helpdesk_ticket_statuses.title', 'helpdesk_ticket_statuses.slug', 'helpdesk_ticket_statuses.bg_color')
            ->get();

        return response()->json([
            'stats' => [
                'total_tickets' => $totalTickets,
                'open_tickets' => $openTickets,
                'in_progress_tickets' => $inProgressTickets,
                'resolved_tickets' => $resolvedTickets,
                'total_projects' => $projects->count(),
            ],
            'projects' => $projects->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'color' => $project->color,
                'total_tickets' => $project->total_tickets,
                'open_tickets' => $project->open_tickets,
                'in_progress' => $project->in_progress,
            ]),
            'recent_tickets' => $recentTickets->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'project' => [
                    'name' => $ticket->project->name,
                    'slug' => $ticket->project->slug,
                    'color' => $ticket->project->color,
                ],
                'status' => [
                    'title' => $ticket->status->title,
                    'color' => $ticket->status->bg_color,
                ],
                'priority' => [
                    'title' => $ticket->priority->title,
                    'color' => $ticket->priority->bg_color,
                ],
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                ] : null,
                'created_at' => $ticket->created_at->toIso8601String(),
            ]),
            'tickets_by_status' => $ticketsByStatus,
        ]);
    }

    public function project(Project $project): JsonResponse
    {
        $stats = [
            'total' => $project->tickets()->count(),
            'open' => $project->tickets()->whereHas('status', fn ($q) => $q->where('slug', 'open'))->count(),
            'in_progress' => $project->tickets()->whereHas('status', fn ($q) => $q->where('slug', 'in-progress'))->count(),
            'pending' => $project->tickets()->whereHas('status', fn ($q) => $q->where('slug', 'pending'))->count(),
            'resolved' => $project->tickets()->whereHas('status', fn ($q) => $q->where('slug', 'resolved'))->count(),
            'closed' => $project->tickets()->whereHas('status', fn ($q) => $q->where('slug', 'closed'))->count(),
        ];

        $recentTickets = $project->tickets()
            ->with(['status', 'priority', 'type', 'assignee'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $apiKeysCount = $project->apiKeys()->where('is_active', true)->count();
        $webhooksCount = $project->webhooks()->where('is_active', true)->count();

        return response()->json([
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'github_repo' => $project->github_repo,
                'ticket_prefix' => $project->ticket_prefix,
            ],
            'stats' => $stats,
            'api_keys_count' => $apiKeysCount,
            'webhooks_count' => $webhooksCount,
            'recent_tickets' => $recentTickets->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => [
                    'title' => $ticket->status->title,
                    'color' => $ticket->status->bg_color,
                ],
                'priority' => [
                    'title' => $ticket->priority->title,
                    'color' => $ticket->priority->bg_color,
                ],
                'assignee' => $ticket->assignee ? [
                    'id' => $ticket->assignee->id,
                    'name' => $ticket->assignee->name,
                ] : null,
                'submitter' => $ticket->submitter_name,
                'created_at' => $ticket->created_at->toIso8601String(),
            ]),
        ]);
    }
}
