<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'meta_description' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'featured_image' => 'nullable|string',
            'featured_image_alt' => 'nullable|string|max:255',
            'article_category_id' => 'nullable|exists:article_categories,id',
            'status' => 'required|in:draft,pending_review,scheduled,published,rejected',
            'published_at' => 'nullable|date_format:Y-m-d\TH:i:s',
            'auto_publish_at' => 'nullable|date_format:Y-m-d\TH:i:s',
            'ai_image_enabled' => 'boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Article title is required',
            'title.max' => 'Article title must not exceed 255 characters',
            'content.required' => 'Article content is required',
            'status.required' => 'Article status is required',
            'status.in' => 'Article status must be one of: draft, pending_review, scheduled, published, rejected',
            'article_category_id.exists' => 'The selected category does not exist',
        ];
    }
}
