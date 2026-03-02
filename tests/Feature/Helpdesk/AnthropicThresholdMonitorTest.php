<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Enums\Helpdesk\OverageMode;
use App\Events\Helpdesk\UsageSynced;
use App\Listeners\Helpdesk\EvaluateUsageThresholds;
use App\Mail\Helpdesk\AnthropicUsageAdminAlert;
use App\Mail\Helpdesk\AnthropicUsageLimitReached;
use App\Mail\Helpdesk\AnthropicUsageWarning;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use App\Models\Helpdesk\Project;
use App\Models\User;
use App\Services\Helpdesk\AnthropicThresholdMonitorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AnthropicThresholdMonitorTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    private AnthropicApiConfig $config;

    private AnthropicThresholdMonitorService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
        ]);

        $this->config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test-key-12345',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,   // 5000 cents
            'grace_threshold' => 75.00,       // 7500 cents
            'markup_percentage' => 10.00,
            'overage_mode' => 'proactive',
            'key_status' => 'active',
            'cycle_start_day' => 1,
            'cycle_usage_cents' => 0,
            'notification_emails' => ['client@example.com'],
        ]);

        $this->service = app(AnthropicThresholdMonitorService::class);
    }

    // ========================================
    // Within Allowance — Stays Active
    // ========================================

    public function test_within_allowance_keeps_active_status(): void
    {
        Mail::fake();

        $this->config->update(['cycle_usage_cents' => 3000]); // $30 < $50 allowance

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);

        Mail::assertNothingSent();
    }

    public function test_within_allowance_at_exactly_allowance_stays_active(): void
    {
        Mail::fake();

        $this->config->update(['cycle_usage_cents' => 5000]); // $50 == $50 allowance

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);

        Mail::assertNothingSent();
    }

    public function test_within_allowance_restores_grace_to_active(): void
    {
        Mail::fake();

        $this->config->update([
            'key_status' => ApiKeyStatus::Grace,
            'cycle_usage_cents' => 3000, // Usage dropped below allowance (e.g. cycle reset)
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
        $this->assertNull($this->config->disabled_reason);
    }

    public function test_within_allowance_does_not_restore_disabled_to_active(): void
    {
        Mail::fake();

        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'cycle_usage_cents' => 3000,
            'disabled_reason' => 'Manually disabled',
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);
        $this->assertEquals('Manually disabled', $this->config->disabled_reason);
    }

    public function test_within_allowance_does_not_restore_suspended_to_active(): void
    {
        Mail::fake();

        $this->config->update([
            'key_status' => ApiKeyStatus::Suspended,
            'cycle_usage_cents' => 3000,
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Suspended, $this->config->key_status);
    }

    // ========================================
    // Over Allowance (Grace Zone) — Proactive Mode
    // ========================================

    public function test_over_allowance_proactive_sets_grace_status(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6000, // $60 — above $50 allowance, below $75 grace
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Grace, $this->config->key_status);
    }

    public function test_over_allowance_proactive_sends_client_warning(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6000,
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageWarning::class, function ($mailable) {
            return $mailable->config->id === $this->config->id;
        });
    }

    public function test_over_allowance_proactive_sends_admin_warning(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6000,
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageAdminAlert::class, function ($mailable) {
            return $mailable->config->id === $this->config->id
                && $mailable->alertType === 'warning';
        });
    }

    public function test_over_allowance_proactive_does_not_re_notify_if_already_in_grace(): void
    {
        Mail::fake();

        $this->config->update([
            'key_status' => ApiKeyStatus::Grace,
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6500, // Still in grace zone
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Grace, $this->config->key_status);

        Mail::assertNothingSent();
    }

    // ========================================
    // Over Allowance (Grace Zone) — Silent Mode
    // ========================================

    public function test_over_allowance_silent_sets_grace_status(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Silent,
            'cycle_usage_cents' => 6000,
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Grace, $this->config->key_status);
    }

    public function test_over_allowance_silent_sends_admin_alert_but_not_client(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Silent,
            'cycle_usage_cents' => 6000,
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageAdminAlert::class, function ($mailable) {
            return $mailable->alertType === 'warning';
        });

        Mail::assertNotSent(AnthropicUsageWarning::class);
    }

    // ========================================
    // Grace Threshold Exceeded — Key Disabled
    // ========================================

    public function test_grace_exceeded_proactive_disables_key(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 7500, // $75 == grace threshold
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);
        $this->assertNotNull($this->config->disabled_reason);
        $this->assertStringContainsString('grace threshold', $this->config->disabled_reason);
    }

    public function test_grace_exceeded_proactive_sends_client_limit_reached(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 8000,
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageLimitReached::class, function ($mailable) {
            return $mailable->config->id === $this->config->id;
        });
    }

    public function test_grace_exceeded_proactive_sends_admin_limit_reached(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 8000,
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageAdminAlert::class, function ($mailable) {
            return $mailable->config->id === $this->config->id
                && $mailable->alertType === 'limit_reached';
        });
    }

    public function test_grace_exceeded_silent_disables_key_and_notifies_admin_only(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Silent,
            'cycle_usage_cents' => 8000,
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);

        Mail::assertSent(AnthropicUsageAdminAlert::class, function ($mailable) {
            return $mailable->alertType === 'limit_reached';
        });

        Mail::assertNotSent(AnthropicUsageLimitReached::class);
        Mail::assertNotSent(AnthropicUsageWarning::class);
    }

    public function test_grace_exceeded_does_not_re_disable_if_already_disabled(): void
    {
        Mail::fake();

        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Already disabled',
            'cycle_usage_cents' => 9000,
        ]);

        $this->service->evaluate($this->config);

        $this->config->refresh();
        $this->assertEquals('Already disabled', $this->config->disabled_reason);

        Mail::assertNothingSent();
    }

    // ========================================
    // No Notification Emails Configured
    // ========================================

    public function test_proactive_with_no_client_emails_only_sends_admin(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6000,
            'notification_emails' => [],
        ]);

        $this->service->evaluate($this->config);

        Mail::assertSent(AnthropicUsageAdminAlert::class);
        Mail::assertNotSent(AnthropicUsageWarning::class);
    }

    // ========================================
    // Listener Integration
    // ========================================

    public function test_listener_delegates_to_service(): void
    {
        Mail::fake();

        $this->config->update([
            'overage_mode' => OverageMode::Proactive,
            'cycle_usage_cents' => 6000,
        ]);

        $log = AnthropicUsageLog::create([
            'anthropic_config_id' => $this->config->id,
            'synced_at' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'tokens_input' => 1000,
            'tokens_output' => 500,
            'cost_cents' => 100,
        ]);

        $event = new UsageSynced($this->config, $log);
        $listener = app(EvaluateUsageThresholds::class);
        $listener->handle($event);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Grace, $this->config->key_status);

        Mail::assertSent(AnthropicUsageWarning::class);
        Mail::assertSent(AnthropicUsageAdminAlert::class);
    }

    // ========================================
    // Status Transition Sequences
    // ========================================

    public function test_full_lifecycle_active_to_grace_to_disabled(): void
    {
        Mail::fake();

        // Step 1: Within allowance — Active
        $this->config->update(['cycle_usage_cents' => 3000]);
        $this->service->evaluate($this->config);
        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);

        // Step 2: Over allowance — Grace
        $this->config->update(['cycle_usage_cents' => 6000]);
        $this->service->evaluate($this->config);
        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Grace, $this->config->key_status);

        // Step 3: Over grace threshold — Disabled
        $this->config->update(['cycle_usage_cents' => 8000]);
        $this->service->evaluate($this->config);
        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);
        $this->assertNotNull($this->config->disabled_reason);
    }

    // ========================================
    // Mailable Content
    // ========================================

    public function test_warning_mailable_has_correct_subject(): void
    {
        $mailable = new AnthropicUsageWarning($this->config);

        $mailable->assertHasSubject("API Usage Warning — {$this->project->name}");
    }

    public function test_limit_reached_mailable_has_correct_subject(): void
    {
        $mailable = new AnthropicUsageLimitReached($this->config);

        $mailable->assertHasSubject("API Usage Limit Reached — {$this->project->name}");
    }

    public function test_admin_alert_warning_has_correct_subject(): void
    {
        $mailable = new AnthropicUsageAdminAlert($this->config, 'warning');

        $mailable->assertHasSubject("[Admin] Anthropic Usage Warning — {$this->project->name}");
    }

    public function test_admin_alert_limit_reached_has_correct_subject(): void
    {
        $mailable = new AnthropicUsageAdminAlert($this->config, 'limit_reached');

        $mailable->assertHasSubject("[Admin] Anthropic LIMIT REACHED — {$this->project->name}");
    }
}
