<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Mail\Helpdesk\AnthropicWeeklyDigest;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\ProjectInvoiceSettings;
use App\Models\User;
use App\Services\Helpdesk\AnthropicBillingService;
use App\Services\Helpdesk\AnthropicUsageSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AnthropicNotificationsPolishTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    private AnthropicApiConfig $config;

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
            'client_name' => 'Test Client Inc.',
            'client_email' => 'billing@testclient.com',
        ]);

        ProjectInvoiceSettings::getOrCreateForProject($this->project->id);

        $this->config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test-key-12345',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 10.00,
            'overage_mode' => 'proactive',
            'key_status' => 'active',
            'cycle_start_day' => 1,
            'cycle_usage_cents' => 3000,
            'notification_emails' => ['client@example.com'],
        ]);
    }

    // ========================================
    // Weekly Digest Command
    // ========================================

    public function test_weekly_digest_sends_email_to_admin(): void
    {
        Mail::fake();

        config(['mail.admin_address' => 'admin@corelink.test']);

        $this->artisan('anthropic:weekly-digest')
            ->expectsOutputToContain('Weekly digest sent')
            ->assertSuccessful();

        Mail::assertSent(AnthropicWeeklyDigest::class, function ($mail) {
            return $mail->hasTo('admin@corelink.test');
        });
    }

    public function test_weekly_digest_includes_all_project_summaries(): void
    {
        Mail::fake();

        config(['mail.admin_address' => 'admin@corelink.test']);

        // Create a second project with config
        $project2 = Project::factory()->create([
            'name' => 'Second Project',
            'slug' => 'second-project',
            'ticket_prefix' => 'SEC',
        ]);

        AnthropicApiConfig::create([
            'project_id' => $project2->id,
            'api_key_encrypted' => 'sk-ant-test-key-67890',
            'plan_tier' => 'pro',
            'included_allowance' => 100.00,
            'grace_threshold' => 150.00,
            'markup_percentage' => 15.00,
            'overage_mode' => 'silent',
            'key_status' => 'active',
            'cycle_start_day' => 15,
            'cycle_usage_cents' => 8000,
        ]);

        $this->artisan('anthropic:weekly-digest')
            ->expectsOutputToContain('2 projects')
            ->assertSuccessful();

        Mail::assertSent(AnthropicWeeklyDigest::class, 1);
    }

    public function test_weekly_digest_succeeds_with_no_configs(): void
    {
        Mail::fake();

        AnthropicApiConfig::query()->delete();

        $this->artisan('anthropic:weekly-digest')
            ->expectsOutputToContain('No Anthropic API configs found')
            ->assertSuccessful();

        Mail::assertNotSent(AnthropicWeeklyDigest::class);
    }

    public function test_weekly_digest_fails_without_admin_email(): void
    {
        Mail::fake();

        config(['mail.admin_address' => null]);
        config(['mail.from.address' => null]);

        $this->artisan('anthropic:weekly-digest')
            ->expectsOutputToContain('No admin email configured')
            ->assertFailed();

        Mail::assertNotSent(AnthropicWeeklyDigest::class);
    }

    // ========================================
    // Disable Key Command
    // ========================================

    public function test_disable_key_command_disables_active_key(): void
    {
        $this->artisan('anthropic:disable-key', [
            '--project' => $this->project->id,
            '--reason' => 'Payment overdue',
        ])
            ->expectsOutputToContain('Key disabled')
            ->assertSuccessful();

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);
        $this->assertEquals('Payment overdue', $this->config->disabled_reason);
    }

    public function test_disable_key_command_uses_default_reason(): void
    {
        $this->artisan('anthropic:disable-key', [
            '--project' => $this->project->id,
        ])
            ->assertSuccessful();

        $this->config->refresh();
        $this->assertEquals('Manually disabled via CLI', $this->config->disabled_reason);
    }

    public function test_disable_key_command_already_disabled(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Already disabled',
        ]);

        $this->artisan('anthropic:disable-key', [
            '--project' => $this->project->id,
        ])
            ->expectsOutputToContain('already disabled')
            ->assertSuccessful();
    }

    public function test_disable_key_command_requires_project_option(): void
    {
        $this->artisan('anthropic:disable-key')
            ->expectsOutputToContain('--project option is required')
            ->assertFailed();
    }

    public function test_disable_key_command_fails_for_missing_config(): void
    {
        $this->artisan('anthropic:disable-key', [
            '--project' => 99999,
        ])
            ->expectsOutputToContain('No Anthropic API config found')
            ->assertFailed();
    }

    // ========================================
    // Enable Key Command
    // ========================================

    public function test_enable_key_command_enables_disabled_key(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Test disable',
        ]);

        $this->artisan('anthropic:enable-key', [
            '--project' => $this->project->id,
        ])
            ->expectsOutputToContain('Key re-enabled')
            ->assertSuccessful();

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
        $this->assertNull($this->config->disabled_reason);
    }

    public function test_enable_key_command_enables_suspended_key(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Suspended,
            'disabled_reason' => 'Overdue invoice',
        ]);

        $this->artisan('anthropic:enable-key', [
            '--project' => $this->project->id,
        ])
            ->expectsOutputToContain('Key re-enabled')
            ->assertSuccessful();

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
        $this->assertNull($this->config->disabled_reason);
    }

    public function test_enable_key_command_already_active(): void
    {
        $this->artisan('anthropic:enable-key', [
            '--project' => $this->project->id,
        ])
            ->expectsOutputToContain('already active')
            ->assertSuccessful();
    }

    public function test_enable_key_command_requires_project_option(): void
    {
        $this->artisan('anthropic:enable-key')
            ->expectsOutputToContain('--project option is required')
            ->assertFailed();
    }

    public function test_enable_key_command_fails_for_missing_config(): void
    {
        $this->artisan('anthropic:enable-key', [
            '--project' => 99999,
        ])
            ->expectsOutputToContain('No Anthropic API config found')
            ->assertFailed();
    }

    // ========================================
    // Overdue Invoice → Suspend Key
    // ========================================

    public function test_overdue_invoice_suspends_active_key(): void
    {
        $service = app(AnthropicBillingService::class);

        Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-TEST-001',
            'status' => Invoice::STATUS_OVERDUE,
            'bill_to_name' => 'Test Client',
            'issue_date' => now()->subDays(30),
            'due_date' => now()->subDays(15),
            'subtotal' => 100,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 0,
        ]);

        $suspended = $service->checkOverdueInvoices($this->config);

        $this->assertTrue($suspended);
        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Suspended, $this->config->key_status);
        $this->assertEquals('Suspended due to overdue invoice', $this->config->disabled_reason);
    }

    public function test_no_overdue_invoice_keeps_key_active(): void
    {
        $service = app(AnthropicBillingService::class);

        // Create paid invoice (not overdue)
        Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-TEST-002',
            'status' => Invoice::STATUS_PAID,
            'bill_to_name' => 'Test Client',
            'issue_date' => now()->subDays(30),
            'due_date' => now()->subDays(15),
            'subtotal' => 100,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 100,
        ]);

        $suspended = $service->checkOverdueInvoices($this->config);

        $this->assertFalse($suspended);
        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
    }

    public function test_already_suspended_key_not_updated_again(): void
    {
        $service = app(AnthropicBillingService::class);

        $this->config->update([
            'key_status' => ApiKeyStatus::Suspended,
            'disabled_reason' => 'Previously suspended',
        ]);

        Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-TEST-003',
            'status' => Invoice::STATUS_OVERDUE,
            'bill_to_name' => 'Test Client',
            'issue_date' => now()->subDays(30),
            'due_date' => now()->subDays(15),
            'subtotal' => 100,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 0,
        ]);

        $suspended = $service->checkOverdueInvoices($this->config);

        $this->assertFalse($suspended);
        // Original reason preserved
        $this->config->refresh();
        $this->assertEquals('Previously suspended', $this->config->disabled_reason);
    }

    public function test_sync_all_skips_projects_with_overdue_invoices(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response(['data' => []], 200),
        ]);

        Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-TEST-004',
            'status' => Invoice::STATUS_OVERDUE,
            'bill_to_name' => 'Test Client',
            'issue_date' => now()->subDays(30),
            'due_date' => now()->subDays(15),
            'subtotal' => 100,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 0,
        ]);

        $service = app(AnthropicUsageSyncService::class);
        $logs = $service->syncAll();

        // Should have been skipped due to overdue invoice
        $this->assertCount(0, $logs);

        $this->config->refresh();
        $this->assertEquals(ApiKeyStatus::Suspended, $this->config->key_status);
    }

    // ========================================
    // Weekly Digest Mailable
    // ========================================

    public function test_weekly_digest_mailable_has_correct_subject(): void
    {
        $summaries = collect([
            [
                'project_name' => 'Test Project',
                'status' => 'active',
                'plan_tier' => 'starter',
                'usage_dollars' => 30.00,
                'allowance' => 50.00,
                'grace_threshold' => 75.00,
                'usage_percent' => 60,
                'overage_dollars' => 0,
                'overage_with_markup_dollars' => 0,
                'markup_percentage' => 10.0,
                'last_synced' => '2 hours ago',
            ],
        ]);

        $mailable = new AnthropicWeeklyDigest($summaries);

        $mailable->assertHasSubject('Anthropic API — Weekly Usage Digest');
    }

    public function test_weekly_digest_mailable_renders_view(): void
    {
        $summaries = collect([
            [
                'project_name' => 'Alpha Project',
                'status' => 'active',
                'plan_tier' => 'pro',
                'usage_dollars' => 80.00,
                'allowance' => 100.00,
                'grace_threshold' => 150.00,
                'usage_percent' => 80,
                'overage_dollars' => 0,
                'overage_with_markup_dollars' => 0,
                'markup_percentage' => 15.0,
                'last_synced' => '1 hour ago',
            ],
            [
                'project_name' => 'Beta Project',
                'status' => 'grace',
                'plan_tier' => 'starter',
                'usage_dollars' => 60.00,
                'allowance' => 50.00,
                'grace_threshold' => 75.00,
                'usage_percent' => 120,
                'overage_dollars' => 10.00,
                'overage_with_markup_dollars' => 11.00,
                'markup_percentage' => 10.0,
                'last_synced' => '3 hours ago',
            ],
        ]);

        $mailable = new AnthropicWeeklyDigest($summaries);
        $rendered = $mailable->render();

        $this->assertStringContainsString('Alpha Project', $rendered);
        $this->assertStringContainsString('Beta Project', $rendered);
        $this->assertStringContainsString('Weekly Usage Digest', $rendered);
    }
}
