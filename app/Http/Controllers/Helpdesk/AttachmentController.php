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
use ZipArchive;

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

            $attachments[] = $this->formatAttachment($attachment);
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
        $authorization = $this->authorizeAttachmentAccess($request, $attachment);

        if ($authorization instanceof JsonResponse) {
            return $authorization;
        }

        if (! $attachment->exists()) {
            return response()->json(['message' => 'File not found'], 404);
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($attachment->disk);

        return $disk->download(
            $attachment->path,
            $attachment->filename,
            ['Content-Type' => $attachment->mime_type]
        );
    }

    /**
     * View an image attachment inline.
     */
    public function view(Request $request, Attachment $attachment): StreamedResponse|JsonResponse
    {
        $authorization = $this->authorizeAttachmentAccess($request, $attachment);

        if ($authorization instanceof JsonResponse) {
            return $authorization;
        }

        if (! $attachment->isImage()) {
            return response()->json(['message' => 'Attachment is not an image'], 422);
        }

        if (! $attachment->exists()) {
            return response()->json(['message' => 'File not found'], 404);
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($attachment->disk);

        return $disk->response(
            $attachment->path,
            $attachment->filename,
            [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'inline; filename="'.$attachment->filename.'"',
            ]
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
            'data' => $attachments->map(fn ($a) => $this->formatAttachment($a) + [
                'uploaded_by' => $a->uploader?->name,
                'created_at' => $a->created_at,
            ]),
        ]);
    }

    /**
     * Build a consistent attachment response payload.
     *
     * @return array<string, mixed>
     */
    private function formatAttachment(Attachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'filename' => $attachment->filename,
            'mime_type' => $attachment->mime_type,
            'size' => $attachment->size,
            'human_size' => $attachment->human_size,
            'is_image' => $attachment->isImage(),
            'url' => $attachment->downloadUrl(),
        ] + ($attachment->isImage() ? ['view_url' => $attachment->viewUrl()] : []);
    }

    private function authorizeAttachmentAccess(Request $request, Attachment $attachment): ?JsonResponse
    {
        $ticket = $this->resolveAttachmentTicket($attachment);

        if (! $ticket) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $project = $request->attributes->get('helpdesk_project');
        if ($project) {
            if ((int) $ticket->project_id !== (int) $project->id) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return null;
        }

        $user = $request->user();

        if (! $user || ! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return null;
    }

    private function resolveAttachmentTicket(Attachment $attachment): ?Ticket
    {
        if ($attachment->attachable_type === Ticket::class) {
            return Ticket::query()->find($attachment->attachable_id);
        }

        if ($attachment->attachable_type === Comment::class) {
            return Comment::query()
                ->find($attachment->attachable_id)
                ?->ticket;
        }

        return null;
    }

    /**
     * Download all attachments for a ticket as a zip file.
     * Includes both ticket-level and comment-level attachments.
     */
    public function downloadAllForTicket(Request $request, Ticket $ticket): StreamedResponse|JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Gather ticket attachments and comment attachments
        $ticket->load(['attachments', 'comments.attachments']);

        $allAttachments = collect();

        foreach ($ticket->attachments as $attachment) {
            $allAttachments->push($attachment);
        }

        foreach ($ticket->comments as $comment) {
            foreach ($comment->attachments as $attachment) {
                $allAttachments->push($attachment);
            }
        }

        if ($allAttachments->isEmpty()) {
            return response()->json(['message' => 'No attachments to download'], 404);
        }

        $zipFilename = sprintf('ticket-%d-attachments.zip', $ticket->number);
        $tempPath = storage_path('app/temp/'.$zipFilename);

        // Ensure temp directory exists
        if (! is_dir(dirname($tempPath))) {
            mkdir(dirname($tempPath), 0755, true);
        }

        $zip = new ZipArchive;

        if ($zip->open($tempPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Could not create zip file'], 500);
        }

        $usedNames = [];

        foreach ($allAttachments as $attachment) {
            if (! $attachment->exists()) {
                continue;
            }

            // Deduplicate filenames
            $name = $attachment->filename;
            if (in_array($name, $usedNames, true)) {
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $base = pathinfo($name, PATHINFO_FILENAME);
                $counter = 2;
                do {
                    $name = $ext ? "{$base}_{$counter}.{$ext}" : "{$base}_{$counter}";
                    $counter++;
                } while (in_array($name, $usedNames, true));
            }
            $usedNames[] = $name;

            $contents = $attachment->getContents();
            if ($contents !== null) {
                $zip->addFromString($name, $contents);
            }
        }

        $zip->close();

        return response()->streamDownload(function () use ($tempPath) {
            readfile($tempPath);
            @unlink($tempPath);
        }, $zipFilename, [
            'Content-Type' => 'application/zip',
        ]);
    }
}
