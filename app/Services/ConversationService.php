<?php

namespace App\Services;

use App\Enums\PlanStatus;
use App\Enums\SessionStatus;
use App\Events\DiscoveryMessageReceived;
use App\Models\BotConversation;
use App\Models\BotSession;
use App\Models\DiscoveryPlan;
use Illuminate\Support\Facades\Log;

class ConversationService
{
    private const COVERAGE_PROMPTS = [
        'business_goal' => 'What is the main business outcome or problem this project needs to solve first?',
        'users' => 'Who will use this product day to day, and are there any different user roles or permission levels?',
        'workflows' => 'What are the main steps users or staff need to complete inside the product?',
        'scope_features' => 'What features are absolute must-haves for the first release versus nice-to-haves for later?',
        'integrations' => 'Does this need to connect with any existing systems, third-party tools, payments, or external services?',
        'data_content' => 'What kind of data, content, uploads, or records will the system need to store or manage?',
        'delivery_constraints' => 'Do you already have a target launch window, budget range, or other delivery constraints we should plan around?',
    ];

    private const COVERAGE_KEYWORDS = [
        'business_goal' => ['problem', 'goal', 'outcome', 'opportunity', 'replace', 'improve', 'manual', 'inefficient'],
        'users' => ['user', 'customer', 'client', 'staff', 'admin', 'team', 'role', 'permission'],
        'workflows' => ['workflow', 'process', 'step', 'book', 'schedule', 'submit', 'approve', 'manage'],
        'scope_features' => ['feature', 'must-have', 'mvp', 'portal', 'dashboard', 'search', 'report', 'notification'],
        'integrations' => ['integrate', 'integration', 'api', 'stripe', 'quickbooks', 'mailchimp', 'webhook', 'sync'],
        'data_content' => ['data', 'content', 'upload', 'document', 'file', 'record', 'inventory', 'catalog'],
        'delivery_constraints' => ['timeline', 'launch', 'budget', 'cost', 'phase', 'deadline', 'asap', 'month'],
    ];

    public const MAX_TURNS = 16;

    public const SOFT_NUDGE_AT = 10;

    public const FORCE_SUMMARY_AT = 14;

    protected LLMService $llmService;

    public function __construct(LLMService $llmService)
    {
        $this->llmService = $llmService;
    }

    /**
     * Create a new bot session
     */
    public function createSession(string $inviteCodeId, ?string $userEmail = null, ?int $userId = null, array $metadata = []): BotSession
    {
        $sessionMetadata = array_filter([
            'user_email' => $userEmail,
            ...$metadata,
        ], static fn ($value) => $value !== null && $value !== []);

        return BotSession::create([
            'invite_code_id' => $inviteCodeId,
            'user_id' => $userId,
            'started_at' => now(),
            'status' => SessionStatus::Active,
            'metadata' => $sessionMetadata,
        ]);
    }

    /**
     * Get a session by ID
     */
    public function getSession(string $sessionId): ?BotSession
    {
        return BotSession::find($sessionId);
    }

    /**
     * Save a conversation turn
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
    ): BotConversation {
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
     */
    public function pauseSession(string $sessionId): BotSession
    {
        $session = BotSession::findOrFail($sessionId);
        $session->update(['status' => SessionStatus::Paused]);

        return $session;
    }

    /**
     * Resume a session
     */
    public function resumeSession(string $sessionId): BotSession
    {
        $session = BotSession::findOrFail($sessionId);
        $session->update(['status' => SessionStatus::Active]);

        return $session;
    }

    /**
     * Build conversation transcript
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
     */
    public function shouldForceSummary(int $turnNumber): bool
    {
        return $turnNumber >= self::FORCE_SUMMARY_AT;
    }

    /**
     * Check if conversation is at hard limit
     */
    public function isAtHardLimit(int $turnNumber): bool
    {
        return $turnNumber >= self::MAX_TURNS;
    }

