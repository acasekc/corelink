<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProjectTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_can_create_project_via_factory(): void
    {
        $project = Project::factory()->create([
            'title' => 'Test Project',
            'category' => 'Web App',
        ]);

        $this->assertDatabaseHas('projects', [
            'title' => 'Test Project',
            'category' => 'Web App',
        ]);
    }

    public function test_admin_can_fetch_project_for_editing(): void
    {
        $project = Project::factory()->create([
            'title' => 'Test Project',
            'category' => 'Web App',
            'description' => 'Test Description',
            'features' => ['Feature 1', 'Feature 2'],
            'tech_stack' => ['Laravel', 'React'],
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/projects/{$project->id}");

        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals('Test Project', $data['title']);
        $this->assertEquals('Web App', $data['category']);
        $this->assertEquals(['Feature 1', 'Feature 2'], $data['features']);
    }

    public function test_admin_show_returns_404_for_nonexistent_project(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/projects/999');

        $response->assertStatus(404);
    }

    public function test_route_model_binding_works_correctly(): void
    {
        // Create multiple projects
        $project1 = Project::factory()->create(['title' => 'Project One']);
        $project2 = Project::factory()->create(['title' => 'Project Two']);

        // Test project 1
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/projects/{$project1->id}");
        
        $response->assertStatus(200);
        $this->assertEquals('Project One', $response->json('title'));

        // Test project 2
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/projects/{$project2->id}");
        
        $response->assertStatus(200);
        $this->assertEquals('Project Two', $response->json('title'));
    }

    public function test_admin_projects_list(): void
    {
        Project::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/projects');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json());
    }

    public function test_non_admin_cannot_fetch_project(): void
    {
        $project = Project::factory()->create();
        $nonAdmin = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($nonAdmin)
            ->getJson("/api/admin/projects/{$project->id}");

        $response->assertStatus(403);
    }

    public function test_guest_cannot_fetch_project(): void
    {
        $project = Project::factory()->create();

        $response = $this->getJson("/api/admin/projects/{$project->id}");

        $response->assertStatus(401);
    }
}
