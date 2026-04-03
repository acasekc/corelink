<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Must be authenticated via Sanctum
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invite_code' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'current_website_url' => ['nullable', 'string', 'max:500'],
            'references' => ['nullable', 'array', 'max:5'],
            'references.*.url' => ['nullable', 'string', 'max:500'],
            'references.*.type' => ['nullable', 'string', 'in:reference_example,competitor,feature_reference,design_reference'],
            'reference_urls' => ['nullable', 'array', 'max:5'],
            'reference_urls.*' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'invite_code.required' => 'An invite code is required to start a session.',
            'email.email' => 'Please provide a valid email address.',
            'references.max' => 'Please provide no more than 5 typed references.',
            'reference_urls.max' => 'Please provide no more than 5 reference URLs.',
        ];
    }
}
