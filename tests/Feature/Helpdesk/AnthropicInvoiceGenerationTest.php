<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoiceLineItem;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\ProjectInvoiceSettings;
use App\Models\User;
use App\Services\Helpdesk\AnthropicBillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnthropicInvoiceGenerationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    private AnthropicApiConfig $config;

    private AnthropicBillingService $service;

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

        // Ensure invoice settings exist
        ProjectInvoiceSettings::getOrCreateForProject($this->project->id);

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
            'cycle_usage_cents' => 3000, // $30
            'notification_emails' => ['client@example.com'],
        ]);

        $this->service = app(AnthropicBillingService::class);
    }

    // ========================================
    // Invoice Generation — Service
    // ========================================

    public function test_generates_invoice_with_included_allowance_only(): void
    {
        // Usage $30 — within $50 allowance, no overage
        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        $this->assertInstanceOf(Invoice::class, $invoice);
        $this->assertEquals(Invoice::STATUS_DRAFT, $invoice->status);
        $this->assertEquals($this->project->id, $invoice->project_id);

        $lineItems = $invoice->lineItems;
        $this->assertCount(1, $lineItems);

        $firstItem = $lineItems->first();
        $this->assertEquals(InvoiceLineItem::TYPE_CUSTOM, $firstItem->type);
        $this->assertStringContainsString('Included Allowance', $firstItem->description);
        $this->assertEquals('1.00', $firstItem->quantity);
        $this->assertEquals('50.00', $firstItem->rate);
    }

    public function test_generates_invoice_with_overage_line_item(): void
    {
        // Usage $60 — $10 over $50 allowance
        $this->config->update(['cycle_usage_cents' => 6000]);

        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);

        $lineItems = $invoice->lineItems;
        $this->assertCount(2, $lineItems);

        // First item: included allowance
        $this->assertStringContainsString('Included Allowance', $lineItems[0]->description);
        $this->assertEquals('50.00', $lineItems[0]->rate);

        // Second item: overage with markup ($10 * 1.10 = $11.00)
        $this->assertStringContainsString('Overage', $lineItems[1]->description);
        $this->assertStringContainsString('10', $lineItems[1]->description); // markup percentage
        $this->assertEquals('11.00', $lineItems[1]->rate);
    }

    public function test_invoice_total_calculated_correctly(): void
    {
        // Usage $60 — $50 allowance + $11 overage (10% markup on $10)
        $this->config->update(['cycle_usage_cents' => 6000]);

        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        $this->assertEquals('61.00', $invoice->subtotal);
        $this->assertEquals('61.00', $invoice->total);
    }

    public function test_invoice_total_with_tax_rate(): void
    {
        // Set up invoice settings with tax
        $settings = ProjectInvoiceSettings::where('project_id', $this->project->id)->first();
        $settings->update(['default_tax_rate' => 8.00]);

        $this->config->update(['cycle_usage_cents' => 6000]);

        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        // $61.00 subtotal * 8% tax = $4.88 tax → $65.88 total
        $this->assertEquals('61.00', $invoice->subtotal);
        $this->assertEquals('4.88', $invoice->tax_amount);
        $this->assertEquals('65.88', $invoice->total);
    }

    public function test_no_invoice_generated_for_zero_usage(): void
    {
        $this->config->update(['cycle_usage_cents' => 0]);

        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNull($invoice);
        $this->assertEquals(0, Invoice::count());
    }

    public function test_invoice_has_correct_billing_info(): void
    {
        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        $this->assertEquals('Test Client Inc.', $invoice->bill_to_name);
        $this->assertEquals('billing@testclient.com', $invoice->bill_to_email);
    }

    public function test_invoice_has_correct_period(): void
    {
        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        $this->assertNotNull($invoice->period_start);
        $this->assertNotNull($invoice->period_end);
        $this->assertEquals(now()->toDateString(), $invoice->period_end->toDateString());
    }

    public function test_invoice_has_valid_invoice_number(): void
    {
        $invoice = $this->service->generateInvoice($this->config);

        $this->assertNotNull($invoice);
        $this->assertNotEmpty($invoice->invoice_number);
        $this->assertStringStartsWith('INV-', $invoice->invoice_number);
    }

    // ========================================
    // Cycle Reset — Service
    // ========================================

    public function test_reset_cycle_zeros_usage(): void
    {
        $this->config->update(['cycle_usage_cents' => 6000]);

        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    public function test_reset_cycle_restores_grace_to_active(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Grace,
            'cycle_usage_cents' => 6000,
        ]);

        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
    }

    public function test_reset_cycle_restores_usage_disabled_to_active(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Usage exceeded grace threshold ($75.00)',
            'cycle_usage_cents' => 8000,
        ]);

        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
        $this->assertNull($this->config->disabled_reason);
        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    public function test_reset_cycle_does_not_restore_manually_disabled(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Manually disabled by admin',
            'cycle_usage_cents' => 3000,
        ]);

        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(ApiKeyStatus::Disabled, $this->config->key_status);
        $this->assertEquals('Manually disabled by admin', $this->config->disabled_reason);
        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    public function test_reset_cycle_does_not_restore_suspended(): void
    {
        $this->config->update([
            'key_status' => ApiKeyStatus::Suspended,
            'cycle_usage_cents' => 3000,
        ]);

        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(ApiKeyStatus::Suspended, $this->config->key_status);
        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    // ========================================
    // Cycle End Date Check
    // ========================================

    public function test_is_cycle_end_date_returns_true_on_matching_day(): void
    {
        $this->config->update(['cycle_start_day' => now()->day]);

        $this->assertTrue($this->service->isCycleEndDate($this->config));
    }

    public function test_is_cycle_end_date_returns_false_on_non_matching_day(): void
    {
        $otherDay = now()->day === 15 ? 16 : 15;
        $this->config->update(['cycle_start_day' => $otherDay]);

        $this->assertFalse($this->service->isCycleEndDate($this->config));
    }

    // ========================================
    // API Endpoints
    // ========================================

    public function test_admin_can_generate_invoice_via_api(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/generate-invoice");

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['invoice_id', 'invoice_number', 'total', 'status'],
            'message',
        ]);

        $this->assertEquals(1, Invoice::count());
    }

    public function test_generate_invoice_returns_422_for_zero_usage(): void
    {
        $this->config->update(['cycle_usage_cents' => 0]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/generate-invoice");

        $response->assertStatus(422);
    }

    public function test_generate_invoice_returns_404_without_config(): void
    {
        $otherProject = Project::factory()->create([
            'name' => 'Other Project',
            'slug' => 'other-project',
            'ticket_prefix' => 'OTH',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$otherProject->id}/anthropic-config/generate-invoice");

        $response->assertStatus(404);
    }

    public function test_non_admin_cannot_generate_invoice(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/generate-invoice");

        $response->assertStatus(403);
    }

    public function test_admin_can_reset_cycle_via_api(): void
    {
        $this->config->update(['cycle_usage_cents' => 6000]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/reset-cycle");

        $response->assertStatus(200);
        $response->assertJsonPath('data.cycle_usage_cents', 0);

        $this->config->refresh();
        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    public function test_reset_cycle_returns_404_without_config(): void
    {
        $otherProject = Project::factory()->create([
            'name' => 'Other Project',
            'slug' => 'other-project',
            'ticket_prefix' => 'OTH',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$otherProject->id}/anthropic-config/reset-cycle");

        $response->assertStatus(404);
    }

    public function test_non_admin_cannot_reset_cycle(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/reset-cycle");

        $response->assertStatus(403);
    }

    // ========================================
    // Artisan Commands
    // ========================================

    public function test_generate_invoices_command_with_force(): void
    {
        $this->artisan('anthropic:generate-invoices', ['--project' => $this->project->id, '--force' => true, '--no-interaction' => true])
            ->assertExitCode(0);

        $this->assertEquals(1, Invoice::count());
    }

    public function test_generate_invoices_command_skips_non_cycle_end(): void
    {
        // Set cycle day to something other than today
        $otherDay = now()->day === 15 ? 16 : 15;
        $this->config->update(['cycle_start_day' => $otherDay]);

        $this->artisan('anthropic:generate-invoices', ['--project' => $this->project->id, '--no-interaction' => true])
            ->assertExitCode(0);

        $this->assertEquals(0, Invoice::count());
    }

    public function test_generate_invoices_command_fails_for_missing_project(): void
    {
        $this->artisan('anthropic:generate-invoices', ['--project' => 99999, '--force' => true, '--no-interaction' => true])
            ->assertExitCode(1);
    }

    public function test_reset_cycle_command(): void
    {
        $this->config->update(['cycle_usage_cents' => 5000]);

        $this->artisan('anthropic:reset-cycle', ['--project' => $this->project->id])
            ->assertExitCode(0);

        $this->config->refresh();
        $this->assertEquals(0, $this->config->cycle_usage_cents);
    }

    public function test_reset_cycle_command_requires_project(): void
    {
        $this->artisan('anthropic:reset-cycle')
            ->assertExitCode(1);
    }

    public function test_reset_cycle_command_fails_for_missing_project(): void
    {
        $this->artisan('anthropic:reset-cycle', ['--project' => 99999])
            ->assertExitCode(1);
    }

    // ========================================
    // Full Workflow: Generate + Reset
    // ========================================

    public function test_full_billing_cycle_workflow(): void
    {
        // Usage at $60 with overage
        $this->config->update([
            'cycle_usage_cents' => 6000,
            'key_status' => ApiKeyStatus::Grace,
        ]);

        // Generate invoice
        $invoice = $this->service->generateInvoice($this->config);
        $this->assertNotNull($invoice);
        $this->assertCount(2, $invoice->lineItems);

        // Reset cycle
        $this->service->resetCycle($this->config);
        $this->config->refresh();

        $this->assertEquals(0, $this->config->cycle_usage_cents);
        $this->assertEquals(ApiKeyStatus::Active, $this->config->key_status);
    }
}
