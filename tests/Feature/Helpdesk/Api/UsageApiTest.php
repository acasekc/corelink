<?php

namespace Tests\Feature\Helpdesk\Api;

use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\OpenAiUsageLog;
use App\Models\Helpdesk\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsageApiTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private string $plainApiKey;

    private ApiKey $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->project = Project::factory()->create([
            'name' => 'Usage Test Project',
            'slug' => 'usage-test-project',
            'ticket_prefix' => 'USE',
            'is_active' => true,
        ]);

        $this->plainApiKey = ApiKey::generateKey();
        $this->apiKey = ApiKey::create([
            'project_id' => $this->project->id,
            'key' => ApiKey::hashKey($this->plainApiKey),
            'name' => 'Usage Key',
            'is_active' => true,
        ]);
    }

    public function test_legacy_project_api_key_can_view_usage_summary(): void
    {
        $response = $this->getJson('/api/helpdesk/v1/usage/summary', $this->headers());

        $response->assertOk()
            ->assertJsonPath('data.project.id', $this->project->id)
            ->assertJsonPath('data.project.slug', 'usage-test-project')
            ->assertJsonPath('data.openai', null)
            ->assertJsonPath('data.anthropic', null);
    }

    public function test_usage_endpoint_rejects_key_without_usage_permission_when_permissions_are_defined(): void
    {
        $this->apiKey->update([
            'permissions' => ['tickets.write'],
        ]);

        $response = $this->getJson('/api/helpdesk/v1/usage/summary', $this->headers());

        $response->assertForbidden()
            ->assertJson([
                'message' => 'API key does not have the required permissions.',
            ]);
    }

    public function test_usage_endpoint_accepts_key_with_usage_permission(): void
    {
        $this->apiKey->update([
            'permissions' => ['usage.read'],
        ]);

        $response = $this->getJson('/api/helpdesk/v1/usage/summary', $this->headers());

        $response->assertOk()
            ->assertJsonPath('data.project.id', $this->project->id);
    }

    public function test_openai_usage_endpoint_returns_config_keys_and_logs(): void
    {
        $this->apiKey->update([
            'permissions' => ['usage.read'],
        ]);

        $config = OpenAiConfig::create([
            'project_id' => $this->project->id,
            'openai_project_id' => 'proj_123',
            'openai_project_name' => 'Usage Project',
            'markup_percentage' => 12.5,
            'billing_cycle_start_day' => 3,
            'cycle_usage_cents' => 125,
            'notification_emails' => ['alerts@example.com'],
            'last_synced_at' => now(),
            'connected_at' => now()->subDay(),
        ]);

        $key = OpenAiApiKey::create([
            'openai_config_id' => $config->id,
            'name' => 'Production',
            'api_key_encrypted' => 'sk-live-openai-key-1234',
            'status' => 'active',
            'max_spend_usd' => 50.00,
            'grace_amount_usd' => 10.00,
            'spend_usd' => 12.50,
            'last_used_at' => now()->subHour(),
        ]);

        OpenAiUsageLog::create([
            'openai_config_id' => $config->id,
            'openai_api_key_id' => $key->id,
            'usage_date' => now()->toDateString(),
            'model' => 'gpt-4o',
            'input_tokens' => 1000,
            'output_tokens' => 500,
            'requests' => 2,
            'cost_usd' => 0.05,
            'cost_cents' => 5,
        ]);

        $response = $this->getJson('/api/helpdesk/v1/usage/openai', $this->headers());

        $response->assertOk()
            ->assertJsonPath('data.config.openai_project_id', 'proj_123')
            ->assertJsonPath('data.config.keys_total', 1)
            ->assertJsonPath('data.keys.0.name', 'Production')
            ->assertJsonPath('data.keys.0.status', 'active')
            ->assertJsonPath('data.logs.0.model', 'gpt-4o')
            ->assertJsonPath('data.logs.0.api_key_name', 'Production')
            ->assertJsonPath('data.logs.0.total_tokens', 1500)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_anthropic_usage_endpoint_returns_config_and_logs(): void
    {
        $this->apiKey->update([
            'permissions' => ['usage.read'],
        ]);

        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_name' => 'Anthropic Prod',
            'api_key_encrypted' => 'sk-ant-api03-secret-key-12345',
            'plan_tier' => 'growth',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 10.00,
            'overage_mode' => 'silent',
            'notification_emails' => ['alerts@example.com'],
            'key_status' => 'active',
            'cycle_start_day' => 5,
            'cycle_usage_cents' => 250,
            'last_synced_at' => now(),
        ]);

        AnthropicUsageLog::create([
            'anthropic_config_id' => $config->id,
            'synced_at' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'tokens_input' => 2000,
            'tokens_output' => 750,
            'cost_cents' => 25,
            'model_breakdown' => [
                'claude-3-5-sonnet' => [
                    'input_tokens' => 2000,
                    'output_tokens' => 750,
                ],
            ],
        ]);

        $response = $this->getJson('/api/helpdesk/v1/usage/anthropic', $this->headers());

        $response->assertOk()
            ->assertJsonPath('data.config.api_key_name', 'Anthropic Prod')
            ->assertJsonPath('data.config.plan_tier', 'growth')
            ->assertJsonPath('data.config.key_status', 'active')
            ->assertJsonPath('data.logs.0.tokens_input', 2000)
            ->assertJsonPath('data.logs.0.tokens_output', 750)
            ->assertJsonPath('data.logs.0.total_tokens', 2750)
            ->assertJsonPath('data.logs.0.cost_dollars', 0.25)
            ->assertJsonPath('meta.total', 1);
    }

    /**
     * @return array<string, string>
     */
    private function headers(): array
    {
        return [
            'X-API-Key' => $this->plainApiKey,
        ];
    }
}
