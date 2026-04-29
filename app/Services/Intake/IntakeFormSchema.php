<?php

namespace App\Services\Intake;

/**
 * Single source of truth for the intake form. Drives:
 *  - server-side validation
 *  - markdown rendering for the helpdesk ticket
 *  - PDF rendering
 *  - admin submission detail rendering
 *
 * The frontend has its own field definitions for UI (multi-step layout, conditional
 * rules, etc.), but the field keys must match the keys defined here.
 */
class IntakeFormSchema
{
    public const GOAL_OPTIONS = [
        'lead_generation' => 'Generate leads',
        'sell_products' => 'Sell products / services',
        'credibility' => 'Establish credibility',
        'information' => 'Provide information',
        'bookings' => 'Accept bookings',
        'other' => 'Other',
    ];

    public const FEATURE_OPTIONS = [
        'contact_form' => 'Contact form',
        'blog' => 'Blog / news section',
        'ecommerce' => 'E-commerce / payments',
        'booking' => 'Booking / scheduling',
        'login' => 'User login / member area',
        'live_chat' => 'Live chat',
        'newsletter' => 'Newsletter signup',
        'social' => 'Social media integration',
        'search' => 'Search functionality',
        'multi_language' => 'Multi-language support',
        'other' => 'Other',
    ];

    public const PAGE_COUNT_OPTIONS = [
        '1-5' => '1–5',
        '6-10' => '6–10',
        '11-20' => '11–20',
        '21-50' => '21–50',
        '50+' => '50+',
        'not_sure' => 'Not sure',
    ];

    public const CMS_OPTIONS = [
        'yes' => 'Yes',
        'no' => 'No',
        'not_sure' => 'Not sure',
    ];

    public const HAS_BRAND_GUIDELINES_OPTIONS = [
        'yes' => 'Yes',
        'no' => 'No',
    ];

    public const CONTENT_RESPONSIBILITY_OPTIONS = [
        'self' => "I'll provide it",
        'copywriting' => 'I need copywriting',
        'mix' => 'A mix of both',
    ];

    public const MEDIA_RESPONSIBILITY_OPTIONS = [
        'self' => "I'll provide them",
        'sourcing' => 'I need sourcing help',
        'mix' => 'A mix of both',
    ];

    public const PLATFORM_OPTIONS = [
        'wordpress' => 'WordPress',
        'laravel' => 'Laravel',
        'shopify' => 'Shopify',
        'jamstack' => 'Static / JAMstack',
        'no_preference' => 'No preference',
        'other' => 'Other',
    ];

