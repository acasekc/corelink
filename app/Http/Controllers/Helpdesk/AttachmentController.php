<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    /**
     * Upload attachments to a ticket
     */
    public function uploadToTicket(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $this->handleUpload($request, $ticket, $user);
    }

    /**
     * Upload attachments to a comment
     */
    public function uploadToComment(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($comment->ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $this->handleUpload($request, $comment, $user);
    }

    /**
     * Handle file upload
     */
    private function handleUpload(Request $request, Ticket|Comment $attachable, $user): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'max:30'],
            'files.*' => [
                'required',
                'file',
                'max:'.(Attachment::MAX_FILE_SIZE / 1024), // KB
                'mimetypes:'.implode(',', Attachment::ALLOWED_MIME_TYPES),
            ],
        ], [
            'files.*.mimetypes' => 'Only images and documents (PDF, Word, Excel, PowerPoint, TXT, CSV) are allowed.',
            'files.*.max' => 'File size must not exceed 10MB.',
            'files.max' => 'You may upload a maximum of 30 files at once.',
        ]);

        $disk = config('filesystems.default') === 's3' ? 's3' : 'local';
        $attachments = [];

        foreach ($request->file('files') as $file) {
            // Skip invalid files
            if (! $file->isValid()) {
                continue;
            }

            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Generate unique filename
            $filename = Str::uuid().'.'.$extension;
            $directory = 'helpdesk/attachments/'.now()->format('Y/m');
            $path = $directory.'/'.$filename;

            // Get file contents from stream (more reliable on Windows)
            $stream = fopen($file->getPathname(), 'r');
            if (! $stream) {
                continue;
            }

            // Store file using stream
            Storage::disk($disk)->put($path, $stream);

            if (is_resource($stream)) {
                fclose($stream);
            }

            // Create attachment record
            $attachment = $attachable->attachments()->create([
                'uploaded_by' => $user->id,
                'filename' => $originalName,
                'path' => $path,
                'disk' => $disk,
                'mime_type' => $mimeType,
                'size' => $size,
            ]);

            $attachments[] = [
                'id' => $attachment->id,
                'filename' => $attachment->filename,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'human_size' => $attachment->human_size,
                'is_image' => $attachment->isImage(),
                'url' => route('helpdesk.attachments.download', $attachment),
            ];
        }

        return response()->json([
            'message' => 'Files uploaded successfully',
            'data' => $attachments,
        ], 201);
    }

    /**
     * Download an attachment
     */
    public function download(Request $request, Attachment $attachment): StreamedResponse|JsonResponse
    {
        $user = $request->user();

        // Check if user can access the parent ticket
        $ticket = $attachment->attachable instanceof Ticket
            ? $attachment->attachable
            : $attachment->attachable->ticket;

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! $attachment->exists()) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk($attachment->disk)->download(
            $attachment->path,
            $attachment->filename,
            ['Content-Type' => $attachment->mime_type]
        );
    }

    /**
     * Delete an attachment
     */
    public function destroy(Request $request, Attachment $attachment): JsonResponse
    {
        $user = $request->user();

        // Only the uploader or an admin can delete
        if ($attachment->uploaded_by !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully']);
    }

    /**
     * List attachments for a ticket
     */
    public function listForTicket(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attachments = $ticket->attachments()->with('uploader:id,name')->get();

        return response()->json([
            'data' => $attachments->map(fn ($a) => [
                'id' => $a->id,
                'filename' => $a->filename,
                'mime_type' => $a->mime_type,
                'size' => $a->size,
                'human_size' => $a->human_size,
                'is_image' => $a->isImage(),
                'url' => route('helpdesk.attachments.download', $a),
                'uploaded_by' => $a->uploader?->name,
                'created_at' => $a->created_at,
            ]),
        ]);
    }
}
