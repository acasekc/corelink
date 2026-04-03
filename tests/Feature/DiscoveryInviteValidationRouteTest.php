<?php

namespace Tests\Feature;

use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscoveryInviteValidationRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_invite_validation_endpoint_is_available_under_api_prefix(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $inviteCode = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'OWQNNP7K',
            'email' => 'wes@corelink.dev',
            'is_active' => true,
            'max_uses' => 1,
            'current_uses' => 0,
        ]);

        $response = $this->postJson('/api/bot/auth/invite-validate', [
            'code' => $inviteCode->code,
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'valid' => true,
                'invite_code_id' => $inviteCode->id,
                'email' => 'wes@corelink.dev',
            ]);
    }
}
