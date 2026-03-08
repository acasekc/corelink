<?php

namespace Tests\Feature\Helpdesk;

use App\Mcp\McpContext;
use App\Mcp\Tools\Helpdesk\CreateTicketTool;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use JsonException;
use Laravel\Mcp\Request;
use Mockery;
use Tests\TestCase;

class McpCreateTicketToolTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;

    protected TicketStatus $status;

    protected TicketPriority $priority;

    protected TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->project = Project::factory()->create();

        $this->status = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
            'title' => 'Open',
            'is_default' => true,
        ]);

        $this->priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'normal',
            'title' => 'Normal',
        ]);

        $this->type = TicketType::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'question',
            'title' => 'Question',
        ]);

        McpContext::setProject($this->project);
    }

    protected function tearDown(): void
    {
        McpContext::clear();
        Mockery::close();

        parent::tearDown();
    }

    public function test_project_create_ticket_uses_next_number_after_soft_deleted_ticket(): void
    {
        $firstTicket = $this->project->createTicket($this->ticketAttributes());
        $firstTicket->delete();

        $secondTicket = $this->project->createTicket($this->ticketAttributes([
            'title' => 'Second ticket',
        ]));

        $this->assertSame(1, $firstTicket->number);
        $this->assertSame(2, $secondTicket->number);
    }

    /**
     * @throws JsonException
     */
    public function test_create_ticket_tool_returns_existing_ticket_after_duplicate_number_conflict(): void
    {
        $existingTicket = $this->project->createTicket($this->ticketAttributes());
        $existingTicket->load(['status', 'priority', 'type', 'project']);

        /** @var CreateTicketTool&\Mockery\MockInterface $tool */
        $tool = Mockery::mock(CreateTicketTool::class)->makePartial();
        $tool->shouldAllowMockingProtectedMethods();
        $tool->shouldReceive('createTicket')
            ->once()
            ->andThrow($this->duplicateTicketNumberException());

        $response = $tool->handle(new Request($this->requestPayload()));
        $payload = $this->decodeResponse($response);

        $this->assertFalse($response->isError());
        $this->assertTrue($payload['success']);
        $this->assertTrue($payload['duplicate']);
        $this->assertSame($existingTicket->id, $payload['ticket']['id']);
        $this->assertSame($existingTicket->number, $payload['ticket']['number']);
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketAttributes(array $overrides = []): array
    {
        return [
            'title' => 'Contact page map and contact panel customization',
            'content' => 'Please update the contact page map and the contact panel content.',
            'status_id' => $this->status->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_name' => 'Aaron Case',
            'submitter_email' => 'aaron@corelink.dev',
            'metadata' => null,
        ] + $overrides;
    }

    /**
     * @return array<string, mixed>
     */
    private function requestPayload(array $overrides = []): array
    {
        return [
            'title' => 'Contact page map and contact panel customization',
            'content' => 'Please update the contact page map and the contact panel content.',
            'submitter_name' => 'Aaron Case',
            'submitter_email' => 'aaron@corelink.dev',
            'priority' => 'normal',
            'type' => 'question',
        ] + $overrides;
    }

    private function duplicateTicketNumberException(): QueryException
    {
        return new QueryException(
            'mysql',
            'insert into `helpdesk_tickets` (...) values (...)',
            [],
            new Exception("SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '7-18' for key 'helpdesk_tickets_project_id_number_unique'")
        );
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
