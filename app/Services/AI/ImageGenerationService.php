<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageGenerationService
{
    private ?string $apiKey;

    private string $model;

    private string $quality;

    private string $baseUrl;

    private string $storageDisk;

    /**
     * Available DALL-E 3 image sizes for variety.
     */
    private array $sizes = [
        '1024x1024',   // Square
        '1792x1024',   // Landscape wide
        '1024x1792',   // Portrait tall
    ];

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key') ?: null;
        $this->model = config('services.openai.dalle_model', 'dall-e-3');
        $this->quality = config('services.openai.dalle_quality', 'standard');
        $this->baseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');
        $this->storageDisk = config('filesystems.default', 'public');

        // Use s3 if configured, otherwise fall back to public
        if ($this->storageDisk === 'local') {
            $this->storageDisk = 'public';
        }
    }

    /**
     * Get a random image size for variety.
     */
    private function getRandomSize(): string
    {
        return $this->sizes[array_rand($this->sizes)];
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Generate an image using DALL-E.
     *
     * @return array{success: bool, url?: string, path?: string, error?: string}
     */
    public function generateImage(string $prompt, ?string $articleSlug = null): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'OpenAI API key not configured',
            ];
        }

        try {
            $size = $this->getRandomSize();

            $response = Http::timeout(120)
                ->withHeaders([
                    'Authorization' => 'Bearer '.$this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/images/generations", [
                    'model' => $this->model,
                    'prompt' => $prompt,
                    'n' => 1,
                    'size' => $size,
                    'quality' => $this->quality,
                    'response_format' => 'url',
                ]);

            if (! $response->successful()) {
                Log::error('DALL-E API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'error' => 'DALL-E API error: '.$response->status(),
                ];
            }

            $data = $response->json();
            $imageUrl = $data['data'][0]['url'] ?? null;

            if (! $imageUrl) {
                return [
                    'success' => false,
                    'error' => 'No image URL returned from DALL-E',
                ];
            }

            // Download and save the image locally
            $savedPath = $this->saveImage($imageUrl, $articleSlug);

            if (! $savedPath) {
                Log::error('Image generated but failed to save locally', [
                    'url' => $imageUrl,
                    'disk' => $this->storageDisk,
                ]);

                return [
                    'success' => false,
                    'url' => $imageUrl,
                    'error' => 'Image generated but failed to save to storage',
                ];
            }

            return [
                'success' => true,
                'url' => $imageUrl,
                'path' => $savedPath,
            ];
        } catch (\Exception $e) {
            Log::error('Image generation failed', [
                'error' => $e->getMessage(),
                'prompt' => $prompt,
            ]);

            return [
                'success' => false,
                'error' => 'Failed to generate image: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Download and save an image from URL, converting to WebP and resizing to half dimensions.
     */
    private function saveImage(string $url, ?string $articleSlug = null): ?string
    {
        try {
            Log::info('Attempting to save generated image', [
                'url' => substr($url, 0, 100).'...',
                'disk' => $this->storageDisk,
                'slug' => $articleSlug,
            ]);

            $imageContent = Http::timeout(60)->get($url)->body();

            if (empty($imageContent)) {
                Log::error('Downloaded image content is empty');

                return null;
            }

            // Convert to WebP at half size
            $webpContent = $this->convertToWebp($imageContent);

            if (! $webpContent) {
                Log::warning('WebP conversion failed, saving original PNG');
                $webpContent = $imageContent;
                $extension = 'png';
            } else {
                $extension = 'webp';
            }

            $filename = $articleSlug
                ? Str::slug($articleSlug).'-'.time().'.'.$extension
                : 'article-'.Str::random(10).'-'.time().'.'.$extension;

            $path = "articles/images/{$filename}";

            $saved = Storage::disk($this->storageDisk)->put($path, $webpContent, 'public');

            if (! $saved) {
                Log::error('Storage::put returned false', ['path' => $path]);

                return null;
            }

            // Return the full URL for the stored file
            $fullUrl = Storage::disk($this->storageDisk)->url($path);

            Log::info('Image saved successfully', [
                'path' => $path,
                'url' => $fullUrl,
                'format' => $extension,
                'original_size' => strlen($imageContent),
                'saved_size' => strlen($webpContent),
            ]);

            return $fullUrl;
        } catch (\Exception $e) {
            Log::error('Failed to save generated image', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $url,
                'disk' => $this->storageDisk,
            ]);

            return null;
        }
    }

    /**
     * Convert image content to WebP at half dimensions.
     */
    private function convertToWebp(string $imageContent): ?string
    {
        try {
            $source = imagecreatefromstring($imageContent);

            if ($source === false) {
                return null;
            }

            $originalWidth = imagesx($source);
            $originalHeight = imagesy($source);
            $newWidth = (int) ($originalWidth / 2);
            $newHeight = (int) ($originalHeight / 2);

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            if ($resized === false) {
                imagedestroy($source);

                return null;
            }

            // Preserve alpha/transparency
            imagealphablending($resized, false);
            imagesavealpha($resized, true);

            imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

            ob_start();
            imagewebp($resized, null, 82);
            $webpContent = ob_get_clean();

            imagedestroy($source);
            imagedestroy($resized);

            return $webpContent ?: null;
        } catch (\Exception $e) {
            Log::error('WebP conversion failed', ['error' => $e->getMessage()]);

            return null;
        }
    }
}
