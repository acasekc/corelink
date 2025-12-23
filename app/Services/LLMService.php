<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LLMService
{
    protected ?string $apiKey;
    protected string $baseUrl = 'https://api.openai.com/v1';
    protected string $model = 'gpt-4';

    public function __construct()
    {
        $this->apiKey = config('services.openai.key') ?? '';
    }

    /**
     * Call OpenAI API
     *
     * @param string $systemPrompt
     * @param string $userMessage
     * @param array|null $conversationHistory
     * @param int $maxTokens
     * @return array
     */
    public function callLLM(
        string $systemPrompt,
        string $userMessage,
        ?array $conversationHistory = null,
        int $maxTokens = 2000
    ): array
    {
        try {
            $messages = [];

            // Add system message
            $messages[] = ['role' => 'system', 'content' => $systemPrompt];

            // Add conversation history if provided
            if ($conversationHistory) {
                $messages = array_merge($messages, $conversationHistory);
            }

            // Add current user message
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => $messages,
                'max_tokens' => $maxTokens,
                'temperature' => 0.7,
            ]);

            if ($response->failed()) {
                Log::error('OpenAI API Error', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to get response from OpenAI API',
                    'status_code' => $response->status(),
                ];
            }

            $data = $response->json();

            return [
                'success' => true,
                'message' => $data['choices'][0]['message']['content'],
                'tokens' => [
                    'prompt' => $data['usage']['prompt_tokens'],
                    'completion' => $data['usage']['completion_tokens'],
                    'total' => $data['usage']['total_tokens'],
                ],
            ];
        } catch (\Exception $e) {
            Log::error('LLM Service Exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get Stage 1 system prompt (Conversational Interviewer)
     *
     * @param int $turnNumber
     * @param array|null $extractedRequirements
     * @return string
     */
    public function getStage1Prompt(int $turnNumber = 0, ?array $extractedRequirements = null): string
    {
        $prompt = "You are an expert project discovery interviewer for a software development agency. Your goal is to deeply understand the user's project vision, business needs, requirements, and constraints through a friendly, structured conversation. At the end, you will summarize and propose a high-level project plan.

Guidelines:
- Ask ONE question at a time, followed by brief context or explanation if it helps the user answer
- Always build directly on previous answers
- If an answer is vague or unclear, politely challenge it with a follow-up to clarify (e.g., \"Can you give me an example of that?\")
- Never make assumptions—always verify your understanding
- Maintain a warm, professional, and patient tone
- Focus questions around WHO (users, stakeholders), WHAT (problems, goals, features), WHY (business value, success metrics), and HOW (current processes, preferences, constraints)
- Avoid technical jargon entirely unless the user introduces it first
- Provide helpful context or brief explanations when it makes sense, but keep the focus on understanding their needs
- When you believe you have enough information to create a solid plan, say: \"I think I have a good understanding now. Would you like me to summarize what I've heard and propose a high-level project plan?\"";

        // Turn-aware prompting
        $turnGuidance = $this->getTurnGuidance($turnNumber);
        if ($turnGuidance) {
            $prompt .= "\n\n" . $turnGuidance;
        }

        if ($extractedRequirements) {
            $prompt .= "\n\nKey information gathered so far: " . json_encode($extractedRequirements, JSON_PRETTY_PRINT);
        }

        $prompt .= "\n\nAsk your next question to continue the conversation naturally.";

        return $prompt;
    }

    /**
     * Get turn-aware guidance for the conversation
     *
     * @param int $turnNumber
     * @return string|null
     */
    private function getTurnGuidance(int $turnNumber): ?string
    {
        if ($turnNumber >= 10 && $turnNumber < 12) {
            return "IMPORTANT: We are at turn {$turnNumber}. You MUST start wrapping up the conversation now. Say something like: \"Let's start wrapping up... I think I have enough to create a solid plan for you. Would you like me to summarize what we've discussed?\" Do not ask new discovery questions.";
        }
        
        if ($turnNumber >= 7 && $turnNumber < 10) {
            return "Note: We're making great progress! We're at turn {$turnNumber}. Start consolidating the information gathered and prepare to offer a summary soon. Focus on confirming understanding rather than opening new topics.";
        }

        if ($turnNumber >= 12) {
            return "CRITICAL: We have reached the turn limit. You MUST now transition to summarizing. Say: \"I have a great understanding of your project now. Let me summarize what I've heard and propose a plan for you.\" Do NOT ask any more questions.";
        }

        return null;
    }

    /**
     * Get Stage 2 prompt (Requirement Extractor)
     *
     * @param array $conversationHistory
     * @return string
     */
    public function getStage2Prompt(array $conversationHistory): string
    {
        $transcript = $this->formatConversationTranscript($conversationHistory);
        
        return "Extract structured requirements from this conversation.

Output ONLY valid JSON matching this schema:
{
  \"project\": {
    \"name\": \"string\",
    \"vision\": \"string\",
    \"problem_statement\": \"string\"
  },
  \"users\": {
    \"primary_users\": \"string\",
    \"user_count_estimate\": \"string\",
    \"user_locations\": \"string\"
  },
  \"features\": {
    \"core_features\": [\"string\"],
    \"nice_to_have\": [\"string\"],
    \"integrations\": [\"string\"]
  },
  \"technical\": {
    \"existing_systems\": [\"string\"],
    \"scale_expectations\": \"string\",
    \"performance_critical\": [\"string\"],
    \"security_requirements\": [\"string\"]
  },
  \"timeline\": {
    \"desired_launch\": \"string\",
    \"phases\": \"string\"
  },
  \"constraints\": {
    \"budget\": \"string\",
    \"team_size\": \"string\",
    \"other\": [\"string\"]
  },
  \"goals_and_success_metrics\": [\"string\"],
  \"complexity\": \"Simple|Medium|Complex\",
  \"confidence\": \"low|medium|high\",
  \"gaps\": [\"string - areas needing clarification\"]
}

