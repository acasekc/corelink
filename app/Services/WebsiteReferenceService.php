<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WebsiteReferenceService
{
    private const ALLOWED_SOURCE_TYPES = [
        'current_site',
        'reference_example',
        'competitor',
        'feature_reference',
        'design_reference',
        'conversation_reference',
    ];

    /**
     * Prepare startup references supplied when a discovery session is created.
     *
     * @param  array<int, mixed>  $references
     * @param  array<int, mixed>  $referenceUrls
     * @return array{current_website_url: string|null, reference_urls: array<int, string>, references: array<int, array{url: string, source_type: string}>, invalid: array<int, string>}
     */
    public function prepareSessionReferences(?string $currentWebsiteUrl, array $references = [], array $referenceUrls = []): array
    {
        $preparedReferences = [];
        $invalid = [];
        $normalizedCurrentWebsiteUrl = null;
        $normalizedReferenceUrls = [];

        if (is_string($currentWebsiteUrl) && trim($currentWebsiteUrl) !== '') {
            $normalizedCurrentWebsiteUrl = $this->normalizeUrl($currentWebsiteUrl);

            if ($normalizedCurrentWebsiteUrl === null) {
                $invalid[] = 'Current website URL is invalid or not allowed.';
            } else {
                $preparedReferences[] = [
                    'url' => $normalizedCurrentWebsiteUrl,
                    'source_type' => 'current_site',
                ];
            }
        }

        foreach ($references as $reference) {
            if (! is_array($reference)) {
                continue;
            }

            $referenceUrl = $reference['url'] ?? null;

            if (! is_string($referenceUrl) || trim($referenceUrl) === '') {
                continue;
            }

            $normalizedReferenceUrl = $this->normalizeUrl($referenceUrl);

            if ($normalizedReferenceUrl === null) {
                $invalid[] = sprintf('Reference URL "%s" is invalid or not allowed.', trim($referenceUrl));

                continue;
            }

            if ($normalizedReferenceUrl === $normalizedCurrentWebsiteUrl || in_array($normalizedReferenceUrl, $normalizedReferenceUrls, true)) {
                continue;
            }

            $normalizedReferenceUrls[] = $normalizedReferenceUrl;
            $preparedReferences[] = [
                'url' => $normalizedReferenceUrl,
                'source_type' => $this->normalizeSourceType($reference['type'] ?? $reference['source_type'] ?? null),
            ];
        }

        foreach ($referenceUrls as $referenceUrl) {
            if (! is_string($referenceUrl) || trim($referenceUrl) === '') {
                continue;
            }

            $normalizedReferenceUrl = $this->normalizeUrl($referenceUrl);

            if ($normalizedReferenceUrl === null) {
                $invalid[] = sprintf('Reference URL "%s" is invalid or not allowed.', trim($referenceUrl));

                continue;
            }

            if ($normalizedReferenceUrl === $normalizedCurrentWebsiteUrl || in_array($normalizedReferenceUrl, $normalizedReferenceUrls, true)) {
                continue;
            }

            $normalizedReferenceUrls[] = $normalizedReferenceUrl;
            $preparedReferences[] = [
                'url' => $normalizedReferenceUrl,
                'source_type' => 'reference_example',
            ];
        }

        return [
            'current_website_url' => $normalizedCurrentWebsiteUrl,
            'reference_urls' => $normalizedReferenceUrls,
            'references' => $preparedReferences,
            'invalid' => $invalid,
        ];
    }

    /**
     * Extract reference URLs from a freeform user message.
     *
     * @param  array<int, mixed>  $existingSummaries
     * @return array<int, array{url: string, source_type: string}>
     */
    public function extractReferencesFromText(string $text, array $existingSummaries = []): array
    {
        preg_match_all('/(?:https?:\/\/[^\s<>"]+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"]*)?)/i', $text, $matches);

        $existingUrls = collect($existingSummaries)
            ->pluck('url')
            ->filter(fn ($url) => is_string($url) && $url !== '')
            ->all();

        $references = [];

        foreach ($matches[0] ?? [] as $candidateUrl) {
            $normalizedUrl = $this->normalizeUrl($candidateUrl);

            if ($normalizedUrl === null || in_array($normalizedUrl, $existingUrls, true)) {
                continue;
            }

            $references[] = [
                'url' => $normalizedUrl,
                'source_type' => $this->inferSourceTypeFromText($text),
            ];

            $existingUrls[] = $normalizedUrl;
        }

        return $references;
    }

    /**
     * Analyze external references safely and return compact summaries.
     *
     * @param  array<int, array{url: string, source_type: string}>  $references
     * @return array<int, array<string, mixed>>
     */
    public function analyzeReferences(array $references): array
    {
        $summaries = [];

        foreach ($references as $reference) {
            $url = $reference['url'];
            $sourceType = $reference['source_type'];

            try {
                $response = Http::timeout(10)
                    ->withHeaders([
                        'User-Agent' => 'Corelink Discovery Bot/1.0',
                        'Accept' => 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
                    ])
                    ->get($url);

                if ($response->failed()) {
                    $summaries[] = $this->buildUnavailableSummary($url, $sourceType, 'The page could not be fetched successfully.');

                    continue;
                }

                $contentType = strtolower((string) $response->header('Content-Type', ''));

                if (! str_contains($contentType, 'text/html') && ! str_contains($contentType, 'application/xhtml+xml')) {
                    $summaries[] = $this->buildUnavailableSummary($url, $sourceType, 'The URL did not return an HTML page that could be analyzed.');

                    continue;
                }

                $summaries[] = $this->buildAnalyzedSummary($url, $sourceType, $response->body());
            } catch (\Throwable) {
                $summaries[] = $this->buildUnavailableSummary($url, $sourceType, 'The page could not be analyzed automatically.');
            }
        }

        return $summaries;
    }

    /**
     * Merge summaries while keeping URL uniqueness stable.
     *
     * @param  array<int, array<string, mixed>>  $existingSummaries
     * @param  array<int, array<string, mixed>>  $newSummaries
     * @return array<int, array<string, mixed>>
     */
    public function mergeReferenceSummaries(array $existingSummaries, array $newSummaries): array
    {
        $merged = [];

        foreach (array_merge($existingSummaries, $newSummaries) as $summary) {
            $url = $summary['url'] ?? null;

            if (! is_string($url) || $url === '') {
                continue;
            }

            $merged[$url] = $summary;
        }

        return array_values($merged);
    }

    private function normalizeUrl(string $candidateUrl): ?string
    {
        $normalizedUrl = trim($candidateUrl);
        $normalizedUrl = trim($normalizedUrl, " \t\n\r\0\x0B,.;:!?()[]{}<>");

        if ($normalizedUrl === '') {
            return null;
        }

        if (! preg_match('/^https?:\/\//i', $normalizedUrl)) {
            $normalizedUrl = 'https://'.$normalizedUrl;
        }

        if (! filter_var($normalizedUrl, FILTER_VALIDATE_URL)) {
            return null;
        }

        $parts = parse_url($normalizedUrl);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return null;
        }

        if ($host === 'localhost' || Str::endsWith($host, ['.local', '.internal', '.lan'])) {
            return null;
        }

        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            $flags = FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;

            if (! filter_var($host, FILTER_VALIDATE_IP, $flags)) {
                return null;
            }
        }

        return $normalizedUrl;
    }

    private function normalizeSourceType(mixed $sourceType): string
    {
        if (! is_string($sourceType) || trim($sourceType) === '') {
            return 'reference_example';
        }

        $normalizedSourceType = strtolower(trim($sourceType));

        return in_array($normalizedSourceType, self::ALLOWED_SOURCE_TYPES, true)
            ? $normalizedSourceType
            : 'reference_example';
    }

    private function inferSourceTypeFromText(string $text): string
    {
        $normalizedText = strtolower($text);

        if (Str::contains($normalizedText, ['current site', 'current website', 'our site', 'our website', 'existing site', 'existing website'])) {
            return 'current_site';
        }

        if (Str::contains($normalizedText, ['competitor', 'competing', 'alternative', 'other company'])) {
            return 'competitor';
        }

        if (Str::contains($normalizedText, ['design', 'look and feel', 'style', 'branding', 'visual'])) {
            return 'design_reference';
        }

        if (Str::contains($normalizedText, ['feature', 'workflow', 'flow', 'booking', 'checkout', 'dashboard'])) {
            return 'feature_reference';
        }

        return 'conversation_reference';
    }

    /**
     * @return array<string, mixed>
     */
    private function buildAnalyzedSummary(string $url, string $sourceType, string $html): array
    {
        $title = $this->firstTextForXPath($html, '//title');
        $metaDescription = $this->firstMetaDescription($html);
        $headings = $this->textsForXPath($html, '//h1 | //h2', 6);
        $navItems = $this->textsForXPath($html, '//nav//a | //nav//button', 8);
        $bodySnippet = $this->bodySnippet($html);
        $observedPatterns = $this->detectObservedPatterns($title, $metaDescription, $headings, $navItems, $bodySnippet);

        return [
            'url' => $url,
            'source_type' => $sourceType,
            'status' => 'analyzed',
            'title' => $title,
            'meta_description' => $metaDescription,
            'headings' => $headings,
            'nav_items' => $navItems,
            'observed_patterns' => $observedPatterns,
            'summary' => $this->buildSummaryText($title, $metaDescription, $headings, $navItems, $observedPatterns, $bodySnippet),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildUnavailableSummary(string $url, string $sourceType, string $reason): array
    {
        return [
            'url' => $url,
            'source_type' => $sourceType,
            'status' => 'unavailable',
            'title' => null,
            'meta_description' => null,
            'headings' => [],
            'nav_items' => [],
            'observed_patterns' => [],
            'summary' => $reason,
        ];
    }

    private function firstTextForXPath(string $html, string $expression): ?string
    {
        $texts = $this->textsForXPath($html, $expression, 1);

        return $texts[0] ?? null;
    }

    private function firstMetaDescription(string $html): ?string
    {
        $document = $this->createDocument($html);

        if ($document === null) {
            return null;
        }

        $xpath = new \DOMXPath($document);
        $nodes = $xpath->query('//meta[@name="description"]/@content');

        if ($nodes === false || $nodes->length === 0) {
            return null;
        }

        return $this->cleanText($nodes->item(0)?->nodeValue);
    }

    /**
     * @return array<int, string>
     */
    private function textsForXPath(string $html, string $expression, int $limit): array
    {
        $document = $this->createDocument($html);

        if ($document === null) {
            return [];
        }

        $xpath = new \DOMXPath($document);
        $nodes = $xpath->query($expression);

        if ($nodes === false) {
            return [];
        }

        $texts = [];

        foreach ($nodes as $node) {
            $text = $this->cleanText($node->textContent ?? $node->nodeValue ?? null);

            if ($text === null || in_array($text, $texts, true)) {
                continue;
            }

            $texts[] = $text;

            if (count($texts) >= $limit) {
                break;
            }
        }

        return $texts;
    }

    private function bodySnippet(string $html): ?string
    {
        $text = $this->cleanText(strip_tags($html));

        if ($text === null) {
            return null;
        }

        return Str::limit($text, 320);
    }

    /**
     * @param  array<int, string>  $headings
     * @param  array<int, string>  $navItems
     * @return array<int, string>
     */
    private function detectObservedPatterns(?string $title, ?string $metaDescription, array $headings, array $navItems, ?string $bodySnippet): array
    {
        $haystack = strtolower(implode(' ', array_filter([
            $title,
            $metaDescription,
            implode(' ', $headings),
            implode(' ', $navItems),
            $bodySnippet,
        ])));

        $patterns = [];

        if (Str::contains($haystack, ['login', 'sign in', 'signin', 'account', 'register'])) {
            $patterns[] = 'Authentication or account area';
        }

        if (Str::contains($haystack, ['dashboard', 'admin', 'portal'])) {
            $patterns[] = 'Dashboard or admin workflow';
        }

        if (Str::contains($haystack, ['contact', 'quote', 'book', 'schedule', 'appointment', 'demo'])) {
            $patterns[] = 'Lead capture or booking flow';
        }

        if (Str::contains($haystack, ['pricing', 'checkout', 'cart', 'shop', 'product'])) {
            $patterns[] = 'Commerce, pricing, or purchase flow';
        }

        if (Str::contains($haystack, ['search', 'filter'])) {
            $patterns[] = 'Search or filtering';
        }

        if (Str::contains($haystack, ['upload', 'document', 'file'])) {
            $patterns[] = 'Uploads or document handling';
        }

        return $patterns;
    }

    /**
     * @param  array<int, string>  $headings
     * @param  array<int, string>  $navItems
     * @param  array<int, string>  $observedPatterns
     */
    private function buildSummaryText(?string $title, ?string $metaDescription, array $headings, array $navItems, array $observedPatterns, ?string $bodySnippet): string
    {
        $parts = [];

        if ($title !== null) {
            $parts[] = 'Title: '.$title;
        }

        if ($metaDescription !== null) {
            $parts[] = 'Description: '.$metaDescription;
        }

        if ($headings !== []) {
            $parts[] = 'Headings: '.implode('; ', $headings);
        }

        if ($navItems !== []) {
            $parts[] = 'Navigation: '.implode(', ', $navItems);
        }

        if ($observedPatterns !== []) {
            $parts[] = 'Observed patterns: '.implode(', ', $observedPatterns);
        }

        if ($bodySnippet !== null) {
            $parts[] = 'Page snippet: '.$bodySnippet;
        }

        return implode(' | ', $parts);
    }

    private function createDocument(string $html): ?\DOMDocument
    {
        if (trim($html) === '') {
            return null;
        }

        $document = new \DOMDocument;
        $previousValue = libxml_use_internal_errors(true);

        try {
            $loaded = $document->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_NOERROR | LIBXML_NOWARNING);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousValue);
        }

        return $loaded ? $document : null;
    }

    private function cleanText(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $cleaned = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $cleaned = preg_replace('/\s+/u', ' ', $cleaned ?? '');
        $cleaned = trim((string) $cleaned);

        return $cleaned === '' ? null : $cleaned;
    }
}
