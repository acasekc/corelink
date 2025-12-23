<?php

namespace App\Jobs;

use App\Enums\SessionStatus;
use App\Events\DiscoveryPlanReady;
use App\Models\BotSession;
use App\Services\ConversationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class GeneratePlanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public BotSession $session
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ConversationService $conversationService): void
    {
        Log::info('Starting plan generation', ['session_id' => $this->session->id]);

        try {
            // Update session status
            $this->session->update(['status' => SessionStatus::Generating]);

            // Generate the outputs
            $result = $conversationService->generateFinalOutputs($this->session);

            if (!$result['success']) {
                Log::error('Plan generation failed', [
                    'session_id' => $this->session->id,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);
                
                $this->session->update(['status' => SessionStatus::Failed]);
                
                // Notify admin of failure
                $this->notifyAdminOfFailure($result['error'] ?? 'Unknown error');
                
                return;
            }

            Log::info('Plan generation completed', [
                'session_id' => $this->session->id,
                'plan_id' => $result['plan_id'],
            ]);

            // Broadcast plan ready event
            broadcast(new DiscoveryPlanReady(
                $this->session->id,
                $result['plan_id'],
                'completed',
                $result['user_summary'] ?? null
            ));

            // Send notifications
            $this->notifyUser($result);
            $this->notifyAdmin($result);

        } catch (\Exception $e) {
            Log::error('Plan generation exception', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->session->update(['status' => SessionStatus::Failed]);
            
            throw $e;
        }
    }

    /**
     * Send notification to the user with their friendly summary
     */
    protected function notifyUser(array $result): void
    {
        $userEmail = $this->session->metadata['user_email'] ?? null;
        
        if (!$userEmail) {
            Log::info('No user email to notify', ['session_id' => $this->session->id]);
            return;
        }

        try {
            Mail::to($userEmail)->send(new \App\Mail\PlanReadyMail(
                $this->session,
                $result['user_summary']
            ));
            
            Log::info('User notification sent', [
                'session_id' => $this->session->id,
                'email' => $userEmail,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send user notification', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification to the admin with full plan details
     */
    protected function notifyAdmin(array $result): void
    {
        $adminUser = $this->session->inviteCode?->adminUser;
        
        if (!$adminUser) {
            Log::warning('No admin user found for session', ['session_id' => $this->session->id]);
            return;
        }

        try {
            Mail::to($adminUser->email)->send(new \App\Mail\AdminPlanReadyMail(
                $this->session,
                $result['admin_plan'],
                $result['structured_requirements']
            ));
            
            Log::info('Admin notification sent', [
                'session_id' => $this->session->id,
                'admin_id' => $adminUser->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notify admin of plan generation failure
     */
    protected function notifyAdminOfFailure(string $error): void
    {
        $adminUser = $this->session->inviteCode?->adminUser;
        
        if (!$adminUser) {
            return;
        }

        try {
            Mail::to($adminUser->email)->send(new \App\Mail\PlanFailedMail(
                $this->session,
                $error
            ));
            
            Log::info('Admin failure notification sent', ['session_id' => $this->session->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send admin failure notification', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('GeneratePlanJob failed permanently', [
            'session_id' => $this->session->id,
            'error' => $exception->getMessage(),
        ]);

        $this->session->update(['status' => SessionStatus::Failed]);
        $this->notifyAdminOfFailure($exception->getMessage());
    }
}
