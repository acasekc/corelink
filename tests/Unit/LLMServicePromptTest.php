<?php

namespace Tests\Unit;

use App\Services\LLMService;
use Tests\TestCase;

class LLMServicePromptTest extends TestCase
{
    public function test_stage_one_prompt_includes_off_topic_guardrails_stack_defaults_and_reference_rules(): void
    {
        $service = new LLMService;

        $prompt = $service->getStage1Prompt(3, null, [[
            'url' => 'https://example.com',
            'source_type' => 'reference_example',
            'status' => 'analyzed',
            'title' => 'Example',
            'summary' => 'Observed patterns: Authentication or account area.',
        ]], [
            'covered_topics' => ['business_goal', 'users'],
            'missing_topics' => ['integrations'],
            'ready_for_wrap_up' => false,
        ]);

        $this->assertStringContainsString('not to be a general-purpose chatbot', $prompt);
        $this->assertStringContainsString('Laravel + Inertia + React + Tailwind + MySQL', $prompt);
        $this->assertStringContainsString('React Native', $prompt);
        $this->assertStringContainsString('Treat website or domain references as observational context only', $prompt);
        $this->assertStringContainsString('Coverage tracking:', $prompt);
        $this->assertStringContainsString('Missing topics: integrations', $prompt);
        $this->assertStringContainsString('Ready for wrap-up: no', $prompt);
    }

    public function test_stage_two_prompt_includes_estimation_fields_for_scope_and_risk(): void
    {
        $service = new LLMService;

        $prompt = $service->getStage2Prompt([
            ['role' => 'user', 'content' => 'We need a client portal.'],
        ]);

        $this->assertStringContainsString('roles_and_permissions', $prompt);
        $this->assertStringContainsString('admin_workflows', $prompt);
        $this->assertStringContainsString('estimate_blockers', $prompt);
        $this->assertStringContainsString('assumptions_required', $prompt);
    }

    public function test_admin_plan_prompt_includes_default_stack_and_confidence_requirements(): void
    {
        $service = new LLMService;

        $prompt = $service->generateAdminPlan([
            'project' => ['name' => 'Test'],
        ]);

        $this->assertStringContainsString('Internal Corelink delivery defaults', $prompt);
        $this->assertStringContainsString('estimate_confidence', $prompt);
        $this->assertStringContainsString('scope_boundaries', $prompt);
        $this->assertStringContainsString('fits_corelink_defaults', $prompt);
    }
}
