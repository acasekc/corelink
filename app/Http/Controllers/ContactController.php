<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormSubmission;
use Illuminate\Http\Request;
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

        Mail::to(env('SALES_EMAIL'))
            ->send(new ContactFormSubmission(
                name: $validated['name'],
                email: $validated['email'],
                subject: $validated['subject'],
                message: $validated['message'],
            ));

        return back()->with('success', 'Thank you for your message! We\'ll get back to you soon.');
    }
}
