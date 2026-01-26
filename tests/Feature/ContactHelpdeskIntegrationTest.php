<?php

namespace Tests\Feature;

use App\Services\HelpdeskService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactHelpdeskIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_form_creates_helpdesk_ticket(): void
    {
        Mail::fake();

        Http::fake([
            '*/api/helpdesk/v1/tickets' => Http::response([
                'data' => [
                    'id' => 123,
                    'number' => 'CL-123',
                    'title' => 'Test Subject',
                ],
            ], 201),
        ]);

        config(['services.helpdesk.api_key' => 'test-api-key']);

        $response = $this->post('/contact', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'subject' => 'Test Subject',
            'message' => 'This is a test message.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/api/helpdesk/v1/tickets')
                && $request->header('X-API-Key')[0] === 'test-api-key'
                && $request['title'] === 'Test Subject'
                && $request['content'] === 'This is a test message.'
                && $request['submitter_name'] === 'Test User'
                && $request['submitter_email'] === 'test@example.com';
        });
    }

    public function test_contact_form_works_without_helpdesk_api_key(): void
    {
        Mail::fake();

        config(['services.helpdesk.api_key' => null]);

        $response = $this->post('/contact', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'subject' => 'Test Subject',
            'message' => 'This is a test message.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Email should still be sent
        Mail::assertSent(\App\Mail\ContactFormSubmission::class);
    }

    public function test_helpdesk_service_creates_ticket(): void
    {
        Http::fake([
            '*/api/helpdesk/v1/tickets' => Http::response([
                'data' => [
                    'id' => 42,
                    'number' => 'CL-42',
                    'title' => 'Website Inquiry',
                ],
            ], 201),
        ]);

        $service = new HelpdeskService(
            apiKey: 'test-key',
            baseUrl: 'https://corelink.dev/api/helpdesk/v1'
        );

        $result = $service->createTicketFromContact([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Website Inquiry',
            'message' => 'I have a question about your services.',
        ]);

        $this->assertTrue($result['success']);
        $this->assertEquals(42, $result['ticket_id']);
        $this->assertEquals('CL-42', $result['ticket_number']);
    }

    public function test_helpdesk_service_handles_api_error(): void
    {
        Http::fake([
            '*/api/helpdesk/v1/tickets' => Http::response([
                'message' => 'Invalid API key',
            ], 401),
        ]);

        $service = new HelpdeskService(
            apiKey: 'invalid-key',
            baseUrl: 'https://corelink.dev/api/helpdesk/v1'
        );

        $result = $service->createTicketFromContact([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Test',
            'message' => 'Test message',
        ]);

        $this->assertFalse($result['success']);
        $this->assertEquals('Invalid API key', $result['error']);
    }
}
