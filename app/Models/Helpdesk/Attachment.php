<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected $table = 'helpdesk_attachments';

    protected $fillable = [
        'attachable_type',
        'attachable_id',
        'uploaded_by',
        'filename',
        'path',
        'disk',
        'mime_type',
        'size',
    ];

    /**
     * Allowed MIME types for uploads
     */
    public const ALLOWED_MIME_TYPES = [
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
    ];

    /**
     * Max file size in bytes (10MB)
     */
    public const MAX_FILE_SIZE = 10 * 1024 * 1024;

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the full URL to the attachment
     */
    public function getUrlAttribute(): string
    {
        return route('helpdesk.attachments.download', $this);
    }

    /**
     * Get the storage disk instance
     */
    public function getDiskInstance(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk($this->disk);
    }

    /**
     * Check if the file exists
     */
    public function exists(): bool
    {
        return $this->getDiskInstance()->exists($this->path);
    }

    /**
     * Get the file contents
     */
    public function getContents(): ?string
    {
        return $this->getDiskInstance()->get($this->path);
    }

    /**
     * Delete the file from storage
     */
    public function deleteFile(): bool
    {
        if ($this->exists()) {
            return $this->getDiskInstance()->delete($this->path);
        }

        return true;
    }

    /**
     * Get human-readable file size
     */
    public function getHumanSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2).' '.$units[$i];
    }

    /**
     * Check if the attachment is an image
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::deleting(function (Attachment $attachment) {
            $attachment->deleteFile();
        });
    }
}
