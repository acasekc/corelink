<?php

namespace Tests\Feature\Helpdesk;

use App\Mcp\McpContext;
use App\Mcp\Tools\Helpdesk\GetTicketTool;
use App\Mcp\Tools\Helpdesk\ListStatusesTool;
use App\Mcp\Tools\Helpdesk\UpdateTicketTool;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use JsonException;
use Laravel\Mcp\Request;
use Tests\TestCase;

class McpTicketUpdateToolTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;

    protected TicketStatus $openStatus;

    protected TicketStatus $closedStatus;

    protected Ticket $ticket;

    /**
     * @throws JsonException
     */
    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->project = Project::factory()->create();

        $this->openStatus = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
        ]);

        $this->closedStatus = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'closed',
            'title' => 'Closed',
        ]);

        $priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $type = TicketType::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $this->ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $this->openStatus->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
        ]);

        McpContext::setProject($this->project);
    }

    protected function tearDown(): void
    {
        McpContext::clear();

        parent::tearDown();
    }

    /**
     * @throws JsonException
     */
    public function test_update_ticket_tool_can_change_status_using_slug(): void
    {
        $response = app(UpdateTicketTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
            'status' => 'closed',
        ]));

        $payload = $this->decodeResponse($response);

        $this->assertFalse($response->isError());
        $this->assertSame($this->ticket->id, $payload['ticket_id']);
        $this->assertContains('status: Open → Closed', $payload['updates']);

        $this->assertDatabaseHas('helpdesk_tickets', [
            'id' => $this->ticket->id,
            'status_id' => $this->closedStatus->id,
        ]);

        $this->assertDatabaseHas('helpdesk_ticket_activities', [
            'ticket_id' => $this->ticket->id,
            'action' => 'status_changed',
            'new_value' => 'Closed',
        ]);
    }

    /**
     * @throws JsonException
     */
    public function test_list_statuses_tool_exposes_slug_and_title_metadata(): void
    {
        $response = app(ListStatusesTool::class)->handle(new Request);

        $payload = $this->decodeResponse($response);
        $closedStatus = collect($payload['statuses'])->firstWhere('id', $this->closedStatus->id);

        $this->assertFalse($response->isError());
        $this->assertSame('Closed', $closedStatus['name']);
        $this->assertSame('Closed', $closedStatus['title']);
        $this->assertSame('closed', $closedStatus['slug']);
    }

    /**
     * @throws JsonException
     */
    public function test_get_ticket_tool_returns_status_slug_and_title(): void
    {
        $response = app(GetTicketTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
        ]));

        $payload = $this->decodeResponse($response);

        $this->assertFalse($response->isError());
        $this->assertSame('Open', $payload['status']['name']);
        $this->assertSame('Open', $payload['status']['title']);
        $this->assertSame('open', $payload['status']['slug']);
    }

    /**
     * @return array<string, mixed>
     *
     * @throws JsonException
     */
    private function decodeResponse(\Laravel\Mcp\Response $response): array
    {
        return json_decode((string) $response->content(), true, 512, JSON_THROW_ON_ERROR);
    }
}
