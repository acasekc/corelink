<?php

namespace Tests\Feature\Mcp;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HelpdeskMcpUrlKeyTest extends TestCase
{
    use RefreshDatabase;

    private string $plainKey;

    private ApiKey $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $project = Project::factory()->create(['is_active' => true]);

        $this->plainKey = ApiKey::generateKey();
        $this->apiKey = ApiKey::create([
            'project_id' => $project->id,
            'key' => ApiKey::hashKey($this->plainKey),
            'name' => 'claude.ai connector',
            'is_active' => true,
        ]);
    }

    private function initializePayload(): array
    {
        return [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'initialize',
            'params' => [
                'protocolVersion' => '2025-06-18',
                'capabilities' => (object) [],
                'clientInfo' => ['name' => 'test', 'version' => '1.0'],
            ],
        ];
    }

    public function test_url_key_route_accepts_valid_key(): void
    {
        $response = $this->postJson("/mcp/helpdesk/k/{$this->plainKey}", $this->initializePayload());

        $response->assertOk()->assertJsonPath('result.serverInfo.name', fn ($name) => is_string($name));
        $this->assertNotNull($this->apiKey->fresh()->last_used_at);
    }

    public function test_url_key_route_rejects_invalid_key(): void
    {
        $this->postJson('/mcp/helpdesk/k/not-a-real-key', $this->initializePayload())
            ->assertStatus(401)
            ->assertJsonPath('error.message', 'Invalid API key');
    }

    public function test_url_key_route_rejects_expired_key(): void
    {
        $this->apiKey->update(['expires_at' => now()->subDay()]);

        $this->postJson("/mcp/helpdesk/k/{$this->plainKey}", $this->initializePayload())
            ->assertStatus(401)
            ->assertJsonPath('error.message', 'API key expired');
    }

    public function test_header_route_still_accepts_bearer_key(): void
    {
        $this->postJson('/mcp/helpdesk', $this->initializePayload(), [
            'Authorization' => "Bearer {$this->plainKey}",
        ])->assertOk();
    }

    public function test_header_route_without_key_is_rejected(): void
    {
        $this->postJson('/mcp/helpdesk', $this->initializePayload())
            ->assertStatus(401);
    }
}
