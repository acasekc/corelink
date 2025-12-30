<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class InviteCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invite_defaults_max_uses_to_one_when_omitted()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post('/admin/discovery/invites', [
                // no max_uses provided
                'email' => 'test@example.com',
            ])
            ->assertRedirect('/admin/discovery/invites');

        $this->assertDatabaseCount('invite_codes', 1);
        $invite = \DB::table('invite_codes')->first();

        $this->assertEquals(1, $invite->max_uses);
    }
}
