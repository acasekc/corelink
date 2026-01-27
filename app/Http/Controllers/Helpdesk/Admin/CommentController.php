<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Ticket $ticket): JsonResponse
    {
        $comments = $ticket->comments()
            ->with(['user', 'attachments'])
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => $comments->map(fn (Comment $comment) => $this->formatComment($comment)),
        ]);
    }

    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        $ticket->logActivity(
            $comment->is_internal ? 'internal_comment_added' : 'comment_added',
            null,
            auth()->user()->name.' commented'
        );

        // Send notification (service handles internal comment exclusion)
        app(\App\Services\Helpdesk\TicketNotificationService::class)
            ->notifyCommentAdded($ticket, $comment);

        return response()->json([
            'data' => $this->formatComment($comment->load('attachments')),
            'message' => 'Comment added successfully',
        ], 201);
    }

    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Check if user can modify this comment (3-minute window)
        if (! $comment->canBeModifiedBy(auth()->user())) {
            return response()->json([
                'message' => 'Edit window has expired (3 minutes) or you do not have permission.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment->update($validated);

        return response()->json([
            'data' => $this->formatComment($comment->load('attachments')),
            'message' => 'Comment updated successfully',
        ]);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        // Check if user can modify this comment (3-minute window)
        if (! $comment->canBeModifiedBy(auth()->user())) {
            return response()->json([
                'message' => 'Delete window has expired (3 minutes) or you do not have permission.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }

    private function formatComment(Comment $comment): array
    {
        $user = auth()->user();

        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'author_name' => $comment->author_name,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ] : null,
            'submitter_email' => $comment->submitter_email,
            'is_internal' => $comment->is_internal,
            'is_from_admin' => $comment->isFromAdmin(),
            'can_modify' => $comment->canBeModifiedBy($user),
            'edit_window_seconds' => $comment->getEditWindowSecondsRemaining(),
            'attachments' => $comment->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'filename' => $attachment->filename,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'human_size' => $attachment->human_size,
                'is_image' => $attachment->isImage(),
                'url' => route('helpdesk.attachments.download', $attachment),
            ]),
            'created_at' => $comment->created_at->toIso8601String(),
        ];
    }
}
