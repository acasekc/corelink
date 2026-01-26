<?php

namespace App\Services;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\Helpdesk\TimeEntry;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TicketService
{
    /**
     * Get all tickets with relationships.
     *
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Get paginated tickets.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 20, array $filters = []): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Get a single ticket by ID.
     */
    public function getById(int $id): ?Ticket
    {
        return Ticket::with([
            'project',
            'status',
            'priority',
            'type',
            'assignee',
            'labels',
            'comments.user',
            'attachments',
            'activities.user',
            'timeEntries.user',
        ])->find($id);
    }

    /**
     * Create a new ticket.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?User $currentUser = null): Ticket
    {
        $currentUser = $currentUser ?? auth()->user();

        $project = Project::findOrFail($data['project_id']);

        // Determine status
        $status = $this->resolveStatus($project, $data['status_id'] ?? null);

        // Determine priority
        $priority = $this->resolvePriority($project, $data['priority_id'] ?? null);

        // Determine type
        $type = $this->resolveType($project, $data['type_id'] ?? null);

        // Resolve submitter information
        $submitterUser = null;
        if (! empty($data['submitter_user_id'])) {
            $submitterUser = User::find($data['submitter_user_id']);
        }

        $submitterName = $data['submitter_name'] ?? $submitterUser?->name ?? $currentUser->name;
        $submitterEmail = $data['submitter_email'] ?? $submitterUser?->email ?? $currentUser->email;

        // Parse time estimate if provided
        $timeEstimateMinutes = null;
        if (! empty($data['time_estimate'])) {
            $timeEstimateMinutes = TimeEntry::parseTimeString($data['time_estimate']);
        }

        $ticket = Ticket::create([
            'project_id' => $project->id,
            'number' => $project->getNextTicketNumber(),
            'title' => $data['title'],
            'content' => $data['content'],
            'status_id' => $status?->id,
            'priority_id' => $priority?->id,
            'type_id' => $type?->id,
            'assignee_id' => $data['assignee_id'] ?? null,
            'submitter_name' => $submitterName,
            'submitter_email' => $submitterEmail,
            'submitter_user_id' => $submitterUser?->id ?? $data['submitter_user_id'] ?? null,
            'time_estimate_minutes' => $timeEstimateMinutes,
        ]);

        // Log activity
        $ticket->logActivity('created', null, null, $currentUser->id);

        return $ticket->load(['project', 'status', 'priority', 'type', 'assignee', 'labels']);
    }

    /**
     * Update an existing ticket.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Ticket $ticket, array $data, ?User $currentUser = null): Ticket
    {
        $currentUser = $currentUser ?? auth()->user();

        $updateData = [];

        // Handle title
        if (isset($data['title']) && $data['title'] !== $ticket->title) {
            $ticket->logActivity('updated', 'title', $ticket->title, $currentUser->id, $data['title']);
            $updateData['title'] = $data['title'];
        }

        // Handle content
        if (isset($data['content']) && $data['content'] !== $ticket->content) {
            $ticket->logActivity('updated', 'content', $ticket->content, $currentUser->id, $data['content']);
            $updateData['content'] = $data['content'];
        }

        // Handle status
        if (isset($data['status_id']) && $data['status_id'] !== $ticket->status_id) {
            $oldStatus = $ticket->status?->name;
            $newStatus = TicketStatus::find($data['status_id'])?->name;
            $ticket->logActivity('status_changed', 'status', $oldStatus, $currentUser->id, $newStatus);
            $updateData['status_id'] = $data['status_id'];
        }

        // Handle priority
        if (isset($data['priority_id']) && $data['priority_id'] !== $ticket->priority_id) {
            $oldPriority = $ticket->priority?->name;
            $newPriority = TicketPriority::find($data['priority_id'])?->name;
            $ticket->logActivity('updated', 'priority', $oldPriority, $currentUser->id, $newPriority);
            $updateData['priority_id'] = $data['priority_id'];
        }

        // Handle type
        if (isset($data['type_id']) && $data['type_id'] !== $ticket->type_id) {
            $oldType = $ticket->type?->name;
            $newType = TicketType::find($data['type_id'])?->name;
            $ticket->logActivity('updated', 'type', $oldType, $currentUser->id, $newType);
            $updateData['type_id'] = $data['type_id'];
        }

        // Handle assignee
        if (isset($data['assignee_id']) && $data['assignee_id'] !== $ticket->assignee_id) {
            $oldAssignee = $ticket->assignee?->name;
            $newAssignee = $data['assignee_id'] ? User::find($data['assignee_id'])?->name : null;
            $ticket->logActivity('assigned', 'assignee', $oldAssignee, $currentUser->id, $newAssignee);
            $updateData['assignee_id'] = $data['assignee_id'];
        }

        // Handle time estimate
        if (isset($data['time_estimate'])) {
            $timeEstimateMinutes = ! empty($data['time_estimate'])
                ? TimeEntry::parseTimeString($data['time_estimate'])
                : null;

            if ($timeEstimateMinutes !== $ticket->time_estimate_minutes) {
                $ticket->logActivity('updated', 'time_estimate', $ticket->formatted_time_estimate, $currentUser->id, $timeEstimateMinutes ? TimeEntry::formatMinutes($timeEstimateMinutes) : null);
                $updateData['time_estimate_minutes'] = $timeEstimateMinutes;
            }
        }

        if (! empty($updateData)) {
            $ticket->update($updateData);
        }

        return $ticket->load(['project', 'status', 'priority', 'type', 'assignee', 'labels']);
    }

    /**
     * Delete a ticket (soft delete).
     */
    public function delete(Ticket $ticket): bool
    {
        return $ticket->delete();
    }

