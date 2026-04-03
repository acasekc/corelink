<?php

namespace Tests\Feature;

use App\Enums\SessionStatus;
use App\Models\BotSession;
use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DiscoverySessionReferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_creation_stores_analyzed_website_references(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'REFCHECK1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        Http::fake([
            'https://example.com*' => Http::response('<html><head><title>Example App</title><meta name="description" content="A sample customer portal" /></head><body><nav><a>Login</a><a>Pricing</a></nav><h1>Welcome</h1><h2>Dashboard</h2></body></html>', 200, ['Content-Type' => 'text/html; charset=UTF-8']),
            'https://acme-reference.com*' => Http::response('<html><head><title>Acme Reference</title></head><body><nav><a>Book Demo</a></nav><h1>Operations Platform</h1></body></html>', 200, ['Content-Type' => 'text/html; charset=UTF-8']),
        ]);

        $response = $this->postJson('/api/bot/sessions/create', [
            'invite_code' => $invite->code,
            'email' => 'founder@example.com',
            'current_website_url' => 'example.com',
            'references' => [
                [
                    'type' => 'competitor',
                    'url' => 'acme-reference.com',
                ],
            ],
        ]);

        $response->assertCreated();

        $session = BotSession::query()->findOrFail($response->json('session_id'));

        $this->assertSame('https://example.com', $session->metadata['current_website_url']);
        $this->assertSame('competitor', $session->metadata['references'][1]['source_type']);
        $this->assertCount(2, $session->metadata['reference_summaries']);
        $this->assertSame('analyzed', $session->metadata['reference_summaries'][0]['status']);
        $this->assertStringContainsString('Example App', $session->metadata['reference_summaries'][0]['summary']);
    }

    public function test_chat_message_with_url_adds_reference_summary_to_session_metadata(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'REFCHAT01',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'metadata' => [
                'user_email' => 'founder@example.com',
            ],
        ]);

        Http::fake([
            'https://product-example.com*' => Http::response('<html><head><title>Product Example</title><meta name="description" content="A marketplace with dashboards" /></head><body><nav><a>Search</a><a>Login</a></nav><h1>Marketplace</h1></body></html>', 200, ['Content-Type' => 'text/html; charset=UTF-8']),
            'https://api.openai.com/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'Thanks — I reviewed that reference. Which parts of that experience are must-haves for your first release?',
                        ],
                    ],
                ],
                'usage' => [
                    'prompt_tokens' => 100,
                    'completion_tokens' => 20,
                    'total_tokens' => 120,
                ],
            ]),
        ]);

        $response = $this->postJson("/api/bot/sessions/{$session->id}/message", [
            'message' => 'We like https://product-example.com as inspiration for what we want to build.',
        ]);

        $response->assertOk();

        $session->refresh();

        $this->assertCount(1, $session->metadata['reference_summaries']);
        $this->assertSame('https://product-example.com', $session->metadata['reference_summaries'][0]['url']);
        $this->assertStringContainsString('Product Example', $session->metadata['reference_summaries'][0]['summary']);
    }

    public function test_plan_generation_is_blocked_when_coverage_is_still_too_thin(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'THINPLAN1',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 3,
            'metadata' => [
                'user_email' => 'founder@example.com',
            ],
        ]);

        $response = $this->postJson("/api/bot/sessions/{$session->id}/generate-plan");

        $response
            ->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'missing_topics',
                'coverage_score',
            ]);
    }
}
