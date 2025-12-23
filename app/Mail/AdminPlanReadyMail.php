<?php

namespace App\Mail;

use App\Models\BotSession;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminPlanReadyMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public BotSession $session,
        public array $adminPlan,
        public array $structuredRequirements
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $projectName = $this->structuredRequirements['project_name'] ?? 'New Project';
        
        return new Envelope(
            subject: "Discovery Plan Ready: {$projectName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.admin-plan-ready',
            with: [
                'session' => $this->session,
                'plan' => $this->adminPlan,
                'requirements' => $this->structuredRequirements,
                'projectName' => $this->structuredRequirements['project_name'] ?? 'New Project',
                'userEmail' => $this->session->metadata['user_email'] ?? 'Not provided',
                'turnCount' => $this->session->turn_count,
                'costEstimate' => $this->adminPlan['cost_estimates'] ?? null,
                'timeline' => $this->adminPlan['timeline_week_ranges'] ?? null,
                'techStack' => $this->adminPlan['tech_stack_details'] ?? [],
                'planUrl' => url("/admin/discovery/sessions/{$this->session->id}/plan"),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
