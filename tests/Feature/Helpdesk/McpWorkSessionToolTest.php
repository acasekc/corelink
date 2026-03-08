<?php

namespace Tests\Feature\Helpdesk;

use App\Mcp\McpContext;
use App\Mcp\Tools\Helpdesk\EndTimeEntrySessionTool;
use App\Mcp\Tools\Helpdesk\GetTicketTool;
use App\Mcp\Tools\Helpdesk\StartTimeEntrySessionTool;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use JsonException;
use Laravel\Mcp\Request;
use Tests\TestCase;

class McpWorkSessionToolTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;

    protected Ticket $ticket;

    /**
     * @throws JsonException
     */
    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->project = Project::factory()->create();

        $status = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
            'is_default' => true,
        ]);

        $priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $type = TicketType::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $this->ticket = Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $status->id,
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
    public function test_start_time_entry_session_creates_active_session(): void
    {
        Carbon::setTestNow('2026-03-07 09:00:00');

        $response = app(StartTimeEntrySessionTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
            'description' => 'Investigating the issue',
        ]));

        $payload = $this->decodeResponse($response);

        $this->assertFalse($response->isError());
        $this->assertTrue($payload['success']);
        $this->assertSame('active', $payload['time_entry']['status']);

        $this->assertDatabaseHas('helpdesk_time_entries', [
            'ticket_id' => $this->ticket->id,
            'minutes' => 0,
            'description' => 'Investigating the issue',
        ]);
    }

    /**
     * @throws JsonException
     */
    public function test_end_time_entry_session_records_elapsed_time(): void
    {
        Carbon::setTestNow('2026-03-07 09:00:00');

        $startResponse = app(StartTimeEntrySessionTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
            'description' => 'Implementing the fix',
        ]));

        $startedPayload = $this->decodeResponse($startResponse);
        $timeEntryId = $startedPayload['time_entry']['id'];

        Carbon::setTestNow('2026-03-07 10:35:00');

        $endResponse = app(EndTimeEntrySessionTool::class)->handle(new Request([
            'time_entry_id' => $timeEntryId,
            'description' => 'Implemented and tested the fix',
        ]));

        $payload = $this->decodeResponse($endResponse);

        $this->assertFalse($endResponse->isError());
        $this->assertTrue($payload['success']);
        $this->assertSame(95, $payload['time_entry']['minutes']);
        $this->assertSame('1h 35m', $payload['time_entry']['formatted']);
        $this->assertSame(95, $payload['ticket_total_time']['minutes']);

        $this->assertDatabaseHas('helpdesk_time_entries', [
            'id' => $timeEntryId,
            'minutes' => 95,
            'description' => 'Implemented and tested the fix',
        ]);
    }

    /**
     * @throws JsonException
     */
    public function test_get_ticket_tool_returns_active_time_entry_details(): void
    {
        Carbon::setTestNow('2026-03-07 09:00:00');

        app(StartTimeEntrySessionTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
            'description' => 'Reviewing setup steps',
        ]));

        $response = app(GetTicketTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
        ]));

        $payload = $this->decodeResponse($response);

        $this->assertFalse($response->isError());
        $this->assertSame('Reviewing setup steps', $payload['active_time_entry']['description']);
        $this->assertSame('active', $payload['active_time_entry']['status']);
        $this->assertSame(0, $payload['time_entries'][0]['minutes']);
    }

    /**
     * @throws JsonException
     */
    public function test_cannot_start_second_active_session_for_same_ticket(): void
    {
        Carbon::setTestNow('2026-03-07 09:00:00');

        app(StartTimeEntrySessionTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
        ]));

        $response = app(StartTimeEntrySessionTool::class)->handle(new Request([
            'ticket_id' => $this->ticket->id,
        ]));

        $this->assertTrue($response->isError());
        $this->assertStringContainsString('already has an active work session', (string) $response->content());
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
