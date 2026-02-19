<?php

namespace App\Http\Controllers\Helpdesk\Api;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Services\Helpdesk\NotificationService;
use App\Services\Helpdesk\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TicketApiController extends Controller
{
    public function __construct(
        protected WebhookService $webhookService,
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $query = $project->tickets()
            ->with(['status', 'priority', 'type', 'assignee', 'attachments'])
            ->orderByDesc('created_at');

        // Filter by submitter
        if ($request->filled('submitter_user_id')) {
            $query->where('submitter_user_id', $request->input('submitter_user_id'));
        }

        if ($request->filled('submitter_email')) {
            $query->where('submitter_email', $request->input('submitter_email'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->whereHas('status', fn ($q) => $q->where('slug', $request->input('status')));
        }

        $tickets = $query->paginate($request->input('per_page', 15));

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
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'nullable|string|exists:helpdesk_ticket_priorities,slug',
            'type' => 'nullable|string|exists:helpdesk_ticket_types,slug',
            'submitter_name' => 'required|string|max:255',
            'submitter_email' => 'required|email|max:255',
            'submitter_user_id' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => [
                'file',
                'max:'.(Attachment::MAX_FILE_SIZE / 1024),
                'mimetypes:'.implode(',', Attachment::ALLOWED_MIME_TYPES),
            ],
        ], [
            'attachments.*.mimetypes' => 'Only images and documents (PDF, Word, Excel, TXT, CSV) are allowed.',
            'attachments.*.max' => 'File size must not exceed 10MB.',
        ]);

        $status = TicketStatus::getDefaultForProject($project->id);

        // Get priority - use provided or default (first by order, then id)
        $priority = null;
        if (! empty($validated['priority'])) {
            $priority = TicketPriority::where('slug', $validated['priority'])
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();
        }
        if (! $priority) {
            $priority = TicketPriority::query()
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->orderBy('order')
                ->orderBy('id')
                ->first();
        }

        // Get type - use provided or default (first by id - no order column)
        $type = null;
        if (! empty($validated['type'])) {
            $type = TicketType::where('slug', $validated['type'])
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();
        }
        if (! $type) {
            $type = TicketType::query()
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->orderBy('id')
                ->first();
        }

        $ticket = $project->tickets()->create([
            'number' => $project->getNextTicketNumber(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status_id' => $status->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
            'submitter_name' => $validated['submitter_name'],
            'submitter_email' => $validated['submitter_email'],
            'submitter_user_id' => $validated['submitter_user_id'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        $ticket->logActivity('created', null, null, null);

        // Handle file attachments
        $attachmentData = [];
        if ($request->hasFile('attachments')) {
            $disk = config('filesystems.default') === 's3' ? 's3' : 'local';

            foreach ($request->file('attachments') as $file) {
                if (! $file->isValid()) {
                    continue;
                }

                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $mimeType = $file->getMimeType();
                $size = $file->getSize();

                $filename = Str::uuid().'.'.$extension;
                $directory = 'helpdesk/attachments/'.now()->format('Y/m');
                $path = $directory.'/'.$filename;

                $stream = fopen($file->getPathname(), 'r');
                if (! $stream) {
                    continue;
                }

                Storage::disk($disk)->put($path, $stream);

                if (is_resource($stream)) {
                    fclose($stream);
                }

                $attachment = $ticket->attachments()->create([
                    'uploaded_by' => null,
                    'filename' => $originalName,
                    'path' => $path,
                    'disk' => $disk,
                    'mime_type' => $mimeType,
                    'size' => $size,
                ]);

                $attachmentData[] = [
                    'id' => $attachment->id,
                    'filename' => $attachment->filename,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                    'is_image' => $attachment->isImage(),
                ];
            }
        }

        // Load relationships for webhook/notification
        $ticket->load(['status', 'priority', 'type', 'project']);

        // Dispatch webhooks
        $this->webhookService->ticketCreated($ticket);

        // Send email notifications to project staff
        $this->notificationService->notifyNewTicket($ticket);

        // Auto-add watchers from project settings
        $this->notificationService->addAutoWatchers($ticket);

        return response()->json([
            'data' => $this->formatTicket($ticket),
            'attachments' => $attachmentData,
            'message' => 'Ticket created successfully',
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $ticket = $project->tickets()
            ->with(['status', 'priority', 'type', 'assignee', 'labels', 'attachments', 'comments' => function ($q) {
                $q->where('is_internal', false)->with('attachments');
            }])
            ->findOrFail($id);

        return response()->json([
            'data' => $this->formatTicket($ticket, true),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $ticket = $project->tickets()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $ticket->title) {
            $ticket->logActivity('title_changed', $ticket->title, $validated['title'], null);
        }

        $ticket->update($validated);

        return response()->json([
            'data' => $this->formatTicket($ticket->fresh(['status', 'priority', 'type'])),
            'message' => 'Ticket updated successfully',
        ]);
    }

    private function formatTicket(Ticket $ticket, bool $includeComments = false): array
    {
        $data = [
            'id' => $ticket->id,
            'number' => $ticket->ticket_number,
            'title' => $ticket->title,
            'content' => $ticket->content,
            'status' => [
                'slug' => $ticket->status->slug,
                'title' => $ticket->status->title,
                'color' => $ticket->status->bg_color,
            ],
            'priority' => [
                'slug' => $ticket->priority->slug,
                'title' => $ticket->priority->title,
                'color' => $ticket->priority->bg_color,
            ],
            'type' => [
                'slug' => $ticket->type->slug,
                'title' => $ticket->type->title,
                'color' => $ticket->type->bg_color,
            ],
            'assignee' => $ticket->assignee ? [
                'id' => $ticket->assignee->id,
                'name' => $ticket->assignee->name,
            ] : null,
            'submitter' => [
                'name' => $ticket->submitter_name,
                'email' => $ticket->submitter_email,
                'user_id' => $ticket->submitter_user_id,
            ],
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
        ];

        if ($includeComments && $ticket->relationLoaded('comments')) {
            $data['comments'] = $ticket->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => $comment->author_name,
                'is_from_admin' => $comment->isFromAdmin(),
                'attachments' => $comment->attachments->map(fn ($att) => $this->formatAttachment($att))->values()->all(),
                'created_at' => $comment->created_at->toIso8601String(),
            ]);
        }

        if ($ticket->relationLoaded('attachments')) {
            $data['attachments'] = $ticket->attachments->map(fn ($att) => $this->formatAttachment($att))->values()->all();
        }

        if ($ticket->relationLoaded('labels')) {
            $data['labels'] = $ticket->labels->map(fn ($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ]);
        }

        return $data;
    }

    private function formatAttachment(Attachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'filename' => $attachment->filename,
            'mime_type' => $attachment->mime_type,
            'size' => $attachment->size,
            'is_image' => $attachment->isImage(),
            'url' => $attachment->url,
        ];
    }
}
