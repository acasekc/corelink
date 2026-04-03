<?php

namespace Tests\Feature;

use App\Enums\SessionStatus;
use App\Jobs\GeneratePlanJob;
use App\Models\BotConversation;
use App\Models\BotSession;
use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AdminDiscoverySessionTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_owned_discovery_sessions_as_json(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $otherAdmin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $ownedInvite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'TRACKME1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $otherInvite = InviteCode::create([
            'admin_user_id' => $otherAdmin->id,
            'code' => 'TRACKME2',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        BotSession::create([
            'invite_code_id' => $ownedInvite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 2,
            'last_seen_at' => now()->subMinute(),
            'metadata' => [
                'user_email' => 'owner@example.com',
            ],
        ]);

        BotSession::create([
            'invite_code_id' => $otherInvite->id,
            'status' => SessionStatus::Completed,
            'turn_count' => 5,
            'metadata' => [
                'user_email' => 'other@example.com',
            ],
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/discovery/sessions');

        $response
            ->assertOk()
            ->assertJsonPath('summary.total', 1)
            ->assertJsonPath('summary.active', 1)
            ->assertJsonPath('summary.active_now', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_active_now', true)
            ->assertJsonPath('data.0.can_generate_plan', false)
            ->assertJsonPath('data.0.metadata.user_email', 'owner@example.com');
    }

    public function test_admin_summary_distinguishes_live_sessions_from_stale_active_sessions(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'LIVENOW1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 3,
            'last_seen_at' => now()->subMinutes(12),
            'metadata' => [
                'user_email' => 'stale@example.com',
            ],
        ]);

        BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 1,
            'last_seen_at' => now()->subMinutes(2),
            'metadata' => [
                'user_email' => 'live@example.com',
            ],
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/discovery/sessions');

        $response
            ->assertOk()
            ->assertJsonPath('summary.total', 2)
            ->assertJsonPath('summary.active', 2)
            ->assertJsonPath('summary.active_now', 1)
            ->assertJsonPath('summary.active_window_minutes', 5);
    }

    public function test_admin_can_view_owned_discovery_session_detail_as_json(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'DETAIL01',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 1,
            'last_seen_at' => now()->subMinutes(3),
            'metadata' => [
                'user_email' => 'founder@example.com',
            ],
        ]);

        BotConversation::create([
            'session_id' => $session->id,
            'turn_number' => 1,
            'user_message' => 'We need a client portal.',
            'assistant_message' => 'Who will use it first?',
            'interaction_mode' => 'text',
        ]);

        $response = $this->actingAs($admin)->getJson("/api/admin/discovery/sessions/{$session->id}");

        $response
            ->assertOk()
            ->assertJsonPath('id', $session->id)
            ->assertJsonPath('invite_code.code', 'DETAIL01')
            ->assertJsonPath('is_active_now', true)
            ->assertJsonCount(2, 'messages')
            ->assertJsonPath('messages.0.content', 'We need a client portal.')
            ->assertJsonPath('messages.1.content', 'Who will use it first?');
    }

    public function test_admin_can_start_plan_generation_for_owned_session_without_existing_plan(): void
    {
        Queue::fake();

        $admin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'GENPLAN1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 4,
            'metadata' => [
                'user_email' => 'estimate@example.com',
            ],
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/discovery/sessions/{$session->id}/generate-plan");

        $response
            ->assertAccepted()
            ->assertJsonPath('success', true);

        Queue::assertPushed(GeneratePlanJob::class, function (GeneratePlanJob $job): bool {
            return $job->connection === 'background';
        });
    }

    public function test_admin_cannot_start_plan_generation_when_session_is_not_ready(): void
    {
        Queue::fake();

        $admin = User::factory()->create([
            'is_admin' => true,
            'force_password_change' => false,
        ]);

        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'TOOSOON1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 2,
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/discovery/sessions/{$session->id}/generate-plan");

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This session is not ready for estimate generation yet.');

        Queue::assertNothingPushed();
    }
}
