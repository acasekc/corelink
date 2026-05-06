<?php

namespace App\Http\Requests;

use App\Services\Intake\IntakeFormSchema;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Str;

class SubmitIntakeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Accept bare domains for `website_url` by prepending https:// before the
     * `url` rule runs. Real users rarely type the scheme; rejecting them for
     * that would be the wrong UX.
     */
    protected function prepareForValidation(): void
    {
        $url = $this->input('website_url');

        if (! is_string($url) || trim($url) === '') {
            return;
        }

        $trimmed = trim($url);

        if (! preg_match('#^https?://#i', $trimmed)) {
            $this->merge(['website_url' => 'https://'.ltrim($trimmed, '/')]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...IntakeFormSchema::submissionRules(),
            ...IntakeFormSchema::fileRules(),
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
            'goals.required' => 'Select at least one website goal.',
            'goals.min' => 'Select at least one website goal.',
            'features.required' => 'Select at least one required feature.',
            'features.min' => 'Select at least one required feature.',
            'website.prohibited' => 'Invalid submission.',
        ];
    }

    /**
     * Get the human-readable attribute names used in validation messages.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        $attributes = [];

        foreach (IntakeFormSchema::sections() as $section) {
            foreach ($section['fields'] as $field) {
                $attributes[$field['key']] = $field['label'];
            }
        }

        return [
            ...$attributes,
            'goals.*' => 'website goal',
            'features.*' => 'required feature',
            'logo' => 'existing logo',
            'brand_guidelines' => 'brand guidelines upload',
            'website' => 'website',
        ];
    }

    /**
     * Return structured JSON errors for the intake form fetch client.
     */
    protected function failedValidation(Validator $validator): void
    {
        if (! $this->expectsJson()) {
            parent::failedValidation($validator);
        }

        $errors = $validator->errors()->toArray();
        $normalizedErrors = [];
        $summary = [];

        foreach ($errors as $field => $messages) {
            $normalizedField = $this->normalizeField($field);
            $message = $messages[0] ?? 'Invalid value.';

            if (! array_key_exists($normalizedField, $normalizedErrors)) {
                $normalizedErrors[$normalizedField] = $message;
            }

            if (collect($summary)->contains(fn (array $item) => $item['field'] === $normalizedField)) {
                continue;
            }

            $metadata = $this->fieldMetadata($normalizedField);

            $summary[] = [
                'field' => $normalizedField,
                'label' => $metadata['label'],
                'message' => $message,
                'step_index' => $metadata['step_index'],
                'step_title' => $metadata['step_title'],
            ];
        }

        $firstError = $summary[0] ?? null;

        throw new HttpResponseException(response()->json([
            'message' => $firstError
                ? 'Step '.($firstError['step_index'] + 1).': '.$firstError['label'].' — '.$firstError['message']
                : 'Please correct the highlighted fields and try again.',
            'errors' => $normalizedErrors,
            'error_summary' => $summary,
            'first_error' => $firstError,
        ], 422));
    }

    private function normalizeField(string $field): string
    {
        return Str::before($field, '.');
    }

    /**
     * @return array{label: string, step_index: int, step_title: string}
     */
    private function fieldMetadata(string $field): array
    {
        foreach (IntakeFormSchema::sections() as $stepIndex => $section) {
            foreach ($section['fields'] as $config) {
                if ($config['key'] !== $field) {
                    continue;
                }

                return [
                    'label' => $config['label'],
                    'step_index' => $stepIndex,
                    'step_title' => $section['title'],
                ];
            }
        }

        return [
            'label' => Str::headline($field),
            'step_index' => 0,
            'step_title' => IntakeFormSchema::sections()[0]['title'],
        ];
    }
}
