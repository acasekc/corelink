<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleGenerationSettings;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    /**
     * Display a listing of articles (SPA view).
     */
    public function index(): View
    {
        return view('app');
    }

    /**
     * API: Get articles list data.
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'category_id', 'search']);
        $articles = $this->articleService->getAdminArticles($filters);
        $categories = ArticleCategory::active()->ordered()->get();
        $statistics = $this->articleService->getStatistics();

        return response()->json([
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $filters,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new article (SPA view).
     */
    public function create(): View
    {
        return view('app');
    }

    /**
     * API: Get data for create form.
     */
    public function apiCreate(): JsonResponse
    {
        $categories = ArticleCategory::active()->ordered()->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created article.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'meta_description' => 'nullable|string|max:160',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'article_category_id' => 'required|exists:article_categories,id',
            'featured_image' => 'nullable|string|max:255',
            'featured_image_alt' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,pending_review,scheduled,published',
            'auto_publish_at' => 'nullable|date|after:now',
        ]);

        $article = $this->articleService->create($validated);

        return response()->json([
            'message' => 'Article created successfully',
            'article' => $article->load('category'),
        ], 201);
    }

    /**
     * Display the specified article (SPA view).
     */
    public function show(Article $article): View
    {
        return view('app');
    }

    /**
     * API: Get article data.
     */
    public function apiShow(Article $article): JsonResponse
    {
        $article->load(['category', 'reviewer']);

        return response()->json([
            'article' => $article,
        ]);
    }

    /**
     * Show the form for editing the specified article (SPA view).
     */
    public function edit(Article $article): View
    {
        return view('app');
    }

    /**
     * API: Get data for edit form.
     */
    public function apiEdit(Article $article): JsonResponse
    {
        $article->load('category');
        $categories = ArticleCategory::active()->ordered()->get();

        return response()->json([
            'article' => $article,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified article.
     */
    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:articles,slug,'.$article->id,
            'meta_description' => 'nullable|string|max:160',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|required|string',
            'article_category_id' => 'sometimes|required|exists:article_categories,id',
            'featured_image' => 'nullable|string|max:255',
            'featured_image_alt' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,pending_review,scheduled,published,rejected',
            'auto_publish_at' => 'nullable|date',
        ]);

        $article = $this->articleService->update($article, $validated);

        return response()->json([
            'message' => 'Article updated successfully',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Remove the specified article.
     */
    public function destroy(Article $article): JsonResponse
    {
        $this->articleService->delete($article);

        return response()->json([
            'message' => 'Article deleted successfully',
        ]);
    }

    /**
     * Publish an article immediately.
     */
    public function publish(Article $article): JsonResponse
    {
        $article = $this->articleService->publish($article);

        return response()->json([
            'message' => 'Article published successfully',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Schedule an article for publication.
     */
    public function schedule(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'publish_at' => 'required|date|after:now',
        ]);

        $article = $this->articleService->schedule($article, new \DateTime($validated['publish_at']));

        return response()->json([
            'message' => 'Article scheduled successfully',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Submit article for review.
     */
    public function submitForReview(Article $article): JsonResponse
    {
        $article = $this->articleService->submitForReview($article);

        return response()->json([
            'message' => 'Article submitted for review',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Approve an article (admin only).
     */
    public function approve(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $article = $this->articleService->approve(
            $article,
            $request->user()->id,
            $validated['notes'] ?? null
        );

        return response()->json([
            'message' => 'Article approved and published',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Reject an article (admin only).
     */
    public function reject(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $article = $this->articleService->reject(
            $article,
            $request->user()->id,
            $validated['reason']
        );

        return response()->json([
            'message' => 'Article rejected',
            'article' => $article->load('category'),
        ]);
    }

    /**
     * Generate an article using AI.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:article_categories,id',
        ]);

        $category = ArticleCategory::findOrFail($validated['category_id']);
        $result = $this->articleService->generateArticle($category);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['error'],
            ], 422);
        }

        return response()->json([
            'message' => 'Article generated successfully',
            'article' => $result['article'],
        ], 201);
    }

    /**
     * Generate featured image for an article.
     */
    public function generateImage(Article $article): JsonResponse
    {
        $settings = ArticleGenerationSettings::getSettings();

        if (! $settings->dalle_enabled) {
            return response()->json([
                'message' => 'DALL-E image generation is disabled in settings',
            ], 422);
        }

        $success = $this->articleService->generateArticleImage($article);

        if (! $success) {
            return response()->json([
                'message' => 'Failed to generate image',
            ], 422);
        }

        return response()->json([
            'message' => 'Image generated successfully',
            'article' => $article->fresh(['category']),
        ]);
    }
}
