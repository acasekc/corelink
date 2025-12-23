<?php

namespace App\Http\Controllers\API;

use App\Enums\PlanStatus;
use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Services\ConversationService;
use App\Services\InviteCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BotSessionController extends Controller
{
    protected ConversationService $conversationService;
    protected InviteCodeService $inviteCodeService;

    public function __construct(
        ConversationService $conversationService,
        InviteCodeService $inviteCodeService
    ) {
        $this->conversationService = $conversationService;
        $this->inviteCodeService = $inviteCodeService;
    }

    /**
     * Create a new bot session with validated invite code
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'invite_code' => 'required|string',
            'email' => 'nullable|email',
        ]);

        // Validate the invite code
        $validation = $this->inviteCodeService->validateCode($request->input('invite_code'));

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 400);
        }

        // Create the session (public - protected by invite code)
        $session = $this->conversationService->createSession(
            $validation['invite_code_id'],
            $request->input('email'),
            null
        );

        // Mark the invite code as used
        $this->inviteCodeService->markAsUsed($validation['invite_code_id'], null);

        return response()->json([
            'success' => true,
            'session_id' => $session->id,
            'session_token' => $session->session_token,
            'message' => 'Session created successfully. Let\'s begin your project discovery!',
        ], 201);
    }

    /**
     * Get session details
     */
    public function show(string $sessionId): JsonResponse
    {
        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        return response()->json([
            'session_id' => $session->id,
            'status' => $session->status,
            'started_at' => $session->started_at,
            'turn_count' => $session->turn_count,
        ], 200);
    }

    /**
     * Get conversation history
     */
    public function history(string $sessionId): JsonResponse
    {
        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $conversations = $this->conversationService->getHistory($sessionId);

        return response()->json([
            'turns' => $conversations->map(function ($conv) {
                return [
                    'turn_number' => $conv->turn_number,
                    'user_message' => $conv->user_message,
                    'assistant_message' => $conv->assistant_message,
                    'interaction_mode' => $conv->interaction_mode,
                ];
            }),
        ], 200);
    }

    /**
     * Process a user message and get bot response
     */
    public function message(Request $request, string $sessionId): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:5000',
            'interaction_mode' => 'nullable|in:text,voice',
        ]);

        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Check session status
        if ($session->status === SessionStatus::Completed) {
            return response()->json([
                'error' => 'Session has already been completed',
                'plan_id' => $session->discoveryPlan?->id,
            ], 400);
        }

        if ($session->status !== SessionStatus::Active) {
            return response()->json(['error' => 'Session is not active'], 400);
        }

        // Process the message
        $result = $this->conversationService->processMessage(
            $session,
            $request->input('message')
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error'] ?? 'Failed to process message',
            ], 500);
        }

        // Check if we should auto-generate the plan
        if ($result['should_generate_plan'] ?? false) {
            // Dispatch job for async plan generation
            \App\Jobs\GeneratePlanJob::dispatch($session);

            return response()->json([
                'message' => $result['message'],
                'turn_number' => $result['turn_number'],
                'turn_status' => $result['turn_status'],
                'plan_generation_started' => true,
            ], 200);
        }

        return response()->json([
            'message' => $result['message'],
            'turn_number' => $result['turn_number'],
            'turn_status' => $result['turn_status'],
            'bot_offered_summary' => $result['bot_offered_summary'] ?? false,
            'tokens' => $result['tokens'] ?? null,
        ], 200);
    }

    /**
     * Start the conversation with a greeting
     */
    public function start(string $sessionId): JsonResponse
    {
        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Check if conversation already started
        if ($session->turn_count > 0) {
            return response()->json([
                'error' => 'Conversation already started',
                'turn_count' => $session->turn_count,
            ], 400);
        }

        $result = $this->conversationService->generateGreeting($session);

        return response()->json([
            'message' => $result['message'],
            'turn_number' => $result['turn_number'],
        ], 200);
    }

    /**
     * Trigger plan generation explicitly (user requested summary)
     */
    public function generatePlan(string $sessionId): JsonResponse
    {
        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Check session status
        if ($session->status === SessionStatus::Completed) {
            return response()->json([
                'error' => 'Plan has already been generated',
                'plan_id' => $session->discoveryPlan?->id,
            ], 400);
        }

        // Minimum turns requirement
        if ($session->turn_count < 3) {
            return response()->json([
                'error' => 'Please have at least 3 turns of conversation before generating a plan',
            ], 400);
        }

        // Dispatch job for async plan generation
        \App\Jobs\GeneratePlanJob::dispatch($session);

        return response()->json([
            'success' => true,
            'message' => 'Plan generation has been started. You will receive an email when it is ready.',
        ], 202);
    }

    /**
     * Get the generated plan (user summary only for public access)
     */
    public function getPlan(string $sessionId): JsonResponse
    {
        $session = $this->conversationService->getSession($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $plan = $session->discoveryPlan;

        if (!$plan) {
            return response()->json(['error' => 'No plan has been generated yet'], 404);
        }

        if ($plan->status !== PlanStatus::Completed) {
            return response()->json([
                'status' => $plan->status->value,
                'message' => $plan->status === PlanStatus::Generating 
                    ? 'Plan is still being generated...' 
                    : 'Plan generation failed',
            ], 200);
        }

        // Public access - only show user summary (no technical details)
        return response()->json([
            'plan_id' => $plan->id,
            'status' => $plan->status->value,
            'summary' => $plan->user_summary,
            'created_at' => $plan->created_at,
        ], 200);
    }
}
