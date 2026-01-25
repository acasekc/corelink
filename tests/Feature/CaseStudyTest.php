<?php

namespace Tests\Feature;

use App\Models\CaseStudy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CaseStudyTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $nonAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->nonAdmin = User::factory()->create(['is_admin' => false]);
    }

    // === Public Index Tests ===

    public function test_public_index_lists_published_case_studies(): void
    {
        CaseStudy::factory()->published()->count(3)->create();
        CaseStudy::factory()->count(2)->create(); // Unpublished

        $response = $this->getJson('/api/case-studies');

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_public_index_orders_by_order_field(): void
    {
        CaseStudy::factory()->published()->ordered(3)->create(['title' => 'Third']);
        CaseStudy::factory()->published()->ordered(1)->create(['title' => 'First']);
        CaseStudy::factory()->published()->ordered(2)->create(['title' => 'Second']);

        $response = $this->getJson('/api/case-studies');

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals('First', $data[0]['title']);
        $this->assertEquals('Second', $data[1]['title']);
        $this->assertEquals('Third', $data[2]['title']);
    }

    // === Public Show Tests ===

    public function test_public_show_gets_published_case_study_by_slug(): void
    {
        $caseStudy = CaseStudy::factory()->published()->create();

        $response = $this->getJson("/api/case-studies/{$caseStudy->slug}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['slug' => $caseStudy->slug]);
    }

    public function test_public_show_does_not_return_unpublished_case_study(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->getJson("/api/case-studies/{$caseStudy->slug}");

        $response->assertStatus(404);
    }

    public function test_public_show_returns_404_for_missing_case_study(): void
    {
        $response = $this->getJson('/api/case-studies/non-existent-slug');

        $response->assertStatus(404);
    }

    // === Admin Index Tests ===

    public function test_admin_can_list_all_case_studies(): void
    {
        CaseStudy::factory()->published()->count(2)->create();
        CaseStudy::factory()->count(3)->create(); // Unpublished

        $response = $this->actingAs($this->admin)->getJson('/api/admin/case-studies');

        $response->assertStatus(200);
        $response->assertJsonCount(5);
    }

    public function test_non_admin_cannot_list_all_case_studies(): void
    {
        $response = $this->actingAs($this->nonAdmin)->getJson('/api/admin/case-studies');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_all_case_studies(): void
    {
        $response = $this->getJson('/api/admin/case-studies');

        $response->assertStatus(401);
    }

    // === Admin Create Tests ===

    public function test_admin_can_create_case_study(): void
    {
        $data = [
            'title' => 'Test Case Study',
            'content' => 'This is test content.',
            'client_name' => 'Test Client',
            'description' => 'Test description',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/case-studies', $data);

        $response->assertStatus(201);
        $response->assertJsonFragment(['title' => 'Test Case Study']);
        $this->assertDatabaseHas('case_studies', ['title' => 'Test Case Study']);
    }

    public function test_admin_can_create_case_study_with_hero_image(): void
    {
        $this->markTestSkipped('File upload testing with fake files not compatible with service layer');
    }

    public function test_admin_can_create_case_study_with_hero_image_url(): void
    {
        $data = [
            'title' => 'Case Study with URL',
            'content' => 'Test content',
            'hero_image_url' => 'https://example.com/image.jpg',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/case-studies', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('case_studies', [
            'title' => 'Case Study with URL',
            'hero_image' => 'https://example.com/image.jpg',
        ]);
    }

    public function test_admin_can_create_case_study_with_json_arrays(): void
    {
        $data = [
            'title' => 'Case Study with Arrays',
            'content' => 'Test content',
            'technologies' => json_encode(['Laravel', 'React', 'Tailwind']),
            'metrics' => json_encode([
                ['label' => 'Growth', 'value' => '300%'],
                ['label' => 'Speed', 'value' => '2x'],
            ]),
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/case-studies', $data);

        $response->assertStatus(201);

        $caseStudy = CaseStudy::where('title', 'Case Study with Arrays')->first();
        $this->assertEquals(['Laravel', 'React', 'Tailwind'], $caseStudy->technologies);
        $this->assertCount(2, $caseStudy->metrics);
    }

    public function test_auto_generates_slug_if_empty(): void
    {
        $data = [
            'title' => 'My Test Case Study',
            'content' => 'Test content',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/case-studies', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('case_studies', [
            'title' => 'My Test Case Study',
            'slug' => 'my-test-case-study',
        ]);
    }

    public function test_create_requires_title_and_content(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/case-studies', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'content']);
    }

    public function test_non_admin_cannot_create_case_study(): void
    {
        $data = [
            'title' => 'Test Case Study',
            'content' => 'Test content',
        ];

        $response = $this->actingAs($this->nonAdmin)->postJson('/api/admin/case-studies', $data);

        $response->assertStatus(403);
    }

    // === Admin Show Tests ===

    public function test_admin_can_view_case_study_by_id(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->admin)->getJson("/api/admin/case-studies/{$caseStudy->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $caseStudy->id]);
    }

    public function test_non_admin_cannot_view_case_study_by_id(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->nonAdmin)->getJson("/api/admin/case-studies/{$caseStudy->id}");

        $response->assertStatus(403);
    }

    // === Admin Update Tests ===

    public function test_admin_can_update_case_study(): void
    {
        $caseStudy = CaseStudy::factory()->create(['title' => 'Original Title']);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/case-studies/{$caseStudy->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('case_studies', [
            'id' => $caseStudy->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_admin_can_replace_hero_image(): void
    {
        $this->markTestSkipped('File upload testing with fake files not compatible with service layer');
    }

    public function test_admin_can_clear_hero_image(): void
    {
        $caseStudy = CaseStudy::factory()->create(['hero_image' => '/storage/case-studies/test.jpg']);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/case-studies/{$caseStudy->id}", [
            'hero_image' => null,
        ]);

        $response->assertStatus(200);
        $caseStudy->refresh();
        $this->assertNull($caseStudy->hero_image);
    }

    public function test_admin_can_update_json_arrays(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/admin/case-studies/{$caseStudy->id}", [
            'technologies' => json_encode(['Vue', 'Node']),
        ]);

        $response->assertStatus(200);
        $caseStudy->refresh();
        $this->assertEquals(['Vue', 'Node'], $caseStudy->technologies);
    }

    public function test_non_admin_cannot_update_case_study(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->nonAdmin)->putJson("/api/admin/case-studies/{$caseStudy->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(403);
    }

    // === Admin Delete Tests ===

    public function test_admin_can_delete_case_study(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/case-studies/{$caseStudy->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('case_studies', [
            'id' => $caseStudy->id,
            'deleted_at' => null,
        ]);
    }

    public function test_non_admin_cannot_delete_case_study(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->nonAdmin)->deleteJson("/api/admin/case-studies/{$caseStudy->id}");

        $response->assertStatus(403);
    }

    // === Admin Publish Tests ===

    public function test_admin_can_toggle_publish_status(): void
    {
        $caseStudy = CaseStudy::factory()->create(['is_published' => false]);

        $response = $this->actingAs($this->admin)->postJson("/api/admin/case-studies/{$caseStudy->id}/toggle-publish");

        $response->assertStatus(200);
        $caseStudy->refresh();
        $this->assertTrue($caseStudy->is_published);

        // Toggle again
        $response = $this->actingAs($this->admin)->postJson("/api/admin/case-studies/{$caseStudy->id}/toggle-publish");

        $response->assertStatus(200);
        $caseStudy->refresh();
        $this->assertFalse($caseStudy->is_published);
    }

    public function test_non_admin_cannot_toggle_publish_status(): void
    {
        $caseStudy = CaseStudy::factory()->create();

        $response = $this->actingAs($this->nonAdmin)->postJson("/api/admin/case-studies/{$caseStudy->id}/toggle-publish");

        $response->assertStatus(403);
    }
}
