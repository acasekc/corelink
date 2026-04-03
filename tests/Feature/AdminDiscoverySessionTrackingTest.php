<?php

namespace Tests\Feature;

use App\Enums\SessionStatus;
use App\Models\BotConversation;
use App\Models\BotSession;
use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.metadata.user_email', 'owner@example.com');
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
            ->assertJsonCount(2, 'messages')
            ->assertJsonPath('messages.0.content', 'We need a client portal.')
            ->assertJsonPath('messages.1.content', 'Who will use it first?');
    }
}
