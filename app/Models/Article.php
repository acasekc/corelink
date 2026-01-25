<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'meta_description',
        'excerpt',
        'content',
        'featured_image',
        'featured_image_alt',
        'article_category_id',
        'status',
        'published_at',
        'auto_publish_at',
        'admin_notified_at',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'ai_generation_metadata',
        'ai_image_enabled',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'auto_publish_at' => 'datetime',
            'admin_notified_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'ai_generation_metadata' => 'array',
            'ai_image_enabled' => 'boolean',
            'view_count' => 'integer',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Article $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }

            // Ensure unique slug
            $originalSlug = $article->slug;
            $count = 1;
            while (static::withTrashed()->where('slug', $article->slug)->exists()) {
                $article->slug = "{$originalSlug}-{$count}";
                $count++;
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where('published_at', '<=', now());
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function getReadingTimeAttribute(): int
    {
        $wordCount = str_word_count(strip_tags($this->content));

        return max(1, (int) ceil($wordCount / 200));
    }
}
