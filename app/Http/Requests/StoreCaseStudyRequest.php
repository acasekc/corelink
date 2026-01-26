<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaseStudyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:case_studies,slug',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'client_name' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'project_type' => 'nullable|string|max:255',
            'technologies' => 'nullable|string',
            'hero_image' => 'nullable|image|max:2048',
            'hero_image_url' => 'nullable|string|url',
            'content' => 'required|string',
            'metrics' => 'nullable|string',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The title field is required.',
            'title.max' => 'The title must not exceed 255 characters.',
            'slug.unique' => 'This slug is already in use.',
            'hero_image.image' => 'The hero image must be an image file.',
            'hero_image.max' => 'The hero image must not exceed 2MB.',
            'hero_image_url.url' => 'The hero image URL must be a valid URL.',
            'content.required' => 'The content field is required.',
            'order.min' => 'The order must be at least 0.',
        ];
    }
}