    public const SEO_PRIORITY_OPTIONS = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'not_sure' => 'Not sure',
    ];

    public const BUDGET_OPTIONS = [
        'under_5k' => 'Under $5k',
        '5k_10k' => '$5k–$10k',
        '10k_25k' => '$10k–$25k',
        '25k_50k' => '$25k–$50k',
        '50k_plus' => '$50k+',
        'discuss' => 'Prefer to discuss',
    ];

    public const MAINTENANCE_OPTIONS = [
        'yes' => 'Yes',
        'no' => 'No',
        'maybe' => 'Maybe',
    ];

    public const TRAINING_OPTIONS = [
        'yes' => 'Yes',
        'no' => 'No',
    ];

    /**
     * Validation rules for full submission.
     *
     * @return array<string, array<int, string>|string>
     */
    public static function submissionRules(): array
    {
        return [
            // Section 1
            'business_name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website_url' => 'nullable|url|max:500',
            'referral_source' => 'nullable|string|max:255',

            // Section 2
            'goals' => 'required|array|min:1|max:6',
            'goals.*' => 'string|in:'.implode(',', array_keys(self::GOAL_OPTIONS)),
            'business_description' => 'required|string|max:5000',
            'target_audience' => 'required|string|max:5000',
            'competitors' => 'nullable|string|max:5000',

            // Section 3
            'estimated_pages' => 'required|string|in:'.implode(',', array_keys(self::PAGE_COUNT_OPTIONS)),
            'features' => 'required|array|min:1',
            'features.*' => 'string|in:'.implode(',', array_keys(self::FEATURE_OPTIONS)),
            'features_other' => 'nullable|string|max:500',
            'integrations' => 'nullable|string|max:5000',
            'needs_cms' => 'required|string|in:'.implode(',', array_keys(self::CMS_OPTIONS)),

            // Section 4
            'has_brand_guidelines' => 'required|string|in:'.implode(',', array_keys(self::HAS_BRAND_GUIDELINES_OPTIONS)),
            'content_responsibility' => 'required|string|in:'.implode(',', array_keys(self::CONTENT_RESPONSIBILITY_OPTIONS)),
            'media_responsibility' => 'required|string|in:'.implode(',', array_keys(self::MEDIA_RESPONSIBILITY_OPTIONS)),

            // Section 5
            'admired_websites' => 'nullable|string|max:5000',
            'avoid_styles' => 'nullable|string|max:5000',
            'aesthetic_direction' => 'nullable|string|max:5000',

            // Section 6
            'domain_name' => 'required|string|max:255',
            'hosting_provider' => 'nullable|string|max:255',
            'platform_preference' => 'nullable|string|in:'.implode(',', array_keys(self::PLATFORM_OPTIONS)),
            'compliance_requirements' => 'nullable|string|max:2000',
            'expected_traffic' => 'nullable|string|max:255',
            'seo_priority' => 'nullable|string|in:'.implode(',', array_keys(self::SEO_PRIORITY_OPTIONS)),

            // Section 7
            'launch_date' => 'nullable|date',
            'deadline_event' => 'nullable|string|max:500',
            'budget_range' => 'required|string|in:'.implode(',', array_keys(self::BUDGET_OPTIONS)),

            // Section 8
            'primary_contact' => 'required|string|max:255',
            'approval_authority' => 'nullable|string|max:255',
            'stakeholder_count' => 'nullable|string|max:50',

            // Section 9
            'maintenance_interest' => 'nullable|string|in:'.implode(',', array_keys(self::MAINTENANCE_OPTIONS)),
            'training_needed' => 'nullable|string|in:'.implode(',', array_keys(self::TRAINING_OPTIONS)),
            'future_features' => 'nullable|string|max:5000',

            // Section 10
            'additional_notes' => 'nullable|string|max:5000',

            // Honeypot — must be empty
            'website' => 'nullable|prohibited',
        ];
    }

    /**
     * The expected file fields on the multipart submission.
     *
     * @return array<string, array<int, string>>
     */
    public static function fileRules(): array
    {
        return [
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,pdf', 'max:10240'],
            'brand_guidelines' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,pdf', 'max:10240'],
        ];
    }

    /**
     * Sections used to render the markdown ticket body and PDF.
     *
     * @return array<int, array{title: string, fields: array<int, array{key: string, label: string, type?: string}>}>
     */
    public static function sections(): array
    {
        return [
            [
                'title' => 'Business Information',
                'fields' => [
                    ['key' => 'business_name', 'label' => 'Business / organization name'],
                    ['key' => 'industry', 'label' => 'Industry / niche'],
                    ['key' => 'contact_name', 'label' => 'Primary contact name'],
                    ['key' => 'email', 'label' => 'Email'],
                    ['key' => 'phone', 'label' => 'Phone'],
                    ['key' => 'website_url', 'label' => 'Existing website URL'],
                    ['key' => 'referral_source', 'label' => 'How they heard about us'],
                ],
            ],
            [
                'title' => 'Project Overview',
                'fields' => [
                    ['key' => 'goals', 'label' => 'Top goals', 'type' => 'multi:goals'],
                    ['key' => 'business_description', 'label' => 'Business description'],
                    ['key' => 'target_audience', 'label' => 'Target audience'],
                    ['key' => 'competitors', 'label' => 'Main competitors'],
                ],
            ],
            [
                'title' => 'Scope & Features',
                'fields' => [
                    ['key' => 'estimated_pages', 'label' => 'Estimated pages', 'type' => 'option:pages'],
                    ['key' => 'features', 'label' => 'Required features', 'type' => 'multi:features'],
                    ['key' => 'features_other', 'label' => 'Other features (specified)'],
                    ['key' => 'integrations', 'label' => 'Third-party integrations'],
                    ['key' => 'needs_cms', 'label' => 'CMS needed?', 'type' => 'option:cms'],
                ],
            ],
            [
                'title' => 'Content & Branding',
                'fields' => [
                    ['key' => 'has_brand_guidelines', 'label' => 'Brand guidelines exist?', 'type' => 'option:has_brand'],
                    ['key' => 'content_responsibility', 'label' => 'Written content', 'type' => 'option:content_resp'],
                    ['key' => 'media_responsibility', 'label' => 'Photos & video', 'type' => 'option:media_resp'],
                ],
            ],
            [
                'title' => 'Design Direction',
                'fields' => [
                    ['key' => 'admired_websites', 'label' => 'Websites they admire'],
                    ['key' => 'avoid_styles', 'label' => 'Styles to avoid'],
                    ['key' => 'aesthetic_direction', 'label' => 'Colors / aesthetic direction'],
                ],
            ],
            [
                'title' => 'Technical Details',
                'fields' => [
                    ['key' => 'domain_name', 'label' => 'Domain name'],
                    ['key' => 'hosting_provider', 'label' => 'Current hosting provider'],
                    ['key' => 'platform_preference', 'label' => 'Platform preference', 'type' => 'option:platform'],
                    ['key' => 'compliance_requirements', 'label' => 'Compliance requirements'],
                    ['key' => 'expected_traffic', 'label' => 'Expected monthly traffic'],
                    ['key' => 'seo_priority', 'label' => 'SEO priority', 'type' => 'option:seo'],
                ],
            ],
            [
                'title' => 'Timeline & Budget',
                'fields' => [
                    ['key' => 'launch_date', 'label' => 'Desired launch date'],
                    ['key' => 'deadline_event', 'label' => 'Tied to event/deadline'],
                    ['key' => 'budget_range', 'label' => 'Budget range', 'type' => 'option:budget'],
                ],
            ],
            [
                'title' => 'Process & Decision-Making',
                'fields' => [
                    ['key' => 'primary_contact', 'label' => 'Primary point of contact'],
                    ['key' => 'approval_authority', 'label' => 'Final approval authority'],
                    ['key' => 'stakeholder_count', 'label' => 'Stakeholders involved in reviews'],
                ],
            ],
            [
                'title' => 'Ongoing Needs',
                'fields' => [
                    ['key' => 'maintenance_interest', 'label' => 'Interested in ongoing maintenance', 'type' => 'option:maintenance'],
                    ['key' => 'training_needed', 'label' => 'Needs training on updates', 'type' => 'option:training'],
                    ['key' => 'future_features', 'label' => 'Future features / phases'],
                ],
            ],
            [
                'title' => 'Anything Else',
                'fields' => [
                    ['key' => 'additional_notes', 'label' => 'Additional notes'],
                ],
            ],
        ];
    }

    /**
     * Resolve a stored value to a human-readable string.
     */
    public static function resolveValue(string $key, mixed $value, ?string $type = null): string
    {
        if ($value === null || $value === '' || $value === []) {
            return '—';
        }

        return match ($type) {
            'multi:goals' => self::resolveMulti((array) $value, self::GOAL_OPTIONS),
            'multi:features' => self::resolveMulti((array) $value, self::FEATURE_OPTIONS),
            'option:pages' => self::PAGE_COUNT_OPTIONS[$value] ?? (string) $value,
            'option:cms' => self::CMS_OPTIONS[$value] ?? (string) $value,
            'option:has_brand' => self::HAS_BRAND_GUIDELINES_OPTIONS[$value] ?? (string) $value,
            'option:content_resp' => self::CONTENT_RESPONSIBILITY_OPTIONS[$value] ?? (string) $value,
            'option:media_resp' => self::MEDIA_RESPONSIBILITY_OPTIONS[$value] ?? (string) $value,
            'option:platform' => self::PLATFORM_OPTIONS[$value] ?? (string) $value,
            'option:seo' => self::SEO_PRIORITY_OPTIONS[$value] ?? (string) $value,
            'option:budget' => self::BUDGET_OPTIONS[$value] ?? (string) $value,
            'option:maintenance' => self::MAINTENANCE_OPTIONS[$value] ?? (string) $value,
            'option:training' => self::TRAINING_OPTIONS[$value] ?? (string) $value,
            default => is_array($value) ? implode(', ', $value) : (string) $value,
        };
    }

    /**
     * @param  array<int, string>  $values
     * @param  array<string, string>  $options
     */
    private static function resolveMulti(array $values, array $options): string
    {
        $resolved = array_map(fn ($v) => $options[$v] ?? $v, $values);

        return implode(', ', $resolved);
    }

    /**
     * Render the entire submission as a markdown string for the ticket body.
     *
     * @param  array<string, mixed>  $data
     */
    public static function renderMarkdown(array $data): string
    {
        $lines = [];

        foreach (self::sections() as $section) {
            $lines[] = '## '.$section['title'];
            $lines[] = '';

            foreach ($section['fields'] as $field) {
                $value = $data[$field['key']] ?? null;
                $rendered = self::resolveValue($field['key'], $value, $field['type'] ?? null);

                if ($rendered === '—') {
                    continue;
                }

                $lines[] = '**'.$field['label'].':** '.$rendered;
                $lines[] = '';
            }
        }

        return trim(implode("\n", $lines));
    }
}
