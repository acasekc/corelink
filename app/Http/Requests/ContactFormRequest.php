<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContactFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ];

        if (config('services.recaptcha.secret_key')) {
            $rules['recaptcha_token'] = 'required|string';
        }

        return $rules;
    }

    /**
     * Get custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recaptcha_token.required' => 'reCAPTCHA verification failed. Please try again.',
        ];
    }

    /**
     * Validate the reCAPTCHA token after standard validation passes.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $secretKey = config('services.recaptcha.secret_key');

            if (! $secretKey) {
                return;
            }

            $token = $this->input('recaptcha_token');

            if (! $this->verifyRecaptcha($token, $secretKey)) {
                $validator->errors()->add('recaptcha_token', 'reCAPTCHA verification failed. Please try again.');
            }
        });
    }

    /**
     * Verify the reCAPTCHA token with Google.
     */
    private function verifyRecaptcha(string $token, string $secretKey): bool
    {
        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $this->ip(),
            ]);

            if (! $response->successful()) {
                Log::warning('reCAPTCHA service returned non-200 response', [
                    'status' => $response->status(),
                ]);

                // Allow form submission if reCAPTCHA service is down
                return true;
            }

            $data = $response->json();

            if (! ($data['success'] ?? false)) {
                Log::warning('reCAPTCHA verification failed', [
                    'error-codes' => $data['error-codes'] ?? [],
                ]);

                return false;
            }

            $minScore = (float) config('services.recaptcha.min_score', 0.5);

            if (($data['score'] ?? 0) < $minScore) {
                Log::warning('reCAPTCHA score too low', [
                    'score' => $data['score'] ?? 0,
                    'min_score' => $minScore,
                ]);

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification error', [
                'message' => $e->getMessage(),
            ]);

            // Allow form submission if reCAPTCHA service is down
            return true;
        }
    }
}
