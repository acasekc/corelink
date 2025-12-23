<?php

namespace App\Services;

use App\Enums\PlanStatus;
use App\Enums\SessionStatus;
use App\Events\DiscoveryMessageReceived;
use App\Events\DiscoveryPlanReady;
use App\Models\BotSession;
use App\Models\BotConversation;
use App\Models\DiscoveryPlan;
use Illuminate\Support\Facades\Log;

class ConversationService
{
    public const MAX_TURNS = 12;
    public const SOFT_NUDGE_AT = 7;
    public const FORCE_SUMMARY_AT = 10;

    protected LLMService $llmService;

    public function __construct(LLMService $llmService)
    {
        $this->llmService = $llmService;
    }

    /**
     * Create a new bot session
     *
     * @param string $inviteCodeId
     * @param string|null $userEmail
     * @param int|null $userId
     * @return BotSession
     */
    public function createSession(string $inviteCodeId, ?string $userEmail = null, ?int $userId = null): BotSession
    {
        return BotSession::create([
            'invite_code_id' => $inviteCodeId,
            'user_id' => $userId,
            'started_at' => now(),
            'status' => SessionStatus::Active,
            'metadata' => [
                'user_email' => $userEmail,
            ],
        ]);
    }

    /**
     * Get a session by ID
     *
     * @param string $sessionId
     * @return BotSession|null
     */
    public function getSession(string $sessionId): ?BotSession
    {
        return BotSession::find($sessionId);
    }

    /**
     * Save a conversation turn
     *
     * @param string $sessionId
     * @param string|null $userMessage
     * @param string|null $assistantMessage
     * @param string $interactionMode
     * @param string|null $userAudioUrl
     * @param string|null $assistantAudioUrl
     * @param array|null $tokensUsed
     * @param array|null $turnContext
     * @return BotConversation
     */
    public function saveTurn(
        string $sessionId,
        ?string $userMessage = null,
        ?string $assistantMessage = null,
        string $interactionMode = 'text',
        ?string $userAudioUrl = null,
        ?string $assistantAudioUrl = null,
        ?array $tokensUsed = null,
        ?array $turnContext = null
    ): BotConversation
    {
        $session = BotSession::findOrFail($sessionId);
        
        // Get the next turn number
        $turnNumber = $session->conversations()->max('turn_number') + 1 ?? 1;

        return BotConversation::create([
            'session_id' => $sessionId,
            'turn_number' => $turnNumber,
            'user_message' => $userMessage,
            'user_audio_url' => $userAudioUrl,
            'user_audio_transcribed' => $userAudioUrl ? false : true,
            'assistant_message' => $assistantMessage,
            'assistant_audio_url' => $assistantAudioUrl,
            'interaction_mode' => $interactionMode,
            'tokens_used' => $tokensUsed,
            'turn_context' => $turnContext,
        ]);
    }

    /**
     * Get conversation history
     *
     * @param string $sessionId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getHistory(string $sessionId)
    {
        return BotConversation::where('session_id', $sessionId)
            ->orderBy('turn_number', 'asc')
            ->get();
    }

    /**
     * Get recent conversation for context (sliding window)
     *
     * @param string $sessionId
     * @param int $windowSize
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRecentContext(string $sessionId, int $windowSize = 10)
    {
        return BotConversation::where('session_id', $sessionId)
            ->orderBy('turn_number', 'desc')
            ->limit($windowSize)
            ->get()
            ->reverse();
    }

    /**
     * Complete a session
     *
     * @param string $sessionId
     * @return BotSession
     */
    public function completeSession(string $sessionId): BotSession
    {
        $session = BotSession::findOrFail($sessionId);
        $session->update([
            'status' => SessionStatus::Completed,
            'completed_at' => now(),
        ]);
        return $session;
    }

    /**
     * Pause a session
     *
     * @param string $sessionId
     * @return BotSession
     */
    public function pauseSession(string $sessionId): BotSession
    {
        $session = BotSession::findOrFail($sessionId);
        $session->update(['status' => SessionStatus::Paused]);
        return $session;
    }

    /**
     * Resume a session
     *
     * @param string $sessionId
     * @return BotSession
     */
    public function resumeSession(string $sessionId): BotSession
    {
        $session = BotSession::findOrFail($sessionId);
        $session->update(['status' => SessionStatus::Active]);
        return $session;
    }

