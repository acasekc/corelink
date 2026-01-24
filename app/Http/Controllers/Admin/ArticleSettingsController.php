<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticleGenerationSettings;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ArticleSettingsController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    /**
     * Display article generation settings (SPA view).
     */
    public function index(Request $request): View|JsonResponse
    {
        // Return JSON for API requests
        if ($request->wantsJson()) {
            $settings = ArticleGenerationSettings::get();
            $statistics = $this->articleService->getStatistics();

            return response()->json([
                'settings' => $settings,
                'statistics' => $statistics,
            ]);
        }

        return view('app');
    }

    /**
     * Update article generation settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_enabled' => 'boolean',
            'dalle_enabled' => 'boolean',
            'auto_publish_enabled' => 'boolean',
            'auto_publish_hours' => 'integer|min:0|max:720',
            'max_articles_per_day' => 'integer|min:1|max:50',
            'max_articles_per_week' => 'integer|min:1|max:200',
            'admin_notification_email' => 'nullable|email|max:255',
            'openai_model' => 'string|max:50',
            'dalle_model' => 'string|max:50',
            'dalle_size' => 'string|max:20',
            'dalle_quality' => 'string|in:standard,hd',
            'system_prompt' => 'nullable|string|max:5000',
        ]);

        $settings = ArticleGenerationSettings::get();
        $settings->update($validated);

        $this->articleService->clearCache();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings->fresh(),
        ]);
    }

    /**
     * Test OpenAI connection.
     */
    public function testConnection(): JsonResponse
    {
        $apiKey = config('services.openai.api_key');

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'OpenAI API key not configured',
            ]);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer '.$apiKey,
                ])
                ->get('https://api.openai.com/v1/models');

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'OpenAI connection successful',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'OpenAI API returned: '.$response->status(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: '.$e->getMessage(),
            ]);
        }
    }
}
