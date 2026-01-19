<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with(['project', 'status', 'priority', 'type', 'assignee', 'labels'])
            ->orderByDesc('created_at');

        if ($request->filled('project')) {
            $query->whereHas('project', fn ($q) => $q->where('slug', $request->input('project')));
        }

        if ($request->filled('status')) {
            $query->whereHas('status', fn ($q) => $q->where('slug', $request->input('status')));
        }

        if ($request->filled('priority')) {
            $query->whereHas('priority', fn ($q) => $q->where('slug', $request->input('priority')));
        }

        if ($request->filled('assignee_id')) {
            $query->where('assignee_id', $request->input('assignee_id'));
        }

        if ($request->filled('unassigned')) {
            $query->whereNull('assignee_id');
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

        $tickets = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $tickets->map(fn (Ticket $ticket) => $this->formatTicket($ticket)),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'project_id' => ['required', 'exists:helpdesk_projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'priority_id' => ['nullable', 'exists:helpdesk_ticket_priorities,id'],
            'type_id' => ['nullable', 'exists:helpdesk_ticket_types,id'],
            'status_id' => ['nullable', 'exists:helpdesk_ticket_statuses,id'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'submitter_user_id' => ['nullable', 'exists:users,id'],
            'submitter_name' => ['nullable', 'string', 'max:255'],
            'submitter_email' => ['nullable', 'email', 'max:255'],
        ]);

        $project = Project::findOrFail($validated['project_id']);

        // Get default status (project-specific or global fallback)
        $defaultStatus = $validated['status_id']
            ? TicketStatus::find($validated['status_id'])
            : $project->statuses()->where('slug', 'open')->first()
                ?? $project->statuses()->first()
                ?? TicketStatus::whereNull('project_id')->where('slug', 'open')->first()
                ?? TicketStatus::whereNull('project_id')->first();

        // Get priority (explicit or default)
        $priority = $validated['priority_id']
            ? TicketPriority::find($validated['priority_id'])
            : $project->priorities()->where('slug', 'medium')->first()
                ?? $project->priorities()->first()
                ?? TicketPriority::whereNull('project_id')->where('slug', 'medium')->first()
                ?? TicketPriority::whereNull('project_id')->first();

        // Get type (explicit or default)
        $type = $validated['type_id']
            ? TicketType::find($validated['type_id'])
            : $project->types()->where('slug', 'question')->first()
                ?? $project->types()->first()
                ?? TicketType::whereNull('project_id')->where('slug', 'question')->first()
                ?? TicketType::whereNull('project_id')->first();

        // Determine submitter info
        $submitterUser = null;
        if (! empty($validated['submitter_user_id'])) {
            $submitterUser = User::find($validated['submitter_user_id']);
        }

        $submitterName = $validated['submitter_name'] ?? $submitterUser?->name ?? $user->name;
        $submitterEmail = $validated['submitter_email'] ?? $submitterUser?->email ?? $user->email;

        $ticket = Ticket::create([
            'project_id' => $project->id,
            'number' => $project->getNextTicketNumber(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status_id' => $defaultStatus?->id,
            'priority_id' => $priority?->id,
            'type_id' => $type?->id,
            'assignee_id' => $validated['assignee_id'] ?? null,
            'submitter_name' => $submitterName,
            'submitter_email' => $submitterEmail,
            'submitter_user_id' => $submitterUser?->id ?? $validated['submitter_user_id'] ?? null,
        ]);

        $ticket->logActivity('created', null, null, $user->id);

        $ticket->load(['project', 'status', 'priority', 'type', 'assignee']);

        return response()->json([
            'data' => $this->formatTicket($ticket),
            'message' => 'Ticket created successfully',
        ], 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['project', 'status', 'priority', 'type', 'assignee', 'labels', 'comments.user', 'activities.user']);

        return response()->json([
            'data' => $this->formatTicket($ticket, true),
        ]);
    }

    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'github_issue_url' => 'nullable|url',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $ticket->title) {
            $ticket->logActivity('title_changed', $ticket->title, $validated['title']);
        }

        $ticket->update($validated);

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['project', 'status', 'priority', 'type', 'assignee', 'labels'])),
            'message' => 'Ticket updated successfully',
        ]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $ticket->logActivity('deleted');
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully',
        ]);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:helpdesk_tickets,id'],
        ]);

        $tickets = Ticket::whereIn('id', $validated['ids'])->get();
        $count = $tickets->count();

        foreach ($tickets as $ticket) {
            $ticket->logActivity('deleted');
            $ticket->delete();
        }

        return response()->json([
            'message' => "{$count} ticket(s) deleted successfully",
            'count' => $count,
        ]);
    }

    public function assign(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $oldAssignee = $ticket->assignee;
        $newAssignee = $validated['assignee_id'] ? User::find($validated['assignee_id']) : null;

        $ticket->update(['assignee_id' => $validated['assignee_id']]);

        $ticket->logActivity(
            'assigned',
            $oldAssignee?->name ?? 'Unassigned',
            $newAssignee?->name ?? 'Unassigned'
        );

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['project', 'status', 'priority', 'type', 'assignee', 'labels'])),
            'message' => 'Ticket assigned successfully',
        ]);
    }

    public function changeStatus(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:helpdesk_ticket_statuses,id',
        ]);

        $oldStatus = $ticket->status;
        $newStatus = TicketStatus::find($validated['status_id']);

        $ticket->update(['status_id' => $validated['status_id']]);

        $ticket->logActivity('status_changed', $oldStatus->title, $newStatus->title);

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['project', 'status', 'priority', 'type', 'assignee', 'labels'])),
            'message' => 'Status changed successfully',
        ]);
    }

    public function changePriority(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'priority_id' => 'required|exists:helpdesk_ticket_priorities,id',
        ]);

        $oldPriority = $ticket->priority;
        $newPriority = TicketPriority::find($validated['priority_id']);

        $ticket->update(['priority_id' => $validated['priority_id']]);

        $ticket->logActivity('priority_changed', $oldPriority->title, $newPriority->title);

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['project', 'status', 'priority', 'type', 'assignee', 'labels'])),
            'message' => 'Priority changed successfully',
        ]);
    }

    public function addLabels(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'label_ids' => 'required|array',
            'label_ids.*' => 'exists:helpdesk_labels,id',
        ]);

        $ticket->labels()->sync($validated['label_ids']);

        $ticket->logActivity('labels_updated');

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['project', 'status', 'priority', 'type', 'assignee', 'labels'])),
            'message' => 'Labels updated successfully',
        ]);
    }

    private function formatTicket(Ticket $ticket, bool $full = false): array
    {
        $data = [
            'id' => $ticket->id,
            'number' => $ticket->ticket_number,
            'title' => $ticket->title,
            'content' => $ticket->content,
            'project' => [
                'id' => $ticket->project->id,
                'name' => $ticket->project->name,
                'slug' => $ticket->project->slug,
                'color' => $ticket->project->color,
            ],
            'status' => [
                'id' => $ticket->status->id,
                'title' => $ticket->status->title,
                'slug' => $ticket->status->slug,
                'color' => $ticket->status->bg_color,
            ],
            'priority' => [
                'id' => $ticket->priority->id,
                'title' => $ticket->priority->title,
                'slug' => $ticket->priority->slug,
                'color' => $ticket->priority->bg_color,
            ],
            'type' => [
                'id' => $ticket->type->id,
                'title' => $ticket->type->title,
                'slug' => $ticket->type->slug,
                'color' => $ticket->type->bg_color,
            ],
            'assignee' => $ticket->assignee ? [
                'id' => $ticket->assignee->id,
                'name' => $ticket->assignee->name,
                'email' => $ticket->assignee->email,
            ] : null,
            'submitter' => [
                'name' => $ticket->submitter_name,
                'email' => $ticket->submitter_email,
                'user_id' => $ticket->submitter_user_id,
            ],
            'labels' => $ticket->labels->map(fn ($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ]),
            'github_issue_url' => $ticket->github_issue_url,
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
        ];

        if ($full) {
            $data['comments'] = $ticket->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => $comment->author_name,
                'user' => $comment->user ? [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                ] : null,
                'is_internal' => $comment->is_internal,
                'is_from_admin' => $comment->isFromAdmin(),
                'created_at' => $comment->created_at->toIso8601String(),
            ]);

            $data['activities'] = $ticket->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'action' => $activity->action,
                'old_value' => $activity->old_value,
                'new_value' => $activity->new_value,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                ] : null,
                'created_at' => $activity->created_at->toIso8601String(),
            ]);

            $data['metadata'] = $ticket->metadata;
        }

        return $data;
    }
}
