<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\CaseStudy;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SitemapService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('app.url'), '/');
    }

    /**
     * Generate the complete sitemap XML.
     */
    public function generate(): string
    {
        return Cache::remember('sitemap_xml', 3600, function () {
            return $this->buildSitemap();
        });
    }

    /**
     * Regenerate sitemap and ping search engines.
     */
    public function regenerate(): string
    {
        Cache::forget('sitemap_xml');
        $sitemap = $this->generate();

        // Ping search engines asynchronously in production
        if (app()->environment('production')) {
            $this->pingSearchEngines();
        }

        return $sitemap;
    }

    /**
     * Build the sitemap XML content.
     */
    private function buildSitemap(): string
    {
        $urls = collect();

        // Static pages (high priority)
        $urls->push($this->urlEntry($this->baseUrl, now(), 'daily', '1.0'));
        $urls->push($this->urlEntry("{$this->baseUrl}/projects", now()->subWeek(), 'weekly', '0.9'));
        $urls->push($this->urlEntry("{$this->baseUrl}/process", now()->subMonth(), 'monthly', '0.8'));
        $urls->push($this->urlEntry("{$this->baseUrl}/about", now()->subMonth(), 'monthly', '0.8'));
        $urls->push($this->urlEntry("{$this->baseUrl}/contact", now()->subMonth(), 'monthly', '0.7'));
        $urls->push($this->urlEntry("{$this->baseUrl}/case-studies", now()->subWeek(), 'weekly', '0.9'));
        $urls->push($this->urlEntry("{$this->baseUrl}/blog", now(), 'daily', '0.9'));
        $urls->push($this->urlEntry("{$this->baseUrl}/terms", now()->subYear(), 'yearly', '0.3'));
        $urls->push($this->urlEntry("{$this->baseUrl}/privacy", now()->subYear(), 'yearly', '0.3'));

        // Case Studies (individual pages)
        $caseStudies = CaseStudy::where('is_published', true)
            ->orderBy('order')
            ->get();

        foreach ($caseStudies as $caseStudy) {
            $urls->push($this->urlEntry(
                "{$this->baseUrl}/case-studies/{$caseStudy->slug}",
                $caseStudy->updated_at,
                'monthly',
                '0.8'
            ));
        }

        // Blog category pages
        $categories = ArticleCategory::active()->get();
        foreach ($categories as $category) {
            $urls->push($this->urlEntry(
                "{$this->baseUrl}/blog/category/{$category->slug}",
                $category->updated_at,
                'weekly',
                '0.7'
            ));
        }

        // Blog articles
        $articles = Article::published()
            ->orderBy('published_at', 'desc')
            ->get();

        foreach ($articles as $article) {
            $urls->push($this->urlEntry(
                "{$this->baseUrl}/blog/{$article->slug}",
                $article->updated_at,
                'monthly',
                '0.8'
            ));
        }

        return $this->wrapUrlset($urls->implode("\n"));
    }

    /**
     * Create a URL entry for the sitemap.
     */
    private function urlEntry(string $url, \DateTimeInterface $lastmod, string $changefreq, string $priority): string
    {
        $lastmodStr = $lastmod->format('Y-m-d');

        return <<<XML
  <url>
    <loc>{$url}</loc>
    <lastmod>{$lastmodStr}</lastmod>
    <changefreq>{$changefreq}</changefreq>
    <priority>{$priority}</priority>
  </url>
XML;
    }

    /**
     * Wrap URL entries in the urlset XML.
     */
    private function wrapUrlset(string $urls): string
    {
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
{$urls}
</urlset>
XML;
    }

    /**
     * Ping search engines about the sitemap.
     */
    public function pingSearchEngines(): void
    {
        $sitemapUrl = urlencode("{$this->baseUrl}/sitemap.xml");

        $engines = [
            'Google' => "https://www.google.com/ping?sitemap={$sitemapUrl}",
            'Bing' => "https://www.bing.com/ping?sitemap={$sitemapUrl}",
        ];

        foreach ($engines as $name => $url) {
            try {
                $response = Http::timeout(10)->get($url);
                Log::info("Sitemap ping to {$name}", [
                    'status' => $response->status(),
                    'success' => $response->successful(),
                ]);
            } catch (\Exception $e) {
                Log::warning("Failed to ping {$name} sitemap", [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Get sitemap statistics.
     */
    public function getStats(): array
    {
        $staticPages = 9; // home, projects, process, about, contact, case-studies, blog, terms, privacy

        return [
            'total_urls' => $staticPages
                + ArticleCategory::active()->count()
                + Article::published()->count()
                + CaseStudy::where('is_published', true)->count(),
            'articles' => Article::published()->count(),
            'categories' => ArticleCategory::active()->count(),
            'case_studies' => CaseStudy::where('is_published', true)->count(),
            'static_pages' => $staticPages,
        ];
    }
}
