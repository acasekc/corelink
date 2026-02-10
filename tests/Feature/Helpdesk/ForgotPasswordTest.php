<?php

namespace Tests\Feature\Helpdesk;

use App\Mail\Helpdesk\PasswordReset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_page_loads(): void
    {
        $response = $this->get('/helpdesk/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_page_loads(): void
    {
        $response = $this->get('/helpdesk/reset-password?token=test&email=test@example.com');

        $response->assertStatus(200);
    }

    public function test_send_reset_link_requires_email(): void
    {
        $response = $this->postJson('/helpdesk/forgot-password', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_send_reset_link_succeeds_for_existing_user(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/helpdesk/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'If an account exists with that email, a password reset link has been sent.',
        ]);

        Mail::assertSent(PasswordReset::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_send_reset_link_succeeds_for_nonexistent_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/helpdesk/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'If an account exists with that email, a password reset link has been sent.',
        ]);

        Mail::assertNotSent(PasswordReset::class);
    }

    public function test_reset_link_is_throttled(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        // First request
        $this->postJson('/helpdesk/forgot-password', ['email' => 'test@example.com']);

        Mail::assertSentCount(1);

        // Second immediate request — should be throttled
        $this->postJson('/helpdesk/forgot-password', ['email' => 'test@example.com']);

        // Still only 1 email sent
        Mail::assertSentCount(1);
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'old-password',
        ]);

        $token = 'valid-token-string-for-testing-purpose';

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Your password has been reset successfully. You can now sign in.',
        ]);

        $user->refresh();
        $this->assertTrue(Hash::check('new-secure-password', $user->password));
        $this->assertFalse($user->force_password_change);

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make('correct-token'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => 'wrong-token',
            'email' => 'test@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('errors.email', 'This password reset link is invalid.');
    }

    public function test_reset_password_with_expired_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $token = 'expired-token-string';

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('errors.email', 'This password reset link has expired. Please request a new one.');
    }

    public function test_reset_password_requires_confirmation(): void
    {
        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => 'some-token',
            'email' => 'test@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_reset_password_requires_minimum_length(): void
    {
        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => 'some-token',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_reset_password_clears_force_password_change(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'force_password_change' => true,
        ]);

        $token = 'force-change-token';

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/helpdesk/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertFalse($user->force_password_change);
    }

    public function test_authenticated_users_are_redirected_from_forgot_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/helpdesk/forgot-password');

        $response->assertRedirect();
    }
}
