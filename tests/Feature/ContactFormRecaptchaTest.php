<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactFormRecaptchaTest extends TestCase
{
    use RefreshDatabase;

    private array $validFormData = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'subject' => 'Test Subject',
        'message' => 'This is a test message.',
    ];

    public function test_contact_form_works_without_recaptcha_configured(): void
    {
        Mail::fake();

        config(['services.recaptcha.secret_key' => null]);

        $response = $this->post('/contact', $this->validFormData);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        Mail::assertSent(\App\Mail\ContactFormSubmission::class);
    }

    public function test_contact_form_requires_recaptcha_token_when_configured(): void
    {
        config(['services.recaptcha.secret_key' => 'test-secret-key']);

        $response = $this->post('/contact', $this->validFormData);

        $response->assertSessionHasErrors(['recaptcha_token']);
    }

    public function test_contact_form_succeeds_with_valid_recaptcha_token(): void
    {
        Mail::fake();

        config([
            'services.recaptcha.secret_key' => 'test-secret-key',
            'services.recaptcha.min_score' => 0.5,
        ]);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify' => Http::response([
                'success' => true,
                'score' => 0.9,
                'action' => 'contact',
            ]),
        ]);

        $response = $this->post('/contact', [
            ...$this->validFormData,
            'recaptcha_token' => 'valid-token',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        Mail::assertSent(\App\Mail\ContactFormSubmission::class);
    }

    public function test_contact_form_fails_with_low_recaptcha_score(): void
    {
        config([
            'services.recaptcha.secret_key' => 'test-secret-key',
            'services.recaptcha.min_score' => 0.5,
        ]);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify' => Http::response([
                'success' => true,
                'score' => 0.2,
                'action' => 'contact',
            ]),
        ]);

        $response = $this->post('/contact', [
            ...$this->validFormData,
            'recaptcha_token' => 'low-score-token',
        ]);

        $response->assertSessionHasErrors(['recaptcha_token']);
    }

    public function test_contact_form_fails_when_recaptcha_verification_fails(): void
    {
        config(['services.recaptcha.secret_key' => 'test-secret-key']);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify' => Http::response([
                'success' => false,
                'error-codes' => ['invalid-input-response'],
            ]),
        ]);

        $response = $this->post('/contact', [
            ...$this->validFormData,
            'recaptcha_token' => 'invalid-token',
        ]);

        $response->assertSessionHasErrors(['recaptcha_token']);
    }

    public function test_contact_form_succeeds_when_recaptcha_service_is_down(): void
    {
        Mail::fake();

        config(['services.recaptcha.secret_key' => 'test-secret-key']);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify' => Http::response([], 500),
        ]);

        $response = $this->post('/contact', [
            ...$this->validFormData,
            'recaptcha_token' => 'some-token',
        ]);

        // Should still work - we don't block users when Google is down
        $response->assertRedirect();
        $response->assertSessionHas('success');
        Mail::assertSent(\App\Mail\ContactFormSubmission::class);
    }
}
