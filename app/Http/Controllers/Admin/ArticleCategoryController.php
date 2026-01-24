<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ArticleCategoryController extends Controller
{
    /**
     * Display a listing of categories (SPA view).
     */
    public function index(): View
    {
        return view('app');
    }

    /**
     * API: Get categories list data.
     */
    public function apiIndex(): JsonResponse
    {
        $categories = ArticleCategory::withCount('articles')
            ->ordered()
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new category (SPA view).
     */
    public function create(): View
    {
        return view('app');
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories,name',
            'slug' => 'nullable|string|max:255|unique:article_categories,slug',
            'description' => 'nullable|string|max:500',
            'prompt_guidance' => 'nullable|string|max:2000',
            'image_prompt' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $category = ArticleCategory::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    /**
     * Display the specified category (SPA view).
     */
    public function show(ArticleCategory $category): View
    {
        return view('app');
    }

    /**
     * Show the form for editing the specified category (SPA view).
     */
    public function edit(ArticleCategory $category): View
    {
        return view('app');
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, ArticleCategory $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:article_categories,name,'.$category->id,
            'slug' => 'sometimes|nullable|string|max:255|unique:article_categories,slug,'.$category->id,
            'description' => 'nullable|string|max:500',
            'prompt_guidance' => 'nullable|string|max:2000',
            'image_prompt' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category->fresh(),
        ]);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(ArticleCategory $category): JsonResponse
    {
        // Check if category has articles
        if ($category->articles()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with associated articles',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Update category order.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:article_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['categories'] as $item) {
            ArticleCategory::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Categories reordered successfully',
        ]);
    }
}
