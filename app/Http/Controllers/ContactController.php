<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormSubmission;
use App\Services\HelpdeskService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // Send email notification
        Mail::to(config('mail.sales_email'))
            ->send(new ContactFormSubmission(
                name: $validated['name'],
                email: $validated['email'],
                subject: $validated['subject'],
                message: $validated['message'],
            ));

        // Create helpdesk ticket if API key is configured
        $apiKey = config('services.helpdesk.api_key');
        if ($apiKey) {
            $helpdesk = new HelpdeskService(
                apiKey: $apiKey,
                baseUrl: config('services.helpdesk.base_url'),
            );

            $result = $helpdesk->createTicketFromContact($validated);

            if (! $result['success']) {
                Log::warning('Failed to create helpdesk ticket from contact form', [
                    'error' => $result['error'] ?? 'Unknown error',
                    'submitter' => $validated['email'],
                ]);
            }
        }

        return back()->with('success', 'Thank you for your message! We\'ll get back to you soon.');
    }
}
