<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudy extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'description',
        'client_name',
        'industry',
        'project_type',
        'technologies',
        'hero_image',
        'content',
        'metrics',
        'is_published',
        'order',
    ];

    protected $casts = [
        'technologies' => 'array',
        'metrics' => 'array',
        'is_published' => 'boolean',
    ];
}
