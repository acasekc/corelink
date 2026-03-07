<?php

namespace Tests\Feature\Helpdesk\Api;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentViewUrlTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private string $plainApiKey;

    private TicketStatus $status;

    private TicketPriority $priority;

    private TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->project = Project::factory()->create([
            'name' => 'Attachment Test Project',
            'slug' => 'attachment-test-project',
            'ticket_prefix' => 'ATP',
            'is_active' => true,
        ]);

        $this->plainApiKey = ApiKey::generateKey();

        ApiKey::create([
            'project_id' => $this->project->id,
            'key' => ApiKey::hashKey($this->plainApiKey),
            'name' => 'Attachment API Key',
            'is_active' => true,
        ]);

        $this->status = TicketStatus::factory()->create([
            'project_id' => $this->project->id,
            'slug' => 'open',
        ]);

        $this->priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $this->type = TicketType::factory()->create([
            'project_id' => $this->project->id,
        ]);
    }

    public function test_ticket_api_includes_view_url_only_for_image_attachments(): void
    {
        $ticket = $this->createTicket();
        $imageAttachment = $this->createAttachment($ticket, 'screenshot.png', 'image/png', 'fake-image-bytes');
        $documentAttachment = $this->createAttachment($ticket, 'report.pdf', 'application/pdf', 'fake-pdf-bytes');

        $response = $this->getJson("/api/helpdesk/v1/tickets/{$ticket->id}", [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertOk();
        $attachments = $response->json('data.attachments');

        $this->assertCount(2, $attachments);

        $imagePayload = collect($attachments)->firstWhere('id', $imageAttachment->id);
        $documentPayload = collect($attachments)->firstWhere('id', $documentAttachment->id);

        $this->assertNotNull($imagePayload['view_url'] ?? null);
        $this->assertStringContainsString(
            "/api/helpdesk/v1/attachments/{$imageAttachment->id}/view",
            $imagePayload['view_url']
        );

        $this->assertArrayNotHasKey('view_url', $documentPayload);
    }

    public function test_comment_api_includes_view_url_only_for_image_attachments(): void
    {
        $ticket = $this->createTicket();
        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'content' => 'Here is a screenshot',
            'submitter_name' => 'Jane Doe',
            'submitter_email' => 'jane@example.com',
            'is_internal' => false,
        ]);

        $imageAttachment = $this->createAttachment($comment, 'comment-image.png', 'image/png', 'comment-image-bytes');
        $this->createAttachment($comment, 'comment-note.txt', 'text/plain', 'comment text');

        $response = $this->getJson("/api/helpdesk/v1/tickets/{$ticket->id}/comments", [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertOk();
        $attachments = $response->json('data.0.attachments');
        $imagePayload = collect($attachments)->firstWhere('id', $imageAttachment->id);

        $this->assertNotNull($imagePayload['view_url'] ?? null);
        $this->assertStringContainsString(
            "/api/helpdesk/v1/attachments/{$imageAttachment->id}/view",
            $imagePayload['view_url']
        );
    }

    public function test_external_view_endpoint_renders_image_inline(): void
    {
        $ticket = $this->createTicket();
        $attachment = $this->createAttachment($ticket, 'preview.png', 'image/png', 'image-preview-content');

        $response = $this->get("/api/helpdesk/v1/attachments/{$attachment->id}/view", [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'image/png');
        $response->assertHeader('content-disposition', 'inline; filename="preview.png"');
    }

    public function test_external_view_endpoint_rejects_non_images(): void
    {
        $ticket = $this->createTicket();
        $attachment = $this->createAttachment($ticket, 'manual.pdf', 'application/pdf', 'pdf-content');

        $response = $this->getJson("/api/helpdesk/v1/attachments/{$attachment->id}/view", [
            'X-API-Key' => $this->plainApiKey,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Attachment is not an image']);
    }

    private function createTicket(): Ticket
    {
        return Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $this->status->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'title' => 'Attachment test ticket',
            'content' => 'Testing attachments',
            'submitter_name' => 'Jane Doe',
            'submitter_email' => 'jane@example.com',
        ]);
    }

    private function createAttachment(
        Ticket|Comment $attachable,
        string $filename,
        string $mimeType,
        string $contents,
    ): Attachment {
        $path = 'helpdesk/attachments/'.now()->format('Y/m').'/'.fake()->uuid().'_'.$filename;
        Storage::disk('local')->put($path, $contents);

        return $attachable->attachments()->create([
            'uploaded_by' => null,
            'filename' => $filename,
            'path' => $path,
            'disk' => 'local',
            'mime_type' => $mimeType,
            'size' => strlen($contents),
        ]);
    }
}
