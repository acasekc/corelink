<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class CaseStudy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'description',
        'client_name',
        'industry',
        'project_type',
        'technologies',
        'hero_image',
        'content',
        'metrics',
        'is_published',
        'order',
    ];

    protected $casts = [
        'technologies' => 'array',
        'metrics' => 'array',
        'is_published' => 'boolean',
    ];

    public function getHeroImageAttribute(?string $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        if (! str_starts_with($value, '/storage/')) {
            return $value;
        }

        $assetDisk = $this->getPublicAssetDisk();

        if ($assetDisk === 'public') {
            return $value;
        }

        $relativePath = ltrim(str_replace('/storage/', '', $value), '/');

        /** @var \Illuminate\Filesystem\FilesystemAdapter $storage */
        $storage = Storage::disk($assetDisk);

        return $storage->url($relativePath);
    }

    private function getPublicAssetDisk(): string
    {
        $defaultDisk = (string) config('filesystems.default', 'local');

        return $defaultDisk === 'local' ? 'public' : $defaultDisk;
    }
}