    /**
     * Detect if bot has offered to summarize
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
        $coverage = $this->assessDiscoveryCoverage($session, $userMessage);

        // Check if at hard limit
        if ($this->isAtHardLimit($turnNumber)) {
            return [
                'success' => true,
                'should_generate_plan' => true,
                'message' => 'I have a great understanding of your project now. Let me put together a comprehensive summary and plan for you!',
                'turn_status' => 'hard_limit',
                'turn_number' => $turnNumber,
            ];
        }

        // Get turn-aware prompt
        $systemPrompt = $this->llmService->getStage1Prompt(
            $turnNumber,
            $session->extracted_requirements,
            $session->metadata['reference_summaries'] ?? [],
            $coverage
        );

        // Call LLM
        $result = $this->llmService->callLLM(
            $systemPrompt,
            $userMessage,
            $conversationHistory,
            2200,
            0.45
        );

        if (! $result['success']) {
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

        if ($botOfferedSummary && ! $coverage['ready_for_wrap_up'] && $turnNumber < self::FORCE_SUMMARY_AT) {
            $result['message'] = $this->buildCoverageFollowUpQuestion($coverage);
            $botOfferedSummary = false;

            $conversation->update([
                'assistant_message' => $result['message'],
            ]);
        }

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
     * @return array{coverage_score: int, covered_topics: array<int, string>, missing_topics: array<int, string>, ready_for_wrap_up: bool}
     */
    public function assessDiscoveryCoverage(BotSession $session, ?string $latestUserMessage = null): array
    {
        $conversationHistory = $session->getConversationHistory();
        $historyText = collect($conversationHistory)
            ->map(function (array $turn): string {
                return implode("\n", array_filter([
                    $turn['user'] ?? null,
                    $turn['assistant'] ?? null,
                    $turn['content'] ?? null,
                ]));
            })
            ->implode("\n");

        $metadata = $session->metadata ?? [];
        $referenceText = collect($metadata['reference_summaries'] ?? [])
            ->map(function (array $summary): string {
                return implode(' ', array_filter([
                    $summary['source_type'] ?? null,
                    $summary['title'] ?? null,
                    $summary['summary'] ?? null,
                ]));
            })
            ->implode("\n");

        $haystack = strtolower(trim(implode("\n", array_filter([
            $historyText,
            $latestUserMessage,
            $referenceText,
            json_encode($session->extracted_requirements ?? []),
        ]))));

        $coveredTopics = [];
        $missingTopics = [];

        foreach (array_keys(self::COVERAGE_PROMPTS) as $bucket) {
            if ($this->coverageBucketIsSatisfied($bucket, $haystack)) {
                $coveredTopics[] = $bucket;

                continue;
            }

            $missingTopics[] = $bucket;
        }

        $coverageScore = count($coveredTopics);
        $requiredCoverage = count(self::COVERAGE_PROMPTS) - 1;

        return [
            'coverage_score' => $coverageScore,
            'covered_topics' => $coveredTopics,
            'missing_topics' => $missingTopics,
            'ready_for_wrap_up' => $coverageScore >= $requiredCoverage,
        ];
    }

    /**
     * @param  array{coverage_score: int, covered_topics: array<int, string>, missing_topics: array<int, string>, ready_for_wrap_up: bool}  $coverage
     */
    private function buildCoverageFollowUpQuestion(array $coverage): string
    {
        $firstMissingTopic = $coverage['missing_topics'][0] ?? null;

        if ($firstMissingTopic === null) {
            return 'I have enough to wrap this up. If you are ready, I can turn this into a project summary and plan.';
        }

        return self::COVERAGE_PROMPTS[$firstMissingTopic];
    }

    private function coverageBucketIsSatisfied(string $bucket, string $haystack): bool
    {
        if ($haystack === '') {
            return false;
        }

        $matches = 0;

        foreach (self::COVERAGE_KEYWORDS[$bucket] ?? [] as $keyword) {
            if (str_contains($haystack, $keyword)) {
                $matches++;
            }
        }

        return match ($bucket) {
            'business_goal', 'users', 'scope_features', 'delivery_constraints' => $matches >= 1,
            default => $matches >= 2,
        };
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
            $stage2Prompt = $this->llmService->getStage2Prompt(
                $conversationHistory,
                $session->metadata['reference_summaries'] ?? []
            );
            $extractionResult = $this->llmService->callLLM(
                'You are a requirements extraction specialist. Extract structured data from conversations. Output ONLY valid JSON.',
                $stage2Prompt,
                null,
                4500,
                0.2
            );

            if (! $extractionResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to extract requirements: '.($extractionResult['error'] ?? 'Unknown error'));
            }

            $structuredRequirements = $this->llmService->parseJsonResponse($extractionResult['message']);
            if (! $structuredRequirements) {
                $plan->markAsFailed();
                throw new \Exception('Failed to parse structured requirements');
            }

            $plan->update(['structured_requirements' => $structuredRequirements]);

            // Stage 3: Generate user summary (friendly, no specs)
            $userSummaryPrompt = $this->llmService->generateUserSummary($structuredRequirements);
            $userSummaryResult = $this->llmService->callLLM(
                'You are a friendly project communicator. Create warm, non-technical summaries. Output ONLY valid JSON.',
                $userSummaryPrompt,
                null,
                2200,
                0.4
            );

            if (! $userSummaryResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to generate user summary: '.($userSummaryResult['error'] ?? 'Unknown error'));
            }

            $userSummary = $this->llmService->parseJsonResponse($userSummaryResult['message']);
            $plan->update(['user_summary' => $userSummary]);

            // Stage 4: Generate admin plan (full technical details)
            $adminPlanPrompt = $this->llmService->generateAdminPlan(
                $structuredRequirements,
                $session->metadata['reference_summaries'] ?? []
            );
            $adminPlanResult = $this->llmService->callLLM(
                'You are a senior technical architect and project planner. Create comprehensive technical plans. Output ONLY valid JSON.',
                $adminPlanPrompt,
                null,
                6500,
                0.25
            );

            if (! $adminPlanResult['success']) {
                $plan->markAsFailed();
                throw new \Exception('Failed to generate admin plan: '.($adminPlanResult['error'] ?? 'Unknown error'));
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