    /**
     * Build a query with filters.
     *
     * @param  array<string, mixed>  $filters
     */
    private function buildQuery(?array $filters = null)
    {
        $query = Ticket::with(['project', 'status', 'priority', 'type', 'assignee', 'labels'])
            ->orderByDesc('created_at');

        if (! $filters) {
            return $query;
        }

        if (! empty($filters['project'])) {
            $query->whereHas('project', fn ($q) => $q->where('slug', $filters['project']));
        }

        if (! empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (! empty($filters['status'])) {
            $query->whereHas('status', fn ($q) => $q->where('slug', $filters['status']));
        }

        if (! empty($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        if (! empty($filters['priority'])) {
            $query->whereHas('priority', fn ($q) => $q->where('slug', $filters['priority']));
        }

        if (! empty($filters['priority_id'])) {
            $query->where('priority_id', $filters['priority_id']);
        }

        if (! empty($filters['assignee_id'])) {
            $query->where('assignee_id', $filters['assignee_id']);
        }

        if (! empty($filters['unassigned']) && $filters['unassigned'] === true) {
            $query->whereNull('assignee_id');
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('submitter_name', 'like', "%{$search}%")
                    ->orWhere('submitter_email', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Resolve the status for a ticket (explicit or default).
     */
    private function resolveStatus(Project $project, ?int $statusId): ?TicketStatus
    {
        if ($statusId) {
            return TicketStatus::find($statusId);
        }

        return $project->statuses()->where('slug', 'open')->first()
            ?? $project->statuses()->first()
            ?? TicketStatus::whereNull('project_id')->where('slug', 'open')->first()
            ?? TicketStatus::whereNull('project_id')->first();
    }

    /**
     * Resolve the priority for a ticket (explicit or default).
     */
    private function resolvePriority(Project $project, ?int $priorityId): ?TicketPriority
    {
        if ($priorityId) {
            return TicketPriority::find($priorityId);
        }

        return $project->priorities()->where('slug', 'medium')->first()
            ?? $project->priorities()->first()
            ?? TicketPriority::whereNull('project_id')->where('slug', 'medium')->first()
            ?? TicketPriority::whereNull('project_id')->first();
    }

    /**
     * Resolve the type for a ticket (explicit or default).
     */
    private function resolveType(Project $project, ?int $typeId): ?TicketType
    {
        if ($typeId) {
            return TicketType::find($typeId);
        }

        return $project->types()->where('slug', 'question')->first()
            ?? $project->types()->first()
            ?? TicketType::whereNull('project_id')->where('slug', 'question')->first()
            ?? TicketType::whereNull('project_id')->first();
    }
}
