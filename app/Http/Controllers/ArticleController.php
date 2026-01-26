<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\ArticleService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService,
    ) {}

    /**
     * Get all articles (admin listing with filters).
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Article::class);

        $filters = [
            'status' => request('status'),
            'category_id' => request('category_id'),
            'search' => request('search'),
        ];

        $articles = $this->articleService->paginate(15, $filters);

        return response()->json([
            'data' => ArticleResource::collection($articles->items()),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'total' => $articles->total(),
                'per_page' => $articles->perPage(),
                'last_page' => $articles->lastPage(),
            ],
        ]);
    }

    /**
     * Create a new article.
     */
    public function store(StoreArticleRequest $request): JsonResponse
    {
        $this->authorize('create', Article::class);

        $article = $this->articleService->create($request->validated());

        return response()->json(['data' => new ArticleResource($article)], 201);
    }

    /**
     * Get a single article.
     */
    public function show(Article $article): JsonResponse
    {
        $this->authorize('view', $article);

        $article->loadMissing(['category', 'reviewer']);

        return response()->json(['data' => new ArticleResource($article)]);
    }

    /**
     * Update an article.
     */
    public function update(UpdateArticleRequest $request, Article $article): JsonResponse
    {
        $this->authorize('update', $article);

        $updated = $this->articleService->update($article, $request->validated());

        return response()->json(['data' => new ArticleResource($updated)]);
    }

    /**
     * Delete an article.
     */
    public function destroy(Article $article): JsonResponse
    {
        $this->authorize('delete', $article);

        $this->articleService->delete($article);

        return response()->json(null, 204);
    }

    /**
     * Publish an article immediately.
     */
    public function publish(Article $article): JsonResponse
    {
        $this->authorize('update', $article);

        $updated = $this->articleService->publish($article);

        return response()->json(['data' => new ArticleResource($updated)]);
    }

    /**
     * Schedule an article for publication.
     */
    public function schedule(Article $article): JsonResponse
    {
        $this->authorize('update', $article);

        $validated = request()->validate([
            'auto_publish_at' => 'required|date_format:Y-m-d\TH:i:s',
        ]);

        $updated = $this->articleService->schedule($article, Carbon::parse($validated['auto_publish_at']));

        return response()->json(['data' => new ArticleResource($updated)]);
    }
}
