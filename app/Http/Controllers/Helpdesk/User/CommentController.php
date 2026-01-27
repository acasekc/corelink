<?php

namespace App\Http\Controllers\Helpdesk\User;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Add a comment to a ticket
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json([
                'message' => 'You do not have access to this ticket',
            ], 403);
        }

        if (! $user->hasProjectPermission($ticket->project, 'comment.create')) {
            return response()->json([
                'message' => 'You do not have permission to comment on this ticket',
            ], 403);
        }

        $canInternal = $user->hasProjectPermission($ticket->project, 'comment.internal');

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_internal' => ['boolean'],
        ]);

        // Only allow internal comments if user has permission
        $isInternal = $canInternal && ($validated['is_internal'] ?? false);

        $comment = $ticket->comments()->create([
            'user_id' => $user->id,
            'content' => $validated['content'],
            'is_internal' => $isInternal,
        ]);

        $ticket->logActivity('commented', null, $isInternal ? 'internal' : 'public', $user->id);

        // Send notification (service handles internal comment exclusion)
        app(\App\Services\Helpdesk\TicketNotificationService::class)
            ->notifyCommentAdded($ticket, $comment);

        $comment->load(['user:id,name,email', 'attachments']);

        return response()->json([
            'data' => $this->formatComment($comment, $user),
            'message' => 'Comment added successfully',
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(Request $request, Ticket $ticket, Comment $comment): JsonResponse
    {
        $user = $request->user();

        // Check 3-minute edit window
        if (! $comment->canBeModifiedBy($user)) {
            return response()->json([
                'message' => 'Edit window has expired (3 minutes) or you do not have permission.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment->update($validated);

        $comment->load(['user:id,name,email', 'attachments']);

        return response()->json([
            'data' => $this->formatComment($comment, $user),
            'message' => 'Comment updated successfully',
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(Request $request, Ticket $ticket, Comment $comment): JsonResponse
    {
        $user = $request->user();

        // Check 3-minute delete window
        if (! $comment->canBeModifiedBy($user)) {
            return response()->json([
                'message' => 'Delete window has expired (3 minutes) or you do not have permission.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }

    /**
     * Format a comment with its attachments for API response
     */
    private function formatComment(Comment $comment, $user = null): array
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
            'can_modify' => $user ? $comment->canBeModifiedBy($user) : false,
            'edit_window_seconds' => $comment->getEditWindowSecondsRemaining(),
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
