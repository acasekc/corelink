<?php

namespace Tests\Feature;

use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InviteCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invite_uses_are_unlimited_when_max_uses_is_omitted(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post('/admin/discovery/invites', [
                // no max_uses provided
                'email' => 'test@example.com',
            ])
            ->assertRedirect('/admin/discovery/invites');

        $this->assertDatabaseCount('invite_codes', 1);
        $invite = InviteCode::query()->first();

        $this->assertNull($invite?->max_uses);
    }

    public function test_unlimited_invite_can_create_multiple_sessions(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'UNLIMITED1',
            'email' => 'test@example.com',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $firstResponse = $this->postJson('/api/bot/sessions/create', [
            'invite_code' => $invite->code,
            'email' => 'first@example.com',
        ]);

        $secondResponse = $this->postJson('/api/bot/sessions/create', [
            'invite_code' => $invite->code,
            'email' => 'second@example.com',
        ]);

        $firstResponse->assertCreated();
        $secondResponse->assertCreated();

        $invite->refresh();

        $this->assertNull($invite->max_uses);
        $this->assertSame(2, $invite->current_uses);
        $this->assertTrue($invite->is_active);
    }
}
