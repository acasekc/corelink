<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseStudyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'client_name' => $this->client_name,
            'industry' => $this->industry,
            'project_type' => $this->project_type,
            'technologies' => $this->technologies,
            'hero_image' => $this->hero_image,
            'content' => $this->content,
            'metrics' => $this->metrics,
            'is_published' => $this->is_published,
            'order' => $this->order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