    /**
     * Build conversation transcript
     *
     * @param string $sessionId
     * @return string
     */
    public function buildTranscript(string $sessionId): string
    {
        $conversations = $this->getHistory($sessionId);
        $transcript = '';

        foreach ($conversations as $turn) {
            if ($turn->user_message) {
                $transcript .= "User: {$turn->user_message}\n\n";
            }
            if ($turn->assistant_message) {
                $transcript .= "Assistant: {$turn->assistant_message}\n\n";
            }
        }

        return $transcript;
    }

    /**
     * Check if we should force summary generation
     *
     * @param int $turnNumber
     * @return bool
     */
    public function shouldForceSummary(int $turnNumber): bool
    {
        return $turnNumber >= self::FORCE_SUMMARY_AT;
    }

    /**
     * Check if conversation is at hard limit
     *
     * @param int $turnNumber
     * @return bool
     */
    public function isAtHardLimit(int $turnNumber): bool
    {
        return $turnNumber >= self::MAX_TURNS;
    }

    /**
     * Detect if bot has offered to summarize
     *
     * @param string $message
     * @return bool
     */
    public function getSummaryTriggerPhrase(string $message): bool
    {
        $triggerPhrases = [
            'would you like me to summarize',
            'shall i summarize',
            'let me summarize',
            'i\'ll summarize',
            'ready to create a plan',
            'propose a high-level project plan',
            'i have a good understanding now',
            'i have enough to create',
            'let\'s start wrapping up',
        ];

        $lowerMessage = strtolower($message);
        
        foreach ($triggerPhrases as $phrase) {
            if (str_contains($lowerMessage, $phrase)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the current turn guidance level
     *
     * @param int $turnNumber
     * @return string
     */
    public function getTurnGuidanceLevel(int $turnNumber): string
    {
        if ($turnNumber >= self::MAX_TURNS) {
            return 'hard_limit';
        }
        if ($turnNumber >= self::FORCE_SUMMARY_AT) {
            return 'force_summary';
        }
        if ($turnNumber >= self::SOFT_NUDGE_AT) {
            return 'soft_nudge';
        }
        return 'discovery';
    }

    /**
     * Process a user message and get bot response
     */
    public function processMessage(
        BotSession $session,
        string $userMessage
    ): array {
        $turnNumber = $session->turn_count + 1;
        $conversationHistory = $session->getConversationHistory();

        // Check if at hard limit
        if ($this->isAtHardLimit($turnNumber)) {
            return [
                'success' => true,
                'should_generate_plan' => true,
                'message' => "I have a great understanding of your project now. Let me put together a comprehensive summary and plan for you!",
                'turn_status' => 'hard_limit',
                'turn_number' => $turnNumber,
            ];
        }

        // Get turn-aware prompt
        $systemPrompt = $this->llmService->getStage1Prompt(
            $turnNumber,
            $session->extracted_requirements
        );
        
        // Call LLM
        $result = $this->llmService->callLLM(
            $systemPrompt,
            $userMessage,
            $conversationHistory,
            2000
        );

        if (!$result['success']) {
            return $result;
        }

        // Save conversation turn
        $conversation = BotConversation::create([
            'session_id' => $session->id,
            'turn_number' => $turnNumber,
            'user_message' => $userMessage,
            'assistant_message' => $result['message'],
            'interaction_mode' => 'text',
            'tokens_used' => $result['tokens'] ?? null,
        ]);

        // Update session
        $session->incrementTurnCount();

        // Check if bot is offering to summarize
        $botOfferedSummary = $this->getSummaryTriggerPhrase($result['message']);

        // Broadcast the assistant's response
        broadcast(new DiscoveryMessageReceived(
            $session->id,
            $result['message'],
            'assistant',
            $turnNumber,
            $this->getTurnGuidanceLevel($turnNumber)
        ))->toOthers();

        return [
            'success' => true,
            'message' => $result['message'],
            'conversation_id' => $conversation->id,
            'tokens' => $result['tokens'] ?? [],
            'turn_status' => $this->getTurnGuidanceLevel($turnNumber),
            'turn_number' => $turnNumber,
            'bot_offered_summary' => $botOfferedSummary,
            'should_generate_plan' => false,
        ];
    }

    /**
     * Generate the initial greeting message
     */
    public function generateGreeting(BotSession $session): array
    {
        $greeting = "Hello! I'm here to help understand your project vision and requirements. By the end of our conversation, I'll create a clear summary of what you're looking to build.\n\nLet's start with the big picture: **What problem are you trying to solve, or what opportunity are you looking to capture with this project?**";

        BotConversation::create([
            'session_id' => $session->id,
            'turn_number' => 0,
            'user_message' => null,
            'assistant_message' => $greeting,
            'interaction_mode' => 'text',
        ]);

        return [
            'success' => true,
            'message' => $greeting,
            'turn_number' => 0,
        ];
    }

    /**
     * Generate final outputs (orchestrates the 3-stage output generation)
     */
    public function generateFinalOutputs(BotSession $session): array
    {
        try {
            $conversationHistory = $session->getConversationHistory();
            $adminUserId = $session->inviteCode->admin_user_id;

            // Create plan record
            $plan = DiscoveryPlan::create([
                'session_id' => $session->id,
                'admin_user_id' => $adminUserId,
                'raw_conversation' => $conversationHistory,
                'status' => PlanStatus::Generating,
            ]);

            // Stage 2: Extract structured requirements
            $stage2Prompt = $this->llmService->getStage2Prompt($conversationHistory);
            $extractionResult = $this->llmService->callLLM(
                "You are a requirements extraction specialist. Extract structured data from conversations. Output ONLY valid JSON.",
                $stage2Prompt,
                null,
                4000
            );

            if (!$extractionResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to extract requirements: ' . ($extractionResult['error'] ?? 'Unknown error'));
            }

            $structuredRequirements = $this->llmService->parseJsonResponse($extractionResult['message']);
            if (!$structuredRequirements) {
                $plan->markAsFailed();
                throw new \Exception('Failed to parse structured requirements');
            }

            $plan->update(['structured_requirements' => $structuredRequirements]);

            // Stage 3: Generate user summary (friendly, no specs)
            $userSummaryPrompt = $this->llmService->generateUserSummary($structuredRequirements);
            $userSummaryResult = $this->llmService->callLLM(
                "You are a friendly project communicator. Create warm, non-technical summaries. Output ONLY valid JSON.",
                $userSummaryPrompt,
                null,
                2000
            );

            if (!$userSummaryResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to generate user summary: ' . ($userSummaryResult['error'] ?? 'Unknown error'));
            }

            $userSummary = $this->llmService->parseJsonResponse($userSummaryResult['message']);
            $plan->update(['user_summary' => $userSummary]);

            // Stage 4: Generate admin plan (full technical details)
            $adminPlanPrompt = $this->llmService->generateAdminPlan($structuredRequirements);
            $adminPlanResult = $this->llmService->callLLM(
                "You are a senior technical architect and project planner. Create comprehensive technical plans. Output ONLY valid JSON.",
                $adminPlanPrompt,
                null,
                6000
            );

            if (!$adminPlanResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to generate admin plan: ' . ($adminPlanResult['error'] ?? 'Unknown error'));
            }

            $adminPlan = $this->llmService->parseJsonResponse($adminPlanResult['message']);
            
            $plan->update([
                'technical_plan' => $adminPlan,
                'cost_estimate' => $adminPlan['cost_estimates'] ?? null,
                'timeline_estimate' => $adminPlan['timeline_week_ranges'] ?? null,
                'tech_recommendations' => $adminPlan['tech_stack_details'] ?? null,
            ]);

            $plan->markAsCompleted();
            $session->markAsCompleted();

            return [
                'success' => true,
                'plan_id' => $plan->id,
                'structured_requirements' => $structuredRequirements,
                'user_summary' => $userSummary,
                'admin_plan' => $adminPlan,
                'tokens_used' => [
                    'extraction' => $extractionResult['tokens'] ?? [],
                    'user_summary' => $userSummaryResult['tokens'] ?? [],
                    'admin_plan' => $adminPlanResult['tokens'] ?? [],
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Failed to generate final outputs', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
