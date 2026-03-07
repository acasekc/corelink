<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\OpenAiKeyStatus;
use App\Mail\Helpdesk\OpenAiKeyLimitWarning;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\OpenAiUsageLog;
use App\Models\Helpdesk\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OpenAiBillingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $nonAdmin;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->nonAdmin = User::factory()->create(['is_admin' => false]);
        $this->project = Project::factory()->create([
            'name' => 'Widget Co',
            'slug' => 'widget-co',
            'ticket_prefix' => 'WID',
        ]);
    }

    // =====================================================================
    // show
    // =====================================================================

    public function test_admin_can_view_empty_openai_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config");

        $response->assertOk()->assertJson(['data' => null]);
    }

    public function test_non_admin_cannot_view_openai_config(): void
    {
        $response = $this->actingAs($this->nonAdmin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config");

        $response->assertForbidden();
    }

    // =====================================================================
    // connect
    // =====================================================================

    public function test_admin_can_connect_project_to_openai(): void
    {
        Http::fake([
            'api.openai.com/v1/organization/projects' => Http::response([
                'id' => 'proj_abc123',
                'name' => 'Widget Co',
                'status' => 'active',
            ], 201),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/connect");

        $response->assertCreated()
            ->assertJsonPath('data.openai_project_id', 'proj_abc123')
            ->assertJsonPath('data.is_connected', true);

        $this->assertDatabaseHas('helpdesk_openai_configs', [
            'project_id' => $this->project->id,
            'openai_project_id' => 'proj_abc123',
        ]);
    }

    public function test_connect_returns_422_if_already_connected(): void
    {
        $this->makeConfig();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/connect");

        $response->assertUnprocessable();
    }

    // =====================================================================
    // update
    // =====================================================================

    public function test_admin_can_update_openai_billing_settings(): void
    {
        $config = $this->makeConfig();

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config", [
                'markup_percentage' => 15.0,
                'billing_cycle_start_day' => 5,
                'notification_emails' => ['billing@example.com'],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.markup_percentage', '15.00')
            ->assertJsonPath('data.billing_cycle_start_day', 5);

        $this->assertDatabaseHas('helpdesk_openai_configs', [
            'id' => $config->id,
            'markup_percentage' => 15.0,
            'billing_cycle_start_day' => 5,
        ]);
    }

    public function test_update_returns_404_when_no_config_exists(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config", [
                'markup_percentage' => 10.0,
                'billing_cycle_start_day' => 1,
            ]);

        $response->assertNotFound();
    }

    // =====================================================================
    // createKey
    // =====================================================================

    public function test_admin_can_create_api_key(): void
    {
        $config = $this->makeConfig();

        Http::fake([
            'api.openai.com/v1/organization/projects/*/service_accounts' => Http::response([
                'id' => 'sa_def456',
                'name' => 'Production',
                'api_key' => [
                    'id' => 'key_id_xyz',
                    'value' => 'sk-svcacct-supersecretkey',
                ],
            ], 201),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys", [
                'name' => 'Production',
                'max_spend_usd' => 50.00,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Production')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('api_key', 'sk-svcacct-supersecretkey');

        $this->assertDatabaseHas('helpdesk_openai_api_keys', [
            'openai_config_id' => $config->id,
            'name' => 'Production',
            'openai_service_account_id' => 'sa_def456',
            'status' => 'active',
        ]);
    }

    public function test_create_key_returns_422_when_project_not_connected(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys", [
                'name' => 'Test Key',
            ]);

        $response->assertUnprocessable();
    }

    // =====================================================================
    // revokeKey
    // =====================================================================

    public function test_admin_can_revoke_api_key(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);

        Http::fake([
            'api.openai.com/v1/organization/projects/*/service_accounts/*' => Http::response([], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/revoke", [
                'reason' => 'No longer needed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'revoked');

        $this->assertDatabaseHas('helpdesk_openai_api_keys', [
            'id' => $key->id,
            'status' => 'revoked',
            'revoked_reason' => 'No longer needed',
        ]);
    }

    public function test_revoking_key_calls_openai_delete_endpoint(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config, 'sa_to_delete');

        Http::fake([
            'api.openai.com/v1/organization/projects/*/service_accounts/*' => Http::response([], 200),
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/revoke");

        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return $request->method() === 'DELETE'
                && str_contains($request->url(), 'service_accounts/sa_to_delete');
        });
    }

    public function test_revoking_already_revoked_key_returns_422(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);
        $key->update(['status' => OpenAiKeyStatus::Revoked, 'revoked_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/revoke");

        $response->assertUnprocessable();
    }

    // =====================================================================
    // keys
    // =====================================================================

    public function test_admin_can_list_api_keys(): void
    {
        $config = $this->makeConfig();
        $this->makeKey($config, 'sa_1', 'Alpha');
        $this->makeKey($config, 'sa_2', 'Beta');

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys");

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_keys_returns_empty_array_when_no_config(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys");

        $response->assertOk()->assertJson(['data' => []]);
    }

    // =====================================================================
    // sync
    // =====================================================================

    public function test_admin_can_trigger_usage_sync(): void
    {
        $config = $this->makeConfig();

        Http::fake([
            'api.openai.com/v1/organization/usage/completions*' => Http::response([
                'data' => [
                    [
                        'start_time' => now()->startOfDay()->timestamp,
                        'results' => [
                            ['model' => 'gpt-4o', 'input_tokens' => 1000, 'output_tokens' => 500, 'num_model_requests' => 1, 'api_key_id' => null],
                        ],
                    ],
                ],
                'has_more' => false,
            ]),
            'api.openai.com/v1/organization/costs*' => Http::response([
                'data' => [
                    [
                        'results' => [
                            ['amount' => ['value' => 0.05, 'currency' => 'usd'], 'project_id' => 'proj_abc123'],
                        ],
                    ],
                ],
                'has_more' => false,
            ]),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync");

        $response->assertOk();

        $config->refresh();
        $this->assertNotNull($config->last_synced_at);
        $this->assertEquals(5, $config->cycle_usage_cents);
    }

    // =====================================================================
    // generateInvoice
    // =====================================================================

    public function test_admin_can_generate_invoice(): void
    {
        $this->makeConfig(markup: 20.0, cycleUsageCents: 1000);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/generate-invoice");

        $response->assertCreated()->assertJsonStructure(['data' => ['invoice_id', 'invoice_number', 'total']]);
    }

    public function test_generate_invoice_returns_422_when_no_usage(): void
    {
        $this->makeConfig(cycleUsageCents: 0);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/generate-invoice");

        $response->assertUnprocessable();
    }

    // =====================================================================
    // resetCycle
    // =====================================================================

    public function test_admin_can_reset_billing_cycle(): void
    {
        $config = $this->makeConfig(cycleUsageCents: 5000);
        $key = $this->makeKey($config);
        $key->update(['spend_usd' => 25.00]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/reset-cycle");

        $response->assertOk();

        $config->refresh();
        $this->assertEquals(0, $config->cycle_usage_cents);

        $key->refresh();
        $this->assertEquals(0.0, (float) $key->spend_usd);
    }

    // =====================================================================
    // usageLogs
    // =====================================================================

    public function test_admin_can_view_usage_logs(): void
    {
        $config = $this->makeConfig();
        OpenAiUsageLog::create([
            'openai_config_id' => $config->id,
            'usage_date' => now()->toDateString(),
            'model' => 'gpt-4o',
            'input_tokens' => 1000,
            'output_tokens' => 500,
            'requests' => 1,
            'cost_usd' => 0.05,
            'cost_cents' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-usage-logs");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    // =====================================================================
    // updateKey
    // =====================================================================

    public function test_admin_can_update_key_limits(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config, maxSpend: 50.00, grace: 0.00);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}", [
                'max_spend_usd' => 100.00,
                'grace_amount_usd' => 20.00,
            ]);

        $response->assertOk();
        $this->assertEquals(100, $response->json('data.max_spend_usd'));
        $this->assertEquals(20, $response->json('data.grace_amount_usd'));
        $this->assertEquals(120, $response->json('data.grace_threshold_usd'));

        $this->assertDatabaseHas('helpdesk_openai_api_keys', [
            'id' => $key->id,
            'max_spend_usd' => 100.0,
            'grace_amount_usd' => 20.0,
        ]);
    }

    public function test_update_key_auto_reactivates_suspended_key_when_limits_raised(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config, maxSpend: 50.00, grace: 5.00);
        $key->update([
            'status' => OpenAiKeyStatus::Suspended,
            'suspended_at' => now(),
            'spend_usd' => 56.00,  // just over grace threshold of $55
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}", [
                'max_spend_usd' => 100.00,
                'grace_amount_usd' => 20.00,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('helpdesk_openai_api_keys', [
            'id' => $key->id,
            'status' => 'active',
        ]);
    }

    public function test_update_key_does_not_reactivate_if_still_over_new_threshold(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config, maxSpend: 50.00, grace: 5.00);
        $key->update([
            'status' => OpenAiKeyStatus::Suspended,
            'suspended_at' => now(),
            'spend_usd' => 100.00,
        ]);

        // New max=80, grace=10 → threshold=90, still below spend=100
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}", [
                'max_spend_usd' => 80.00,
                'grace_amount_usd' => 10.00,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'suspended');
    }

    public function test_update_key_name(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}", [
                'name' => 'Renamed Key',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Renamed Key');
    }

    // =====================================================================
    // reactivateKey
    // =====================================================================

    public function test_admin_can_manually_reactivate_suspended_key(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);
        $key->update(['status' => OpenAiKeyStatus::Suspended, 'suspended_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/reactivate");

        $response->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('helpdesk_openai_api_keys', [
            'id' => $key->id,
            'status' => 'active',
        ]);

        $key->refresh();
        $this->assertNull($key->suspended_at);
        $this->assertNull($key->grace_notified_at);
    }

    public function test_cannot_reactivate_active_key(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);  // active by default

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/reactivate")
            ->assertUnprocessable();
    }

    public function test_cannot_reactivate_revoked_key(): void
    {
        $config = $this->makeConfig();
        $key = $this->makeKey($config);
        $key->update(['status' => OpenAiKeyStatus::Revoked, 'revoked_at' => now()]);

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys/{$key->id}/reactivate")
            ->assertUnprocessable();
    }

    // =====================================================================
    // Grace / suspend threshold enforcement (via sync)
    // =====================================================================

    /**
     * Sync with costs=0 so allocateKeySpend doesn't overwrite pre-set spend_usd.
     * This lets us test checkMaxSpendLimits with controlled spend values.
     */
    private function zeroCostSyncFakes(): void
    {
        Http::fake([
            'api.openai.com/v1/organization/usage/completions*' => Http::response([
                'data' => [],
                'has_more' => false,
            ]),
            'api.openai.com/v1/organization/costs*' => Http::response([
                'data' => [['results' => [['amount' => ['value' => 0.0, 'currency' => 'usd'], 'project_id' => 'proj_abc123']]]],
                'has_more' => false,
            ]),
            'api.openai.com/v1/organization/projects/*' => Http::response(['id' => 'proj_abc123'], 200),
        ]);
    }

    public function test_key_notified_when_spend_exceeds_max_but_within_grace(): void
    {
        Mail::fake();
        $this->zeroCostSyncFakes();

        $config = $this->makeConfig();
        $config->update(['notification_emails' => ['admin@example.com']]);

        $key = $this->makeKey($config, maxSpend: 50.00, grace: 10.00);
        $key->update(['spend_usd' => 52.00]);  // over max, within grace

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync")
            ->assertOk();

        $key->refresh();
        $this->assertEquals(OpenAiKeyStatus::Active, $key->status);
        $this->assertNotNull($key->grace_notified_at);

        Mail::assertQueued(OpenAiKeyLimitWarning::class, function (OpenAiKeyLimitWarning $mail) {
            return $mail->type === 'limit_reached';
        });
    }

    public function test_key_suspended_when_spend_exceeds_grace_threshold(): void
    {
        Mail::fake();
        $this->zeroCostSyncFakes();

        $config = $this->makeConfig();
        $config->update(['notification_emails' => ['admin@example.com']]);

        $key = $this->makeKey($config, maxSpend: 50.00, grace: 10.00);
        $key->update([
            'spend_usd' => 62.00,  // over grace threshold of $60
            'grace_notified_at' => now()->subHour(),
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync")
            ->assertOk();

        $key->refresh();
        $this->assertEquals(OpenAiKeyStatus::Suspended, $key->status);
        $this->assertNotNull($key->suspended_at);

        Mail::assertQueued(OpenAiKeyLimitWarning::class, function (OpenAiKeyLimitWarning $mail) {
            return $mail->type === 'suspended';
        });
    }

    public function test_key_suspended_immediately_when_grace_is_zero(): void
    {
        Mail::fake();
        $this->zeroCostSyncFakes();

        $config = $this->makeConfig();
        $key = $this->makeKey($config, maxSpend: 50.00, grace: 0.00);
        $key->update(['spend_usd' => 50.01]);  // just over max, no grace buffer

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync")
            ->assertOk();

        $key->refresh();
        $this->assertEquals(OpenAiKeyStatus::Suspended, $key->status);
    }

    public function test_limit_warning_not_sent_twice_once_already_notified(): void
    {
        Mail::fake();
        $this->zeroCostSyncFakes();

        $config = $this->makeConfig();
        $config->update(['notification_emails' => ['admin@example.com']]);

        $key = $this->makeKey($config, maxSpend: 50.00, grace: 10.00);
        $key->update([
            'spend_usd' => 52.00,
            'grace_notified_at' => now()->subHour(),  // already notified
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync")
            ->assertOk();

        Mail::assertNothingQueued();
    }

    public function test_key_without_max_spend_is_never_suspended(): void
    {
        Mail::fake();
        $this->zeroCostSyncFakes();

        $config = $this->makeConfig();
        $key = $this->makeKey($config);  // no max_spend_usd
        $key->update(['spend_usd' => 999.99]);

        $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-config/sync")
            ->assertOk();

        $key->refresh();
        $this->assertEquals(OpenAiKeyStatus::Active, $key->status);
        Mail::assertNothingQueued();
    }

    // =====================================================================
    // createKey — grace amount
    // =====================================================================

    public function test_create_key_stores_grace_amount(): void
    {
        $config = $this->makeConfig();

        Http::fake([
            'api.openai.com/v1/organization/projects/*/service_accounts' => Http::response([
                'id' => 'sa_grace',
                'api_key' => ['id' => 'key_grace', 'value' => 'sk-svcacct-grace'],
            ], 201),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/openai-keys", [
                'name' => 'Grace Key',
                'max_spend_usd' => 100.00,
                'grace_amount_usd' => 25.00,
            ]);

        $response->assertCreated();
        $this->assertEquals(100, $response->json('data.max_spend_usd'));
        $this->assertEquals(25, $response->json('data.grace_amount_usd'));
        $this->assertEquals(125, $response->json('data.grace_threshold_usd'));
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    private function makeConfig(
        float $markup = 10.0,
        int $cycleUsageCents = 0,
    ): OpenAiConfig {
        return OpenAiConfig::create([
            'project_id' => $this->project->id,
            'openai_project_id' => 'proj_abc123',
            'openai_project_name' => 'Widget Co',
            'markup_percentage' => $markup,
            'billing_cycle_start_day' => 1,
            'cycle_usage_cents' => $cycleUsageCents,
            'connected_at' => now(),
        ]);
    }

    private function makeKey(
        OpenAiConfig $config,
        string $serviceAccountId = 'sa_default',
        string $name = 'Test Key',
        ?float $maxSpend = null,
        float $grace = 0.00,
    ): OpenAiApiKey {
        return OpenAiApiKey::create([
            'openai_config_id' => $config->id,
            'name' => $name,
            'openai_service_account_id' => $serviceAccountId,
            'openai_api_key_id' => 'key_id_'.uniqid(),
            'api_key_encrypted' => 'sk-svcacct-placeholder',
            'status' => OpenAiKeyStatus::Active,
            'spend_usd' => 0,
            'max_spend_usd' => $maxSpend,
            'grace_amount_usd' => $grace,
        ]);
    }
}
