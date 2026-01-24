<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleGenerationSettings extends Model
{
    protected $fillable = [
        'is_enabled',
        'dalle_enabled',
        'auto_publish_enabled',
        'auto_publish_hours',
        'max_articles_per_day',
        'max_articles_per_week',
        'admin_notification_email',
        'openai_model',
        'dalle_model',
        'dalle_size',
        'dalle_quality',
        'system_prompt',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'dalle_enabled' => 'boolean',
            'auto_publish_enabled' => 'boolean',
            'auto_publish_hours' => 'integer',
            'max_articles_per_day' => 'integer',
            'max_articles_per_week' => 'integer',
        ];
    }

    /**
     * Get the singleton settings instance.
     */
    public static function get(): self
    {
        return static::firstOrCreate([], [
            'is_enabled' => true,
            'dalle_enabled' => false,
            'auto_publish_enabled' => true,
            'auto_publish_hours' => 24,
            'max_articles_per_day' => 1,
            'max_articles_per_week' => 3,
        ]);
    }
}
