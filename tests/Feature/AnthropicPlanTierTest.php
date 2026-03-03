<?php

namespace Tests\Feature;

use App\Enums\Helpdesk\OverageMode;
use App\Models\Helpdesk\AnthropicApiConfig;
use App\Models\Helpdesk\AnthropicPlanTier;
use App\Models\Helpdesk\Project;
use App\Models\User;
use Database\Seeders\HelpdeskSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnthropicPlanTierTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $nonAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(HelpdeskSeeder::class);

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->nonAdmin = User::factory()->create(['is_admin' => false]);
    }

    // ─── Index ────────────────────────────────────────────────

    public function test_admin_can_list_plan_tiers(): void
    {
        AnthropicPlanTier::factory()->starter()->create();
        AnthropicPlanTier::factory()->growth()->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/anthropic-plan-tiers');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Starter')
            ->assertJsonPath('data.1.name', 'Growth');
    }

    public function test_non_admin_cannot_list_plan_tiers(): void
    {
        $response = $this->actingAs($this->nonAdmin)
            ->getJson('/api/admin/anthropic-plan-tiers');

        $response->assertForbidden();
    }

    public function test_unauthenticated_cannot_list_plan_tiers(): void
    {
        $response = $this->getJson('/api/admin/anthropic-plan-tiers');

        $response->assertUnauthorized();
    }

    public function test_tiers_are_ordered_by_sort_order(): void
    {
        AnthropicPlanTier::factory()->pro()->create();
        AnthropicPlanTier::factory()->starter()->create();
        AnthropicPlanTier::factory()->growth()->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/anthropic-plan-tiers');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertEquals(['Starter', 'Growth', 'Pro'], $names);
    }

    public function test_index_includes_configs_count(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();
        $project = Project::factory()->create();
        AnthropicApiConfig::create([
            'project_id' => $project->id,
            'plan_tier' => 'starter',
            'plan_tier_id' => $tier->id,
            'included_allowance' => 25,
            'grace_threshold' => 35,
            'markup_percentage' => 20,
            'overage_mode' => OverageMode::Silent,
            'cycle_start_day' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/anthropic-plan-tiers');

        $response->assertOk()
            ->assertJsonPath('data.0.configs_count', 1);
    }

    // ─── Show ─────────────────────────────────────────────────

    public function test_admin_can_view_single_tier(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/anthropic-plan-tiers/{$tier->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', 'Starter')
            ->assertJsonPath('data.slug', 'starter')
            ->assertJsonPath('data.included_allowance', '25.00');
    }

    // ─── Store ────────────────────────────────────────────────

    public function test_admin_can_create_plan_tier(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers', [
                'name' => 'Enterprise',
                'description' => 'Enterprise-level plan',
                'monthly_price' => 999.00,
                'included_allowance' => 1000.00,
                'grace_threshold' => 1500.00,
                'markup_percentage' => 5.00,
                'overage_mode' => 'proactive',
                'is_active' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Enterprise')
            ->assertJsonPath('data.slug', 'enterprise')
            ->assertJsonPath('data.included_allowance', '1000.00')
            ->assertJsonPath('data.monthly_price', '999.00')
            ->assertJsonPath('data.overage_mode', 'proactive');

        $this->assertDatabaseHas('helpdesk_anthropic_plan_tiers', [
            'name' => 'Enterprise',
            'slug' => 'enterprise',
        ]);
    }

    public function test_create_requires_name(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers', [
                'included_allowance' => 100,
                'grace_threshold' => 150,
                'markup_percentage' => 10,
                'monthly_price' => 50,
                'overage_mode' => 'silent',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_create_requires_unique_name(): void
    {
        AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers', [
                'name' => 'Starter',
                'included_allowance' => 100,
                'grace_threshold' => 150,
                'markup_percentage' => 10,
                'monthly_price' => 50,
                'overage_mode' => 'silent',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_create_validates_grace_threshold_gte_allowance(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers', [
                'name' => 'Bad Tier',
                'included_allowance' => 100,
                'grace_threshold' => 50,
                'markup_percentage' => 10,
                'monthly_price' => 50,
                'overage_mode' => 'silent',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('grace_threshold');
    }

    public function test_create_validates_overage_mode_enum(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers', [
                'name' => 'Invalid Mode',
                'included_allowance' => 100,
                'grace_threshold' => 150,
                'markup_percentage' => 10,
                'monthly_price' => 50,
                'overage_mode' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('overage_mode');
    }

    // ─── Update ───────────────────────────────────────────────

    public function test_admin_can_update_plan_tier(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/anthropic-plan-tiers/{$tier->id}", [
                'name' => 'Starter Plus',
                'description' => 'Updated starter plan',
                'monthly_price' => 59.00,
                'included_allowance' => 50.00,
                'grace_threshold' => 75.00,
                'markup_percentage' => 15.00,
                'overage_mode' => 'proactive',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Starter Plus')
            ->assertJsonPath('data.slug', 'starter-plus')
            ->assertJsonPath('data.included_allowance', '50.00');
    }

    public function test_update_allows_same_name_for_same_tier(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/anthropic-plan-tiers/{$tier->id}", [
                'name' => 'Starter',
                'monthly_price' => 49.00,
                'included_allowance' => 30.00,
                'grace_threshold' => 40.00,
                'markup_percentage' => 20.00,
                'overage_mode' => 'silent',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Starter');
    }

    public function test_update_prevents_duplicate_name_with_another_tier(): void
    {
        AnthropicPlanTier::factory()->starter()->create();
        $growth = AnthropicPlanTier::factory()->growth()->create();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/anthropic-plan-tiers/{$growth->id}", [
                'name' => 'Starter',
                'monthly_price' => 149.00,
                'included_allowance' => 100,
                'grace_threshold' => 150,
                'markup_percentage' => 15,
                'overage_mode' => 'proactive',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    // ─── Delete ───────────────────────────────────────────────

    public function test_admin_can_delete_unused_tier(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/anthropic-plan-tiers/{$tier->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Plan tier "Starter" deleted successfully');

        $this->assertDatabaseMissing('helpdesk_anthropic_plan_tiers', ['id' => $tier->id]);
    }

    public function test_cannot_delete_tier_in_use(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();
        $project = Project::factory()->create();

        AnthropicApiConfig::create([
            'project_id' => $project->id,
            'plan_tier' => 'starter',
            'plan_tier_id' => $tier->id,
            'included_allowance' => 25,
            'grace_threshold' => 35,
            'markup_percentage' => 20,
            'overage_mode' => OverageMode::Silent,
            'cycle_start_day' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/anthropic-plan-tiers/{$tier->id}");

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Cannot delete "Starter" — it is assigned to active project configurations');

        $this->assertDatabaseHas('helpdesk_anthropic_plan_tiers', ['id' => $tier->id]);
    }

    // ─── Reorder ──────────────────────────────────────────────

    public function test_admin_can_reorder_tiers(): void
    {
        $starter = AnthropicPlanTier::factory()->starter()->create();
        $growth = AnthropicPlanTier::factory()->growth()->create();
        $pro = AnthropicPlanTier::factory()->pro()->create();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/anthropic-plan-tiers/reorder', [
                'order' => [$pro->id, $starter->id, $growth->id],
            ]);

        $response->assertOk();

        $this->assertEquals(0, $pro->fresh()->sort_order);
        $this->assertEquals(1, $starter->fresh()->sort_order);
        $this->assertEquals(2, $growth->fresh()->sort_order);
    }

    // ─── Response Format ──────────────────────────────────────

    public function test_tier_response_includes_all_fields(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/anthropic-plan-tiers/{$tier->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'monthly_price',
                    'included_allowance',
                    'grace_threshold',
                    'markup_percentage',
                    'overage_mode',
                    'overage_mode_label',
                    'sort_order',
                    'is_active',
                    'configs_count',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    // ─── Billing Config Integration ───────────────────────────

    public function test_anthropic_config_returns_plan_tier_info(): void
    {
        $tier = AnthropicPlanTier::factory()->starter()->create();
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$project->id}/anthropic-config", [
                'api_key_name' => 'Test Key',
                'api_key' => 'sk-ant-test-12345',
                'plan_tier' => 'starter',
                'plan_tier_id' => $tier->id,
                'included_allowance' => 25.00,
                'grace_threshold' => 35.00,
                'markup_percentage' => 20.00,
                'overage_mode' => 'silent',
                'notification_emails' => [],
                'cycle_start_day' => 1,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.plan_tier_id', $tier->id)
            ->assertJsonPath('data.plan_tier_name', 'Starter');
    }

    public function test_anthropic_config_works_without_plan_tier_id(): void
    {
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/projects/{$project->id}/anthropic-config", [
                'api_key_name' => 'Test Key',
                'api_key' => 'sk-ant-test-12345',
                'plan_tier' => 'custom',
                'included_allowance' => 25.00,
                'grace_threshold' => 35.00,
                'markup_percentage' => 20.00,
                'overage_mode' => 'silent',
                'notification_emails' => [],
                'cycle_start_day' => 1,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.plan_tier', 'custom')
            ->assertJsonPath('data.plan_tier_id', null)
            ->assertJsonPath('data.plan_tier_name', null);
    }
}
