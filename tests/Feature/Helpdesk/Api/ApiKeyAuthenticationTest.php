<?php

namespace Tests\Feature\Helpdesk\Api;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiKeyAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private string $plainApiKey;

    private ApiKey $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a project
        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'slug' => 'test-project',
            'ticket_prefix' => 'TEST',
            'is_active' => true,
        ]);

        // Generate a plain API key and store the hashed version
        $this->plainApiKey = ApiKey::generateKey();
        $this->apiKey = ApiKey::create([
            'project_id' => $this->project->id,
            'key' => ApiKey::hashKey($this->plainApiKey),
            'name' => 'Test API Key',
            'is_active' => true,
        ]);
    }

    public function test_api_requires_api_key_header(): void
    {
        $response = $this->getJson('/api/helpdesk/v1/statuses');

        $response->assertStatus(401)
            ->assertJson(['message' => 'API key required']);
    }

    public function test_api_rejects_invalid_api_key(): void
    {
        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => 'invalid-key-that-does-not-exist',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid API key']);
    }

    public function test_api_accepts_valid_api_key(): void
    {
        // Seed the default statuses
        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_api_rejects_inactive_api_key(): void
    {
        $this->apiKey->update(['is_active' => false]);

        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid API key']);
    }

    public function test_api_rejects_expired_api_key(): void
    {
        $this->apiKey->update(['expires_at' => now()->subDay()]);

        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'API key expired']);
    }

    public function test_api_rejects_key_for_inactive_project(): void
    {
        $this->project->update(['is_active' => false]);

        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Project is not active']);
    }

    public function test_api_rejects_soft_deleted_api_key(): void
    {
        $this->apiKey->delete();

        $response = $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid API key']);
    }

    public function test_api_key_usage_is_recorded(): void
    {
        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $this->assertNull($this->apiKey->last_used_at);

        $this->getJson('/api/helpdesk/v1/statuses', [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $this->apiKey->refresh();
        $this->assertNotNull($this->apiKey->last_used_at);
        $this->assertNotNull($this->apiKey->last_used_ip);
    }

    public function test_can_create_ticket_with_valid_api_key(): void
    {
        $this->seed(\Database\Seeders\HelpdeskSeeder::class);

        $response = $this->postJson('/api/helpdesk/v1/tickets', [
            'title' => 'Test Ticket',
            'content' => 'This is a test ticket created via API',
            'submitter_name' => 'John Doe',
            'submitter_email' => 'john@example.com',
        ], [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'number',
                    'title',
                    'content',
                    'status',
                    'submitter',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'project_id' => $this->project->id,
            'title' => 'Test Ticket',
            'submitter_email' => 'john@example.com',
        ]);
    }

    public function test_hash_key_produces_consistent_results(): void
    {
        $key = 'YaaM1CYorz9F9NiPXpimMX1XD6k8Dydcp5HpidCla0IVH8XK';
        $expectedHash = '8564e5faefa04daa2c9d6c6c7ef3e104f92f70c13f5ceed11be504dc3090f9b2';

        $this->assertEquals($expectedHash, ApiKey::hashKey($key));

        // Verify consistency
        $this->assertEquals(ApiKey::hashKey($key), ApiKey::hashKey($key));
    }

    public function test_find_by_key_returns_correct_key(): void
    {
        $found = ApiKey::findByKey($this->plainApiKey);

        $this->assertNotNull($found);
        $this->assertEquals($this->apiKey->id, $found->id);
    }

    public function test_find_by_key_returns_null_for_invalid_key(): void
    {
        $found = ApiKey::findByKey('definitely-not-a-valid-key');

        $this->assertNull($found);
    }
}

