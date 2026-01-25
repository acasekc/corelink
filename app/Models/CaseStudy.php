<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseStudy extends Model
{
    use HasFactory, SoftDeletes;

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
