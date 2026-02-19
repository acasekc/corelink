<?php

namespace App\Http\Controllers\Helpdesk\User;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * List tickets the user has access to
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $projectIds = $user->helpdeskProjects()->pluck('helpdesk_projects.id');

        $canViewAll = $user->isAdmin() || $user->staffHelpdeskProjects()->exists();

        $query = Ticket::whereIn('project_id', $projectIds)
            ->with([
                'project:id,name,slug,color,ticket_prefix',
                'status',
                'priority',
                'assignee:id,name,email',
            ]);

        if (! $canViewAll) {
            $query->where(function ($q) use ($user) {
                $q->where('submitter_user_id', $user->id)
                    ->orWhere('assignee_id', $user->id);
            });
        }

        // Filters
        if ($request->filled('project')) {
            $query->where('project_id', $request->input('project'));
        }

        if ($request->filled('status')) {
            $query->whereHas('status', fn ($q) => $q->where('slug', $request->input('status')));
        }

        if ($request->filled('priority')) {
            $query->whereHas('priority', fn ($q) => $q->where('slug', $request->input('priority')));
        }

        if ($request->filled('assigned_to_me')) {
            $query->where('assignee_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('submitter_name', 'like', "%{$search}%")
                    ->orWhere('submitter_email', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => $tickets->items(),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    /**
     * Get a specific ticket
     */
    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json([
                'message' => 'You do not have access to this ticket',
            ], 403);
        }

        $ticket->load([
            'project:id,name,slug,color,ticket_prefix',
            'status',
            'priority',
            'type',
            'assignee:id,name,email',
            'labels',
            'comments' => fn ($q) => $q->with(['user:id,name,email', 'attachments']),
            'activities' => fn ($q) => $q->with('user:id,name')->latest()->limit(20),
            'timeEntries' => fn ($q) => $q->with('user:id,name'),
            'watchers:id,name,email',
        ]);

        // Filter internal comments for non-staff
        $role = $user->getRoleInProject($ticket->project);
        $canSeeInternal = $role?->hasPermission('comment.internal') ?? false;

        $comments = $ticket->comments;
        if (! $canSeeInternal) {
            $comments = $comments->where('is_internal', false)->values();
        }

        // Format comments with attachments
        $formattedComments = $comments->map(fn ($comment) => $this->formatComment($comment));

        return response()->json([
            'data' => [
                'id' => $ticket->id,
                'number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'content' => $ticket->content,
                'project' => $ticket->project,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'type' => $ticket->type,
                'assignee' => $ticket->assignee,
                'labels' => $ticket->labels,
                'submitter' => [
                    'name' => $ticket->submitter_name,
                    'email' => $ticket->submitter_email,
                    'user_id' => $ticket->submitter_user_id,
                ],
                'comments' => $formattedComments,
                'activities' => $ticket->activities,
                'time_tracking' => [
                    'estimate' => $ticket->formatted_time_estimate,
                    'estimate_minutes' => $ticket->time_estimate_minutes,
                    'time_spent' => $ticket->formatted_time_spent,
                    'time_spent_minutes' => $ticket->total_time_spent,
                ],
                'time_entries' => $ticket->timeEntries->map(fn ($entry) => [
                    'id' => $entry->id,
                    'minutes' => $entry->minutes,
                    'formatted_time' => $entry->formatted_time,
                    'description' => $entry->description,
                    'date_worked' => $entry->date_worked?->toDateString(),
                    'user' => $entry->user,
                    'created_at' => $entry->created_at,
                ]),
                'metadata' => $ticket->metadata,
                'watchers' => $ticket->watchers->map(fn ($watcher) => [
                    'id' => $watcher->id,
                    'name' => $watcher->name,
                    'email' => $watcher->email,
                ]),
                'is_watching' => $ticket->watchers->contains('id', $user->id),
                'created_at' => $ticket->created_at,
                'updated_at' => $ticket->updated_at,
                'permissions' => [
                    'can_update' => $user->canUpdateTicket($ticket),
                    'can_assign' => $user->hasProjectPermission($ticket->project, 'ticket.assign'),
                    'can_change_status' => $user->hasProjectPermission($ticket->project, 'ticket.change_status'),
                    'can_change_priority' => $user->hasProjectPermission($ticket->project, 'ticket.change_priority'),
                    'can_comment' => $user->hasProjectPermission($ticket->project, 'comment.create'),
                    'can_internal_comment' => $canSeeInternal,
                ],
            ],
        ]);
    }

    /**
     * Create a new ticket
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'project_id' => ['required', 'exists:helpdesk_projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'priority_id' => ['nullable', 'exists:helpdesk_ticket_priorities,id'],
            'type_id' => ['nullable', 'exists:helpdesk_ticket_types,id'],
        ]);

        $project = Project::findOrFail($validated['project_id']);

        if (! $user->hasAccessToProject($project)) {
            return response()->json([
                'message' => 'You do not have access to this project',
            ], 403);
        }

        if (! $user->hasProjectPermission($project, 'ticket.create')) {
            return response()->json([
                'message' => 'You do not have permission to create tickets in this project',
            ], 403);
        }

        // Get default status and priority (project-specific or global fallback)
        $defaultStatus = $project->statuses()->where('slug', 'open')->first()
            ?? $project->statuses()->first()
            ?? TicketStatus::whereNull('project_id')->where('slug', 'open')->first()
            ?? TicketStatus::whereNull('project_id')->first();

        $defaultPriority = $validated['priority_id']
            ? null
            : $project->priorities()->where('slug', 'medium')->first()
                ?? $project->priorities()->first()
                ?? TicketPriority::whereNull('project_id')->where('slug', 'medium')->first()
                ?? TicketPriority::whereNull('project_id')->first();

        // Get default type (project-specific or global fallback)
        $defaultType = $validated['type_id']
            ? null
            : $project->types()->where('slug', 'question')->first()
                ?? $project->types()->first()
                ?? TicketType::whereNull('project_id')->where('slug', 'question')->first()
                ?? TicketType::whereNull('project_id')->first();

        $ticket = Ticket::create([
            'project_id' => $project->id,
            'number' => $project->getNextTicketNumber(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status_id' => $defaultStatus?->id,
            'priority_id' => $validated['priority_id'] ?? $defaultPriority?->id,
            'type_id' => $validated['type_id'] ?? $defaultType?->id,
            'submitter_name' => $user->name,
            'submitter_email' => $user->email,
            'submitter_user_id' => $user->id,
        ]);

        $ticket->logActivity('created', null, null, $user->id);

        // Auto-add watchers from project settings
        app(\App\Services\Helpdesk\NotificationService::class)->addAutoWatchers($ticket);

        $ticket->load(['project', 'status', 'priority', 'type']);

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket created successfully',
        ], 201);
    }

    /**
     * Update a ticket
     */
    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canUpdateTicket($ticket)) {
            return response()->json([
                'message' => 'You do not have permission to update this ticket',
            ], 403);
        }

        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
        ];

        // Additional fields based on permissions
        if ($user->hasProjectPermission($ticket->project, 'ticket.change_status')) {
            $rules['status_id'] = ['sometimes', 'exists:helpdesk_ticket_statuses,id'];
        }
        if ($user->hasProjectPermission($ticket->project, 'ticket.change_priority')) {
            $rules['priority_id'] = ['sometimes', 'exists:helpdesk_ticket_priorities,id'];
        }
        if ($user->hasProjectPermission($ticket->project, 'ticket.assign')) {
            $rules['assignee_id'] = ['sometimes', 'nullable', 'exists:users,id'];
        }

        $validated = $request->validate($rules);

        // Log changes
        foreach ($validated as $field => $newValue) {
            $oldValue = $ticket->$field;
            if ($oldValue != $newValue) {
                $ticket->logActivity("updated_{$field}", (string) $oldValue, (string) $newValue, $user->id);
            }
        }

        $ticket->update($validated);

        $ticket->load(['project', 'status', 'priority', 'type', 'assignee']);

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket updated successfully',
        ]);
    }

    /**
     * Format a comment with its attachments for API response
     */
    private function formatComment($comment): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'is_internal' => $comment->is_internal,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'email' => $comment->user->email,
            ] : null,
            'attachments' => $comment->attachments->map(fn ($a) => [
                'id' => $a->id,
                'filename' => $a->filename,
                'mime_type' => $a->mime_type,
                'size' => $a->size,
                'human_size' => $this->humanFileSize($a->size),
                'is_image' => str_starts_with($a->mime_type, 'image/'),
                'url' => route('helpdesk.attachments.download', $a),
            ])->toArray(),
            'created_at' => $comment->created_at,
            'updated_at' => $comment->updated_at,
        ];
    }

    /**
     * Convert bytes to human readable size
     */
    private function humanFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 1).' '.$units[$i];
    }
}