Conversation:
{$transcript}

Extract requirements. Be precise. Only include information explicitly stated by the user.";
    }

    /**
     * Generate user-facing summary (no tech/cost details)
     *
     * @param array $structuredRequirements
     * @return string
     */
    public function generateUserSummary(array $structuredRequirements): string
    {
        $requirements = json_encode($structuredRequirements, JSON_PRETTY_PRINT);
        
        return "Create a user-friendly, non-technical summary of this project plan.

Input requirements:
{$requirements}

Rules:
- NO technical jargon, acronyms, or developer terminology
- NO cost estimates or specific pricing
- NO timeline details or week ranges
- NO architecture recommendations or tech stack details
- NO team composition or hiring details
- INCLUDE: Project overview and vision
- INCLUDE: Goals and what success looks like
- INCLUDE: High-level features in plain language
- INCLUDE: Complexity assessment (Simple/Medium/Complex)
- INCLUDE: A friendly call-to-action like \"Our team will follow up with you soon to discuss next steps!\"
- Use warm, encouraging language
- Keep to 400-600 words

Output as JSON:
{
  \"project_overview\": \"string\",
  \"goals_and_success\": [\"string\"],
  \"high_level_features\": [\"string\"],
  \"complexity\": \"Simple|Medium|Complex\",
  \"next_steps_message\": \"string\"
}";
    }

    /**
     * Generate admin plan (full technical details)
     *
     * @param array $structuredRequirements
     * @return string
     */
    public function generateAdminPlan(array $structuredRequirements): string
    {
        $requirements = json_encode($structuredRequirements, JSON_PRETTY_PRINT);
        
        return "Create a detailed technical implementation plan based on these requirements.

Input requirements:
{$requirements}

Output ONLY valid JSON with this structure:
{
  \"executive_summary\": \"string\",
  \"full_technical_breakdown\": {
    \"description\": \"string\",
    \"key_components\": [\"string\"]
  },
  \"architecture_recommendations\": {
    \"pattern\": \"string\",
    \"rationale\": \"string\",
    \"diagrams\": \"string\"
  },
  \"tech_stack_details\": {
    \"backend\": { \"framework\": \"string\", \"language\": \"string\", \"rationale\": \"string\" },
    \"frontend\": { \"framework\": \"string\", \"rationale\": \"string\" },
    \"database\": { \"primary\": \"string\", \"cache\": \"string\", \"rationale\": \"string\" },
    \"deployment\": { \"hosting\": \"string\", \"infrastructure\": \"string\" }
  },
  \"timeline_week_ranges\": {
    \"total_weeks\": \"string\",
    \"phases\": [
      {
        \"phase\": 1,
        \"name\": \"string\",
        \"duration\": \"string\",
        \"deliverables\": [\"string\"]
      }
    ]
  },
  \"cost_estimates\": {
    \"development\": { \"hours\": 0, \"rate_range\": \"string\", \"subtotal_range\": \"string\" },
    \"infrastructure_monthly\": \"string\",
    \"third_party_services\": [{ \"service\": \"string\", \"cost\": \"string\" }],
    \"total_estimate_range\": \"string\",
    \"assumptions\": [\"string\"]
  },
  \"risk_assessment\": [
    { \"risk\": \"string\", \"impact\": \"high|medium|low\", \"mitigation\": \"string\" }
  ],
  \"recommendations\": {
    \"architectural_decisions\": [\"string\"],
    \"team_composition\": \"string\",
    \"prioritization\": [\"string\"]
  }
}

Be realistic about timelines and costs. Include all assumptions.";
    }

    /**
     * Format conversation history into a readable transcript
     *
     * @param array $conversationHistory
     * @return string
     */
    private function formatConversationTranscript(array $conversationHistory): string
    {
        $transcript = "";
        foreach ($conversationHistory as $turn) {
            $role = ucfirst($turn['role']);
            $transcript .= "{$role}: {$turn['content']}\n\n";
        }
        return trim($transcript);
    }

    /**
     * Determine conversation stage based on turn number
     *
     * @param int $turnNumber
     * @return string
     */
    private function determineStage(int $turnNumber): string
    {
        if ($turnNumber <= 2) {
            return 'Early - Vision & Goals';
        } elseif ($turnNumber <= 5) {
            return 'Mid - Core Features & Scope';
        } elseif ($turnNumber <= 8) {
            return 'Mid-Late - Technical Context';
        } elseif ($turnNumber <= 11) {
            return 'Late - Timeline & Budget';
        } else {
            return 'Final - Confirmation & Plan Generation';
        }
    }

    /**
     * Parse JSON response from LLM
     *
     * @param string $response
     * @return array|false
     */
    public function parseJsonResponse(string $response): array|false
    {
        // Try to extract JSON from the response
        if (preg_match('/\{[\s\S]*\}/', $response, $matches)) {
            return json_decode($matches[0], true);
        }

        return json_decode($response, true);
    }
}
