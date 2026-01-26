<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArticleRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:articles,slug,'.$this->route('article')?->id,
            'meta_description' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'sometimes|string',
            'featured_image' => 'nullable|string',
            'featured_image_alt' => 'nullable|string|max:255',
            'article_category_id' => 'nullable|exists:article_categories,id',
            'status' => 'sometimes|in:draft,pending_review,scheduled,published,rejected',
            'published_at' => 'nullable|date_format:Y-m-d\TH:i:s',
            'auto_publish_at' => 'nullable|date_format:Y-m-d\TH:i:s',
            'reviewed_by' => 'nullable|exists:users,id',
            'review_notes' => 'nullable|string',
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
            'title.max' => 'Article title must not exceed 255 characters',
            'status.in' => 'Article status must be one of: draft, pending_review, scheduled, published, rejected',
            'article_category_id.exists' => 'The selected category does not exist',
            'reviewed_by.exists' => 'The selected reviewer does not exist',
        ];
    }
}
