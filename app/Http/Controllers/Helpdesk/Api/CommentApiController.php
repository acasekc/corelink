<?php

namespace App\Http\Controllers\Helpdesk\Api;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentApiController extends Controller
{
    public function index(Request $request, int $ticketId): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $ticket = $project->tickets()->findOrFail($ticketId);

        // External API only sees non-internal comments
        $comments = $ticket->comments()
            ->where('is_internal', false)
            ->with('attachments')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => $comments->map(fn (Comment $comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => $comment->author_name,
                'is_from_admin' => $comment->isFromAdmin(),
                'attachments' => $comment->attachments->map(fn ($att) => [
                    'id' => $att->id,
                    'filename' => $att->filename,
                    'mime_type' => $att->mime_type,
                    'size' => $att->size,
                    'is_image' => $att->isImage(),
                    'url' => $att->url,
                ])->values()->all(),
                'created_at' => $comment->created_at->toIso8601String(),
            ]),
        ]);
    }

    public function store(Request $request, int $ticketId): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $ticket = $project->tickets()->findOrFail($ticketId);

        $validated = $request->validate([
            'content' => 'required|string',
            'submitter_name' => 'nullable|string|max:255',
            'submitter_email' => 'nullable|email|max:255',
        ]);

        $comment = $ticket->comments()->create([
            'content' => $validated['content'],
            'submitter_name' => $validated['submitter_name'] ?? $ticket->submitter_name,
            'submitter_email' => $validated['submitter_email'] ?? $ticket->submitter_email,
            'is_internal' => false,
        ]);

        $ticket->logActivity('comment_added', null, 'External user commented', null);

        return response()->json([
            'data' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => $comment->author_name,
                'is_from_admin' => false,
                'attachments' => [],
                'created_at' => $comment->created_at->toIso8601String(),
            ],
            'message' => 'Comment added successfully',
        ], 201);
    }
}
