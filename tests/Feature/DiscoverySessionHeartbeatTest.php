<?php

namespace Tests\Feature;

use App\Enums\SessionStatus;
use App\Models\BotSession;
use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscoverySessionHeartbeatTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_the_session_last_seen_at_when_a_heartbeat_is_received(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'HEARTBEAT1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 1,
            'last_seen_at' => now()->subMinutes(15),
        ]);

        $response = $this->postJson("/api/bot/sessions/{$session->id}/heartbeat");

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('status', SessionStatus::Active->value);

        $session->refresh();

        $this->assertTrue($session->last_seen_at !== null);
        $this->assertTrue($session->last_seen_at->greaterThan(now()->subMinute()));
    }
}
