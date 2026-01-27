<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\ArticleService;
use App\Services\SitemapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\View\View;

class BlogController extends Controller
{
    public function __construct(
        private ArticleService $articleService,
        private SitemapService $sitemapService
    ) {}

    /**
     * Display blog index (SPA view).
     */
    public function index(): View
    {
        return view('app', [
            'ogMeta' => [
                'title' => 'Blog',
                'description' => 'Insights on web development, AI, Laravel, React, and building modern applications. Tips and tutorials from the CoreLink Development team.',
                'url' => url('/blog'),
            ],
        ]);
    }

    /**
     * Display articles by category (SPA view).
     */
    public function category(string $slug): View
    {
        $category = ArticleCategory::where('slug', $slug)->first();

        return view('app', [
            'ogMeta' => $category ? [
                'title' => $category->name.' Articles',
                'description' => $category->description ?? "Browse our {$category->name} articles. Insights and tutorials from CoreLink Development.",
                'url' => url("/blog/category/{$slug}"),
            ] : null,
        ]);
    }

    /**
     * Display a single article (SPA view).
     */
    public function show(string $slug): View
    {
        $article = Article::where('slug', $slug)
            ->published()
            ->with('category')
            ->first();

        return view('app', [
            'ogMeta' => $article ? [
                'title' => $article->meta_title ?? $article->title,
                'description' => $article->meta_description ?? $article->excerpt,
                'image' => $article->featured_image,
                'url' => url("/blog/{$article->slug}"),
                'type' => 'article',
            ] : null,
        ]);
    }

    /**
     * API: Get blog index data.
     */
    public function apiIndex(): JsonResponse
    {
        $articles = $this->articleService->getPublishedArticles(12);
        $categories = ArticleCategory::active()->ordered()->withCount('articles')->get();
        $featuredArticles = $this->articleService->getFeaturedArticles(4);

        return response()->json([
            'articles' => $articles,
            'categories' => $categories,
            'featuredArticles' => $featuredArticles,
        ]);
    }

    /**
     * API: Get all categories.
     */
    public function apiCategories(): JsonResponse
    {
        $categories = ArticleCategory::active()
            ->ordered()
            ->withCount('articles')
            ->get();

        return response()->json($categories);
    }

    /**
     * API: Get articles by category.
     */
    public function apiCategory(string $slug): JsonResponse
    {
        $category = ArticleCategory::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $articles = $this->articleService->getArticlesByCategory($category, 12);
        $categories = ArticleCategory::active()->ordered()->withCount('articles')->get();

        return response()->json([
            'category' => $category,
            'articles' => $articles,
            'categories' => $categories,
        ]);
    }

    /**
     * API: Get single article.
     */
    public function apiShow(string $slug): JsonResponse
    {
        $article = $this->articleService->getPublishedArticle($slug);

        if (! $article) {
            return response()->json(['error' => 'Article not found'], 404);
        }

        $recentArticles = $this->articleService->getRecentArticles(5);
        $categories = ArticleCategory::active()->ordered()->withCount('articles')->get();

        // Get related articles from same category
        $relatedArticles = $article->category
            ? $article->category->articles()
                ->published()
                ->where('id', '!=', $article->id)
                ->orderBy('published_at', 'desc')
                ->limit(3)
                ->get()
            : collect();

        return response()->json([
            'article' => $article,
            'recentArticles' => $recentArticles,
            'relatedArticles' => $relatedArticles,
            'categories' => $categories,
        ]);
    }

    /**
     * Generate and return sitemap XML.
     */
    public function sitemap(): Response
    {
        $xml = $this->sitemapService->generate();

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
