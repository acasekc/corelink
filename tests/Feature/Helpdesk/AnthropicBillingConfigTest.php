<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Enums\Helpdesk\OverageMode;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use App\Models\Helpdesk\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnthropicBillingConfigTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $nonAdmin;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->nonAdmin = User::factory()->create([
            'is_admin' => false,
        ]);

        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
        ]);
    }

    public function test_admin_can_view_empty_anthropic_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config");

        $response->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_admin_can_create_anthropic_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'api_key_name' => 'Production Key',
                'api_key' => 'sk-ant-test-key-12345',
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 10.00,
                'overage_mode' => 'silent',
                'notification_emails' => [],
                'cycle_start_day' => 1,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.api_key_name', 'Production Key')
            ->assertJsonPath('data.plan_tier', 'starter')
            ->assertJsonPath('data.included_allowance', '50.00')
            ->assertJsonPath('data.grace_threshold', '75.00')
            ->assertJsonPath('data.markup_percentage', '10.00')
            ->assertJsonPath('data.overage_mode', 'silent')
            ->assertJsonPath('data.key_status', 'active')
            ->assertJsonPath('data.cycle_start_day', 1)
            ->assertJsonPath('data.has_api_key', true);

        $this->assertDatabaseHas('helpdesk_anthropic_api_configs', [
            'project_id' => $this->project->id,
            'plan_tier' => 'starter',
        ]);
    }

    public function test_admin_can_update_anthropic_config(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_name' => 'Old Key',
            'api_key_encrypted' => 'sk-ant-old-key',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'api_key_name' => 'Updated Key',
                'plan_tier' => 'growth',
                'included_allowance' => 100.00,
                'grace_threshold' => 150.00,
                'markup_percentage' => 15.00,
                'overage_mode' => 'proactive',
                'notification_emails' => ['client@example.com'],
                'cycle_start_day' => 15,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.api_key_name', 'Updated Key')
            ->assertJsonPath('data.plan_tier', 'growth')
            ->assertJsonPath('data.included_allowance', '100.00')
            ->assertJsonPath('data.overage_mode', 'proactive')
            ->assertJsonPath('data.has_api_key', true);

        // API key should not have changed since we didn't send a new one
        $config->refresh();
        $this->assertEquals('sk-ant-old-key', $config->api_key_encrypted);
    }

    public function test_admin_can_update_api_key(): void
    {
        AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-old-key',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'api_key' => 'sk-ant-new-key',
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 0,
                'overage_mode' => 'silent',
                'cycle_start_day' => 1,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.has_api_key', true);

        $config = AnthropicApiConfig::where('project_id', $this->project->id)->first();
        $this->assertEquals('sk-ant-new-key', $config->api_key_encrypted);
    }

    public function test_grace_threshold_must_be_gte_included_allowance(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'plan_tier' => 'starter',
                'included_allowance' => 100.00,
                'grace_threshold' => 50.00,
                'markup_percentage' => 0,
                'overage_mode' => 'silent',
                'cycle_start_day' => 1,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['grace_threshold']);
    }

    public function test_cycle_start_day_must_be_between_1_and_28(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 0,
                'overage_mode' => 'silent',
                'cycle_start_day' => 31,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['cycle_start_day']);
    }

    public function test_overage_mode_must_be_valid_enum(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 0,
                'overage_mode' => 'invalid_mode',
                'cycle_start_day' => 1,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['overage_mode']);
    }

    public function test_non_admin_cannot_access_anthropic_config(): void
    {
        $response = $this->actingAs($this->nonAdmin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config");

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_create_anthropic_config(): void
    {
        $response = $this->actingAs($this->nonAdmin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 0,
                'overage_mode' => 'silent',
                'cycle_start_day' => 1,
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_toggle_key_status(): void
    {
        AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
            'key_status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/toggle-key", [
                'status' => 'disabled',
                'reason' => 'Overdue payment',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.key_status', 'disabled')
            ->assertJsonPath('data.disabled_reason', 'Overdue payment');
    }

    public function test_admin_can_re_enable_key(): void
    {
        AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
            'key_status' => 'disabled',
            'disabled_reason' => 'Grace exceeded',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/toggle-key", [
                'status' => 'active',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.key_status', 'active')
            ->assertJsonPath('data.disabled_reason', null);
    }

    public function test_toggle_key_requires_valid_status(): void
    {
        AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/toggle-key", [
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_toggle_key_returns_404_when_no_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/toggle-key", [
                'status' => 'active',
            ]);

        $response->assertNotFound();
    }

    public function test_admin_can_view_usage_logs(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        AnthropicUsageLog::create([
            'anthropic_config_id' => $config->id,
            'synced_at' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'tokens_input' => 100000,
            'tokens_output' => 50000,
            'cost_cents' => 250,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-usage-logs");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.tokens_input', 100000)
            ->assertJsonPath('data.0.tokens_output', 50000)
            ->assertJsonPath('data.0.cost_cents', 250)
            ->assertJsonPath('data.0.cost_dollars', 2.5)
            ->assertJsonPath('data.0.total_tokens', 150000);
    }

    public function test_usage_logs_empty_when_no_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-usage-logs");

        $response->assertOk()
            ->assertJson([
                'data' => [],
                'meta' => ['total' => 0],
            ]);
    }

    public function test_model_helper_methods(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test-key-12345',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 20.00,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
            'cycle_usage_cents' => 6000,
            'key_status' => 'active',
        ]);

        $this->assertEquals(60.00, $config->cycleUsageDollars());
        $this->assertEquals(5000, $config->includedAllowanceCents());
        $this->assertEquals(7500, $config->graceThresholdCents());
        $this->assertEquals(0, $config->allowanceRemainingCents());
        $this->assertTrue($config->isOverAllowance());
        $this->assertFalse($config->isOverGraceThreshold());
        $this->assertEquals(1000, $config->overageCents());
        $this->assertEquals(1200, $config->overageWithMarkupCents()); // 1000 * 1.20
        $this->assertTrue($config->isActive());
        $this->assertFalse($config->isInGrace());
        $this->assertFalse($config->isDisabled());
        $this->assertFalse($config->isSuspended());
    }

    public function test_masked_api_key(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-api03-very-long-key-here-12345',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $masked = $config->maskedApiKey();
        $this->assertNotNull($masked);
        $this->assertStringStartsWith('sk-ant-a', $masked);
        $this->assertStringEndsWith('2345', $masked);
        $this->assertStringContainsString('•', $masked);
    }

    public function test_notification_emails_validation(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config", [
                'plan_tier' => 'starter',
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 0,
                'overage_mode' => 'proactive',
                'notification_emails' => ['not-an-email'],
                'cycle_start_day' => 1,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['notification_emails.0']);
    }

    public function test_project_has_anthropic_config_relationship(): void
    {
        $this->assertNull($this->project->anthropicApiConfig);

        AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $this->project->refresh();
        $this->assertNotNull($this->project->anthropicApiConfig);
        $this->assertInstanceOf(AnthropicApiConfig::class, $this->project->anthropicApiConfig);
    }

    public function test_config_has_usage_logs_relationship(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        $this->assertCount(0, $config->usageLogs);

        AnthropicUsageLog::create([
            'anthropic_config_id' => $config->id,
            'synced_at' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'tokens_input' => 1000,
            'tokens_output' => 500,
            'cost_cents' => 10,
        ]);

        $config->refresh();
        $this->assertCount(1, $config->usageLogs);
    }

    public function test_enum_casts_work_correctly(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'key_status' => 'active',
            'cycle_start_day' => 1,
        ]);

        $this->assertInstanceOf(OverageMode::class, $config->overage_mode);
        $this->assertInstanceOf(ApiKeyStatus::class, $config->key_status);
        $this->assertEquals(OverageMode::Silent, $config->overage_mode);
        $this->assertEquals(ApiKeyStatus::Active, $config->key_status);
    }

    public function test_deleting_project_cascades_to_config(): void
    {
        $config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'cycle_start_day' => 1,
        ]);

        AnthropicUsageLog::create([
            'anthropic_config_id' => $config->id,
            'synced_at' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'tokens_input' => 1000,
            'tokens_output' => 500,
            'cost_cents' => 10,
        ]);

        $this->project->forceDelete();

        $this->assertDatabaseMissing('helpdesk_anthropic_api_configs', ['id' => $config->id]);
        $this->assertDatabaseMissing('helpdesk_anthropic_usage_logs', ['anthropic_config_id' => $config->id]);
    }
}
