<?php

namespace Tests\Feature\Helpdesk;

use App\Events\Helpdesk\UsageSynced;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicUsageLog;
use App\Models\Helpdesk\Project;
use App\Models\User;
use App\Services\Helpdesk\AnthropicUsageSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AnthropicUsageSyncTest extends TestCase
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
        ]);

        $this->config = AnthropicApiConfig::create([
            'project_id' => $this->project->id,
            'api_key_encrypted' => 'sk-ant-test-key-12345',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 10.00,
            'overage_mode' => 'silent',
            'key_status' => 'active',
            'cycle_start_day' => 1,
            'cycle_usage_cents' => 0,
        ]);
    }

    // ========================================
    // Service: syncForConfig
    // ========================================

    public function test_sync_creates_usage_log_from_api_response(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-sonnet-4-20250514',
                        'input_tokens' => 1_000_000,
                        'output_tokens' => 500_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $log = $service->syncForConfig($this->config);

        $this->assertNotNull($log);
        $this->assertInstanceOf(AnthropicUsageLog::class, $log);
        $this->assertEquals(1_000_000, $log->tokens_input);
        $this->assertEquals(500_000, $log->tokens_output);
        $this->assertGreaterThan(0, $log->cost_cents);
        $this->assertNotNull($log->model_breakdown);
        $this->assertArrayHasKey('claude-sonnet-4-20250514', $log->model_breakdown);

        Event::assertDispatched(UsageSynced::class, fn ($event) => $event->config->id === $this->config->id && $event->log->id === $log->id);
    }

    public function test_sync_updates_cycle_usage_cents(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-sonnet-4-20250514',
                        'input_tokens' => 1_000_000,
                        'output_tokens' => 500_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $service->syncForConfig($this->config);

        $this->config->refresh();
        $this->assertGreaterThan(0, $this->config->cycle_usage_cents);
        $this->assertNotNull($this->config->last_synced_at);
    }

    public function test_sync_calculates_cost_correctly_for_known_models(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-3-5-haiku-20241022',
                        'input_tokens' => 10_000_000,
                        'output_tokens' => 5_000_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $log = $service->syncForConfig($this->config);

        // Haiku: 80 cents/M input + 400 cents/M output
        // 10M input = 800 cents, 5M output = 2000 cents → total = 2800 cents
        $this->assertEquals(2800, $log->cost_cents);
    }

    public function test_sync_handles_multiple_models(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-sonnet-4-20250514',
                        'input_tokens' => 1_000_000,
                        'output_tokens' => 500_000,
                    ],
                    [
                        'model' => 'claude-3-5-haiku-20241022',
                        'input_tokens' => 2_000_000,
                        'output_tokens' => 1_000_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $log = $service->syncForConfig($this->config);

        $this->assertEquals(3_000_000, $log->tokens_input);
        $this->assertEquals(1_500_000, $log->tokens_output);
        $this->assertCount(2, $log->model_breakdown);
    }

    public function test_sync_throws_on_api_error(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response(['error' => 'Unauthorized'], 401),
        ]);

        $service = app(AnthropicUsageSyncService::class);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Anthropic API returned 401');

        $service->syncForConfig($this->config);
    }

    public function test_sync_uses_default_cost_for_unknown_models(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-4-ultra-future',
                        'input_tokens' => 1_000_000,
                        'output_tokens' => 1_000_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $log = $service->syncForConfig($this->config);

        // Default: 300 cents/M input + 1500 cents/M output
        // 1M input = 300, 1M output = 1500 → total = 1800
        $this->assertEquals(1800, $log->cost_cents);
    }

    // ========================================
    // Service: syncAll
    // ========================================

    public function test_sync_all_only_syncs_active_and_grace_configs(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        // Create a disabled config — should NOT be synced
        $project2 = Project::factory()->create(['ticket_prefix' => 'TST2']);
        AnthropicApiConfig::create([
            'project_id' => $project2->id,
            'api_key_encrypted' => 'sk-ant-disabled-key',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'key_status' => 'disabled',
            'cycle_start_day' => 1,
        ]);

        // Create a grace config — should be synced
        $project3 = Project::factory()->create(['ticket_prefix' => 'TST3']);
        AnthropicApiConfig::create([
            'project_id' => $project3->id,
            'api_key_encrypted' => 'sk-ant-grace-key',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'key_status' => 'grace',
            'cycle_start_day' => 1,
        ]);

        $service = app(AnthropicUsageSyncService::class);
        $logs = $service->syncAll();

        // Should sync the active config + the grace config = 2
        $this->assertCount(2, $logs);

        // Disabled config should not have been synced
        Event::assertDispatched(UsageSynced::class, 2);
    }

    public function test_sync_all_skips_configs_without_api_key(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        // Create a config without API key
        $project2 = Project::factory()->create(['ticket_prefix' => 'TST2']);
        AnthropicApiConfig::create([
            'project_id' => $project2->id,
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'key_status' => 'active',
            'cycle_start_day' => 1,
        ]);

        $service = app(AnthropicUsageSyncService::class);
        $logs = $service->syncAll();

        // Only the setUp config should be synced (has key), not the one without
        $this->assertCount(1, $logs);
    }

    public function test_sync_all_continues_after_individual_failure(): void
    {
        $callCount = 0;
        Http::fake(function () use (&$callCount) {
            $callCount++;
            if ($callCount === 1) {
                return Http::response(['error' => 'fail'], 500);
            }

            return Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]);
        });

        Event::fake([UsageSynced::class]);

        // Add second active config
        $project2 = Project::factory()->create(['ticket_prefix' => 'TST2']);
        AnthropicApiConfig::create([
            'project_id' => $project2->id,
            'api_key_encrypted' => 'sk-ant-second-key',
            'plan_tier' => 'starter',
            'included_allowance' => 50.00,
            'grace_threshold' => 75.00,
            'markup_percentage' => 0,
            'overage_mode' => 'silent',
            'key_status' => 'active',
            'cycle_start_day' => 1,
        ]);

        $service = app(AnthropicUsageSyncService::class);
        $logs = $service->syncAll();

        // One should fail, one should succeed
        $this->assertCount(1, $logs);
    }

    // ========================================
    // Service: calculateTokenCost
    // ========================================

    public function test_calculate_token_cost(): void
    {
        $service = app(AnthropicUsageSyncService::class);

        // Sonnet 4: 300 cents/M input
        $this->assertEquals(300, $service->calculateTokenCost(1_000_000, 'claude-sonnet-4-20250514', 'input'));
        // Sonnet 4: 1500 cents/M output
        $this->assertEquals(1500, $service->calculateTokenCost(1_000_000, 'claude-sonnet-4-20250514', 'output'));
        // Haiku: 80 cents/M input
        $this->assertEquals(80, $service->calculateTokenCost(1_000_000, 'claude-3-5-haiku-20241022', 'input'));
        // Small token counts round correctly
        $this->assertEquals(0, $service->calculateTokenCost(100, 'claude-sonnet-4-20250514', 'input'));
    }

    // ========================================
    // Service: getCyclePeriodStart
    // ========================================

    public function test_get_cycle_period_start_current_month(): void
    {
        $this->config->update(['cycle_start_day' => 1]);
        $this->config->refresh();

        $service = app(AnthropicUsageSyncService::class);
        $start = $service->getCyclePeriodStart($this->config);

        // If today is on or after day 1, should be this month day 1
        $this->assertEquals(now()->startOfMonth()->toDateString(), $start->toDateString());
    }

    public function test_get_cycle_period_start_previous_month(): void
    {
        // Set cycle_start_day to a day in the future relative to today within this month
        $futureDay = min(28, now()->day + 5);
        if ($futureDay <= now()->day) {
            // If we can't find a future day this month, skip this test
            $this->markTestSkipped('Cannot test previous month cycle start with current date.');
        }

        $this->config->update(['cycle_start_day' => $futureDay]);
        $this->config->refresh();

        $service = app(AnthropicUsageSyncService::class);
        $start = $service->getCyclePeriodStart($this->config);

        // Should be last month on that day
        $expected = now()->subMonth()->day($futureDay)->startOfDay();
        $this->assertEquals($expected->toDateString(), $start->toDateString());
    }

    // ========================================
    // Controller: sync endpoint
    // ========================================

    public function test_admin_can_trigger_manual_sync(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    [
                        'model' => 'claude-sonnet-4-20250514',
                        'input_tokens' => 500_000,
                        'output_tokens' => 200_000,
                    ],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/sync");

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'log' => ['id', 'tokens_input', 'tokens_output', 'total_tokens', 'cost_cents', 'cost_dollars'],
                'message',
            ]);

        $this->assertDatabaseCount('helpdesk_anthropic_usage_logs', 1);
    }

    public function test_sync_endpoint_returns_404_without_config(): void
    {
        $project2 = Project::factory()->create(['ticket_prefix' => 'TST2']);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$project2->id}/anthropic-config/sync");

        $response->assertNotFound();
    }

    public function test_sync_endpoint_rejects_disabled_config(): void
    {
        $this->config->update(['key_status' => 'disabled']);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/sync");

        $response->assertUnprocessable();
    }

    public function test_sync_endpoint_returns_500_on_api_failure(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response(['error' => 'Internal error'], 500),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/sync");

        $response->assertServerError();
    }

    public function test_non_admin_cannot_trigger_sync(): void
    {
        $nonAdmin = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($nonAdmin)
            ->postJson("/api/helpdesk/admin/projects/{$this->project->id}/anthropic-config/sync");

        $response->assertForbidden();
    }

    // ========================================
    // Artisan Command
    // ========================================

    public function test_artisan_command_syncs_all(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $this->artisan('anthropic:sync-usage')
            ->expectsOutput('Syncing usage for all active Anthropic API configs...')
            ->expectsOutput('Successfully synced 1 config(s).')
            ->assertSuccessful();
    }

    public function test_artisan_command_syncs_single_project(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $this->artisan("anthropic:sync-usage --project={$this->project->id}")
            ->assertSuccessful();
    }

    public function test_artisan_command_fails_for_missing_project(): void
    {
        $this->artisan('anthropic:sync-usage --project=99999')
            ->expectsOutput('No Anthropic API config found for project ID 99999.')
            ->assertFailed();
    }

    public function test_artisan_command_reports_empty_when_no_active_configs(): void
    {
        // Disable the only config
        $this->config->update(['key_status' => 'disabled']);

        $this->artisan('anthropic:sync-usage')
            ->expectsOutput('No configs to sync (none active/grace with API keys).')
            ->assertSuccessful();
    }

    // ========================================
    // Event dispatch
    // ========================================

    public function test_usage_synced_event_contains_correct_data(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'data' => [
                    ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 100, 'output_tokens' => 50],
                ],
            ]),
        ]);

        Event::fake([UsageSynced::class]);

        $service = app(AnthropicUsageSyncService::class);
        $service->syncForConfig($this->config);

        Event::assertDispatched(UsageSynced::class, function (UsageSynced $event) {
            return $event->config instanceof AnthropicApiConfig
                && $event->log instanceof AnthropicUsageLog
                && $event->config->id === $this->config->id;
        });
    }

    // ========================================
    // processUsageResponse (direct)
    // ========================================

    public function test_process_usage_response_stores_raw_response(): void
    {
        Event::fake([UsageSynced::class]);

        $rawData = [
            'data' => [
                ['model' => 'claude-sonnet-4-20250514', 'input_tokens' => 5000, 'output_tokens' => 2000],
            ],
        ];

        $service = app(AnthropicUsageSyncService::class);
        $log = $service->processUsageResponse(
            $this->config,
            $rawData,
            now()->startOfMonth(),
            now(),
        );

        $this->assertEquals($rawData, $log->raw_response);
    }
}
