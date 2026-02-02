<?php

namespace Tests\Feature\Helpdesk\Admin;

use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketFilteringTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->project = Project::factory()->create(['name' => 'Test Project']);
    }

    public function test_tickets_page_handles_project_id_parameter(): void
    {
        // Create tickets for the project
        $projectTickets = Ticket::factory(3)->create(['project_id' => $this->project->id]);

        // Create tickets for another project
        $otherProject = Project::factory()->create();
        Ticket::factory(2)->create(['project_id' => $otherProject->id]);

        // Test the exact URL pattern mentioned in ticket CORE-0006
        // /admin/helpdesk/tickets?project=2 (where project=2 means project_id=2)
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets?project={$this->project->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // Should return only the 3 tickets for this project

        // Verify we get the correct tickets
        $returnedTicketIds = collect($response->json('data'))->pluck('id')->sort()->values();
        $expectedTicketIds = $projectTickets->pluck('id')->sort()->values();

        $this->assertEquals($expectedTicketIds, $returnedTicketIds);
    }

    public function test_tickets_page_handles_project_slug_parameter(): void
    {
        // Create tickets for the project
        $projectTickets = Ticket::factory(2)->create(['project_id' => $this->project->id]);

        // Create tickets for another project
        $otherProject = Project::factory()->create();
        Ticket::factory(1)->create(['project_id' => $otherProject->id]);

        // Test filtering by project slug
        $response = $this->actingAs($this->admin)
            ->getJson("/api/helpdesk/admin/tickets?project={$this->project->slug}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // Should return only the 2 tickets for this project

        // Verify we get the correct tickets
        $returnedTicketIds = collect($response->json('data'))->pluck('id')->sort()->values();
        $expectedTicketIds = $projectTickets->pluck('id')->sort()->values();

        $this->assertEquals($expectedTicketIds, $returnedTicketIds);
    }

    public function test_tickets_page_returns_all_tickets_when_no_project_filter(): void
    {
        // Create tickets for different projects
        Ticket::factory(2)->create(['project_id' => $this->project->id]);
        $otherProject = Project::factory()->create();
        Ticket::factory(3)->create(['project_id' => $otherProject->id]);

        // Test without any project filter
        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/tickets');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data'); // Should return all 5 tickets
    }
}
