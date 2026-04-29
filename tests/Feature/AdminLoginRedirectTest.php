<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_honors_explicit_intended_url(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->postJson('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'intended' => '/admin/intake/submissions/42',
        ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin/intake/submissions/42');
    }

    public function test_admin_login_honors_session_intended_url(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->withSession(['url.intended' => '/admin/discovery/sessions'])
            ->postJson('/admin/login', [
                'email' => 'admin@example.com',
                'password' => 'secret-password',
            ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin/discovery/sessions');
    }

    public function test_admin_login_falls_back_to_default_when_no_intent(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->postJson('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin');
    }

    public function test_admin_login_rejects_external_intended_url(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->postJson('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'intended' => 'https://evil.example.com/phish',
        ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin');
    }

    public function test_admin_login_rejects_protocol_relative_intended_url(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->postJson('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'intended' => '//evil.example.com/phish',
        ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin');
    }

    public function test_admin_login_rejects_non_admin_intended_url(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->postJson('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'intended' => '/some-public-page',
        ])
            ->assertOk()
            ->assertJsonPath('redirect', '/admin');
    }

    public function test_anthropic_plan_tiers_admin_path_serves_spa_when_authenticated(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get('/admin/anthropic-plan-tiers')
            ->assertOk();
    }

    public function test_anthropic_plan_tiers_admin_path_redirects_to_login_when_unauthenticated(): void
    {
        $this->get('/admin/anthropic-plan-tiers')
            ->assertRedirect('/admin/login');
    }
}
