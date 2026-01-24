<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArticleGenerationService
{
    private ?string $apiKey;

    private string $model;

    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key') ?: null;
        $this->model = config('services.openai.model', 'gpt-4o');
        $this->baseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Generate an SEO-optimized article for CoreLink.
     *
     * @return array{success: bool, article?: array, metadata?: array, error?: string}
     */
    public function generateArticle(string $categoryName, string $promptGuidance = ''): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'OpenAI API key not configured',
            ];
        }

        $systemPrompt = $this->buildSystemPrompt();
        $userPrompt = $this->buildUserPrompt($categoryName, $promptGuidance);

        $startTime = microtime(true);

        try {
            $result = $this->callOpenAI($systemPrompt, $userPrompt);

            if (! $result['success']) {
                return $result;
            }

            $content = $result['content'];
            $usage = $result['usage'];

            // Clean up content - strip markdown code blocks if present (older models might add them)
            $content = trim($content);
            if (str_starts_with($content, '```json')) {
                $content = preg_replace('/^```json\s*/', '', $content);
                $content = preg_replace('/\s*```$/', '', $content);
            } elseif (str_starts_with($content, '```')) {
                $content = preg_replace('/^```\s*/', '', $content);
                $content = preg_replace('/\s*```$/', '', $content);
            }

            // Parse the JSON response
            $articleData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse article JSON', ['content' => $content]);

                return [
                    'success' => false,
                    'error' => 'Failed to parse generated article: '.json_last_error_msg(),
                ];
            }

            // Validate required fields
            $requiredFields = ['title', 'meta_description', 'content', 'suggested_slug'];
            foreach ($requiredFields as $field) {
                if (empty($articleData[$field])) {
                    return [
                        'success' => false,
                        'error' => "Generated article missing required field: {$field}",
                    ];
                }
            }

            $duration = microtime(true) - $startTime;

            return [
                'success' => true,
                'article' => $articleData,
                'metadata' => [
                    'model' => $this->model,
                    'prompt_tokens' => $usage['prompt_tokens'] ?? 0,
                    'completion_tokens' => $usage['completion_tokens'] ?? 0,
                    'total_tokens' => $usage['total_tokens'] ?? 0,
                    'duration_seconds' => round($duration, 2),
                    'category' => $categoryName,
                    'generated_at' => now()->toIso8601String(),
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Article generation failed', [
                'error' => $e->getMessage(),
                'category' => $categoryName,
            ]);

            return [
                'success' => false,
                'error' => 'Failed to generate article: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Generate an image prompt for the article.
     *
     * @return array{success: bool, prompt?: string, error?: string}
     */
    public function generateImagePrompt(string $title, string $excerpt): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'OpenAI API key not configured',
            ];
        }

        $systemPrompt = <<<'PROMPT'
You are an expert at creating DALL-E image prompts for blog article featured images.
Create professional, modern, and visually appealing image prompts that would work well as blog header images.
The images should be clean, not overly busy, and convey the topic in an abstract or conceptual way.
Avoid text in images. Focus on visual metaphors, technology imagery, and professional aesthetics.
Use blue and teal accent colors to match the CoreLink brand.
Return only the prompt text, nothing else.
PROMPT;

        $userPrompt = "Create a DALL-E prompt for a blog article featured image:\nTitle: {$title}\nExcerpt: {$excerpt}";

        try {
            $result = $this->callOpenAI($systemPrompt, $userPrompt, 'text', 500);

            if (! $result['success']) {
                return $result;
            }

            return [
                'success' => true,
                'prompt' => trim($result['content']),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to generate image prompt: '.$e->getMessage(),
            ];
        }
    }

    private function buildSystemPrompt(): string
    {
        return <<<'PROMPT'
You are an expert SEO content writer for CoreLink Development, a web development company that specializes in:
- Building custom web applications and SaaS platforms for small businesses
- Helping tradespeople and local service providers establish their online presence
- Creating AI-enhanced software solutions for business operations
- Digital marketing and SEO services for local businesses

Your target audience is:
- Small business owners looking for web solutions
- Tradespeople (plumbers, electricians, contractors, etc.) who need websites
- Local service providers wanting to grow their online presence
- Business owners interested in software to streamline operations

Write engaging, SEO-optimized blog articles that provide genuine value to readers while positioning CoreLink as a trusted partner. Your articles should:

1. Be informative, practical, and actionable
2. Include relevant keywords naturally (not stuffed)
3. Use a friendly, professional tone
4. Include tips that readers can implement immediately
5. Subtly showcase how professional web development can help (without being too promotional)
6. When mentioning "CoreLink" in the content, wrap it as a link: <a href="https://corelink.dev">CoreLink</a>

IMPORTANT - Content must be in clean HTML format using ONLY these tags:
- <h2>, <h3> for headings (never use <h1>, the title is separate)
- <p> for paragraphs
- <strong> or <b> for bold text
- <em> or <i> for italic text
- <ul> and <li> for unordered lists
- <ol> and <li> for ordered lists
- <a href="..."> for links
- <blockquote> for quotes

Include this EXACT placeholder where you want the featured image to appear (typically after the first 1-2 paragraphs):
{{FEATURED_IMAGE}}

This placeholder will be replaced with the actual AI-generated image. Position it where it makes sense visually - usually after an introductory section.

Return your response as a valid JSON object with this exact structure (output ONLY the JSON, no markdown code blocks or other text):
{
    "title": "SEO-optimized article title (50-60 characters ideal)",
    "meta_title": "SEO meta title for search results (can be same as title or slightly different, 50-60 characters)",
    "meta_description": "Compelling meta description for search results (150-160 characters)",
    "meta_keywords": "comma, separated, seo, keywords, relevant, to, article, topic",
    "excerpt": "A 2-3 sentence summary for article previews",
    "content": "Full article content in clean HTML format (800-1200 words)",
    "suggested_slug": "url-friendly-slug",
    "image_alt": "Descriptive alt text for the featured image"
}
PROMPT;
    }

    private function buildUserPrompt(string $categoryName, string $promptGuidance = ''): string
    {
        $prompt = "Write a blog article for the category: \"{$categoryName}\"";

        if (! empty($promptGuidance)) {
            $prompt .= "\n\nAdditional guidance: {$promptGuidance}";
        }

        $prompt .= "\n\nMake sure the article is unique, engaging, and provides real value to small business owners and tradespeople looking to improve their online presence and operations.";

        return $prompt;
    }

    /**
     * Check if the model supports JSON response format.
     */
    private function supportsJsonFormat(): bool
    {
        $jsonSupportedModels = [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-4-turbo-preview',
            'gpt-4-1106-preview',
            'gpt-3.5-turbo-1106',
            'gpt-3.5-turbo-0125',
        ];

        foreach ($jsonSupportedModels as $supported) {
            if (str_starts_with($this->model, $supported)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{success: bool, content?: string, usage?: array, error?: string}
     */
    private function callOpenAI(string $systemPrompt, string $userPrompt, string $responseFormat = 'json_object', int $maxTokens = 2500): array
    {
        $payload = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'max_tokens' => $maxTokens,
            'temperature' => 0.8,
        ];

        // Only add json_object format for models that support it
        if ($responseFormat === 'json_object' && $this->supportsJsonFormat()) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = Http::timeout(120)
            ->withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if (! $response->successful()) {
            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'OpenAI API error: '.$response->status(),
            ];
        }

        $data = $response->json();

        return [
            'success' => true,
            'content' => $data['choices'][0]['message']['content'] ?? '',
            'usage' => $data['usage'] ?? [],
        ];
    }
}
