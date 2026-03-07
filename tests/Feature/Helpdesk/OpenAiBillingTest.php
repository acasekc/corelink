<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\Helpdesk\OpenAiKeyStatus;
use App\Models\Helpdesk\OpenAiApiKey;
use App\Models\Helpdesk\OpenAiConfig;
use App\Models\Helpdesk\OpenAiUsageLog;
use App\Models\Helpdesk\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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
    ): OpenAiApiKey {
        return OpenAiApiKey::create([
            'openai_config_id' => $config->id,
            'name' => $name,
            'openai_service_account_id' => $serviceAccountId,
            'openai_api_key_id' => 'key_id_'.uniqid(),
            'api_key_encrypted' => 'sk-svcacct-placeholder',
            'status' => OpenAiKeyStatus::Active,
            'spend_usd' => 0,
        ]);
    }
}
