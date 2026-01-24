<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleGenerationSettings;
use App\Services\AI\ArticleGenerationService;
use App\Services\AI\ImageGenerationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ArticleService
{
    public function __construct(
        private ArticleGenerationService $generationService,
        private ImageGenerationService $imageService
    ) {}

    /**
     * Get paginated articles for admin listing.
     */
    public function getAdminArticles(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Article::with(['category', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('article_category_id', $filters['category_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get published articles for public blog.
     */
    public function getPublishedArticles(int $perPage = 10): LengthAwarePaginator
    {
        return Article::with('category')
            ->published()
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get published articles by category.
     */
    public function getArticlesByCategory(ArticleCategory $category, int $perPage = 10): LengthAwarePaginator
    {
        return Article::with('category')
            ->published()
            ->where('article_category_id', $category->id)
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get recent articles for sidebar/widgets.
     */
    public function getRecentArticles(int $limit = 5): Collection
    {
        return Cache::remember('blog_recent_articles', 300, function () use ($limit) {
            return Article::with('category')
                ->published()
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get featured articles (most viewed).
     */
    public function getFeaturedArticles(int $limit = 4): Collection
    {
        return Cache::remember('blog_featured_articles', 600, function () use ($limit) {
            return Article::with('category')
                ->published()
                ->orderBy('view_count', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get a published article by slug and increment view count.
     */
    public function getPublishedArticle(string $slug): ?Article
    {
        $article = Article::with('category')
            ->published()
            ->where('slug', $slug)
            ->first();

        if ($article) {
            $article->incrementViewCount();
        }

        return $article;
    }

    /**
     * Create a new article manually.
     */
    public function create(array $data): Article
    {
        return Article::create($data);
    }

    /**
     * Update an article.
     */
    public function update(Article $article, array $data): Article
    {
        $article->update($data);

        return $article->fresh();
    }

    /**
     * Delete an article (soft delete).
     */
    public function delete(Article $article): bool
    {
        return $article->delete();
    }

    /**
     * Publish an article immediately.
     */
    public function publish(Article $article): Article
    {
        $article->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->clearCache();

        return $article->fresh();
    }

    /**
     * Schedule an article for publication.
     */
    public function schedule(Article $article, \DateTimeInterface $publishAt): Article
    {
        $article->update([
            'status' => 'scheduled',
            'auto_publish_at' => $publishAt,
        ]);

        return $article->fresh();
    }

    /**
     * Submit article for review.
     */
    public function submitForReview(Article $article): Article
    {
        $article->update(['status' => 'pending_review']);

        return $article->fresh();
    }

    /**
     * Approve and publish an article.
     */
    public function approve(Article $article, int $reviewerId, ?string $notes = null): Article
    {
        $article->update([
            'status' => 'published',
            'published_at' => now(),
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        $this->clearCache();

        return $article->fresh();
    }

    /**
     * Reject an article.
     */
    public function reject(Article $article, int $reviewerId, string $reason): Article
    {
        $article->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_notes' => $reason,
        ]);

        return $article->fresh();
    }

    /**
     * Generate a new article using AI.
     *
     * @return array{success: bool, article?: Article, error?: string}
     */
    public function generateArticle(ArticleCategory $category): array
    {
        $settings = ArticleGenerationSettings::get();

        if (! $settings->is_enabled) {
            return [
                'success' => false,
                'error' => 'AI article generation is disabled',
            ];
        }

        // Check rate limits
        if (! $this->canGenerateArticle($settings)) {
            return [
                'success' => false,
                'error' => 'Daily or weekly article generation limit reached',
            ];
        }

        // Generate the article content
        $result = $this->generationService->generateArticle(
            $category->name,
            $category->prompt_guidance
        );

        if (! $result['success']) {
            return $result;
        }

        $articleData = $result['article'];
        $metadata = $result['metadata'];

        // Truncate meta_description to 155 chars for SEO (Google's limit)
        $metaDescription = $articleData['meta_description'] ?? '';
        if (strlen($metaDescription) > 155) {
            $metaDescription = substr($metaDescription, 0, 152).'...';
        }

        // Create the article
        $article = Article::create([
            'title' => $articleData['title'],
            'slug' => $articleData['suggested_slug'],
            'meta_title' => $articleData['meta_title'] ?? null,
            'meta_description' => $metaDescription,
            'meta_keywords' => $articleData['meta_keywords'] ?? null,
            'excerpt' => $articleData['excerpt'],
            'content' => $articleData['content'],
            'featured_image_alt' => $articleData['image_alt'] ?? null,
            'article_category_id' => $category->id,
            'status' => 'pending_review',
            'ai_generation_metadata' => $metadata,
            'ai_image_enabled' => $settings->dalle_enabled,
        ]);

        // Generate image if enabled
        if ($settings->dalle_enabled && $this->imageService->isConfigured()) {
            $this->generateArticleImage($article, $articleData);
        }

        // Handle auto-publish if enabled
        if ($settings->auto_publish_enabled && $settings->auto_publish_hours > 0) {
            $article->update([
                'status' => 'scheduled',
                'auto_publish_at' => now()->addHours($settings->auto_publish_hours),
            ]);
        }

        Log::info('AI article generated', [
            'article_id' => $article->id,
            'category' => $category->name,
            'tokens_used' => $metadata['total_tokens'] ?? 0,
        ]);

        return [
            'success' => true,
            'article' => $article->fresh(['category']),
        ];
    }

    /**
     * Generate featured image for an article and embed it in the content.
     */
    public function generateArticleImage(Article $article, ?array $articleData = null): bool
    {
        // First generate an image prompt
        $excerpt = $articleData['excerpt'] ?? $article->excerpt ?? '';
        $promptResult = $this->generationService->generateImagePrompt($article->title, $excerpt);

        if (! $promptResult['success']) {
            Log::warning('Failed to generate image prompt', [
                'article_id' => $article->id,
                'error' => $promptResult['error'],
            ]);

            return false;
        }

        // Generate the image
        $imageResult = $this->imageService->generateImage(
            $promptResult['prompt'],
            $article->slug
        );

        if (! $imageResult['success']) {
            Log::warning('Failed to generate article image', [
                'article_id' => $article->id,
                'error' => $imageResult['error'],
            ]);

            return false;
        }

        $imagePath = $imageResult['path'];
        $imageAlt = $article->featured_image_alt ?? $article->title;

        // Build the image HTML tag
        $imageHtml = sprintf(
            '<figure class="my-8"><img src="%s" alt="%s" class="w-full rounded-lg shadow-lg" /><figcaption class="text-center text-sm text-slate-500 mt-2">%s</figcaption></figure>',
            e($imagePath),
            e($imageAlt),
            e($imageAlt)
        );

        // Replace the placeholder in content, or prepend if no placeholder exists
        $content = $article->content;
        if (str_contains($content, '{{FEATURED_IMAGE}}')) {
            $content = str_replace('{{FEATURED_IMAGE}}', $imageHtml, $content);
        }

        // Update article with image path and updated content
        $article->update([
            'featured_image' => $imagePath,
            'content' => $content,
        ]);

        return true;
    }

    /**
     * Check if we can generate another article based on rate limits.
     */
    private function canGenerateArticle(ArticleGenerationSettings $settings): bool
    {
        // Check daily limit
        $dailyCount = Article::where('created_at', '>=', now()->startOfDay())
            ->whereNotNull('ai_generation_metadata')
            ->count();

        if ($dailyCount >= $settings->max_articles_per_day) {
            return false;
        }

        // Check weekly limit
        $weeklyCount = Article::where('created_at', '>=', now()->startOfWeek())
            ->whereNotNull('ai_generation_metadata')
            ->count();

        if ($weeklyCount >= $settings->max_articles_per_week) {
            return false;
        }

        return true;
    }

    /**
     * Publish scheduled articles that are due.
     */
    public function publishScheduledArticles(): int
    {
        $articles = Article::scheduled()
            ->where('auto_publish_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($articles as $article) {
            $article->update([
                'status' => 'published',
                'published_at' => now(),
            ]);
            $count++;
        }

        if ($count > 0) {
            $this->clearCache();
        }

        return $count;
    }

    /**
     * Get dashboard statistics.
     */
    public function getStatistics(): array
    {
        return Cache::remember('blog_statistics', 300, function () {
            return [
                'total_articles' => Article::count(),
                'published_articles' => Article::published()->count(),
                'pending_review' => Article::pendingReview()->count(),
                'scheduled' => Article::scheduled()->count(),
                'drafts' => Article::draft()->count(),
                'total_views' => Article::sum('view_count'),
                'categories_count' => ArticleCategory::active()->count(),
                'ai_generated_today' => Article::where('created_at', '>=', now()->startOfDay())
                    ->whereNotNull('ai_generation_metadata')
                    ->count(),
                'ai_generated_this_week' => Article::where('created_at', '>=', now()->startOfWeek())
                    ->whereNotNull('ai_generation_metadata')
                    ->count(),
            ];
        });
    }

    /**
     * Clear all blog caches.
     */
    public function clearCache(): void
    {
        Cache::forget('blog_recent_articles');
        Cache::forget('blog_featured_articles');
        Cache::forget('blog_statistics');
        Cache::forget('blog_categories');
    }
}
