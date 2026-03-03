<?php

namespace Tests\Feature\Helpdesk;

use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentZipDownloadTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private TicketStatus $status;

    private TicketPriority $priority;

    private TicketType $type;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->project = Project::factory()->create();

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

        $this->admin = User::factory()->create(['is_admin' => true]);

        $this->user = User::factory()->create(['is_admin' => false]);
        $this->project->users()->attach($this->user->id, [
            'role' => 'user',
            'receive_notifications' => false,
            'auto_watch_all_tickets' => false,
        ]);
    }

    private function createTicket(): Ticket
    {
        return Ticket::factory()->create([
            'project_id' => $this->project->id,
            'status_id' => $this->status->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
            'submitter_user_id' => $this->user->id,
            'submitter_email' => $this->user->email,
        ]);
    }

    private function createAttachment($model, string $filename = 'test.pdf'): Attachment
    {
        $path = 'helpdesk/attachments/'.now()->format('Y/m').'/'.fake()->uuid().'_'.$filename;
        Storage::disk('local')->put($path, 'fake file contents for '.$filename);

        return $model->attachments()->create([
            'uploaded_by' => $this->admin->id,
            'filename' => $filename,
            'path' => $path,
            'disk' => 'local',
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);
    }

    public function test_admin_can_download_all_attachments_as_zip(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'doc1.pdf');
        $this->createAttachment($ticket, 'doc2.pdf');

        $response = $this->actingAs($this->admin)
            ->get("/api/helpdesk/admin/tickets/{$ticket->id}/attachments/download-all");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
        $response->assertDownload("ticket-{$ticket->number}-attachments.zip");
    }

    public function test_user_can_download_all_attachments_as_zip(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'doc1.pdf');
        $this->createAttachment($ticket, 'doc2.pdf');

        $response = $this->actingAs($this->user)
            ->get("/api/helpdesk/user/tickets/{$ticket->id}/attachments/download-all");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
        $response->assertDownload("ticket-{$ticket->number}-attachments.zip");
    }

    public function test_zip_includes_comment_attachments(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'ticket-file.pdf');

        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->admin->id,
            'content' => 'Here is a file',
            'is_internal' => false,
        ]);
        $this->createAttachment($comment, 'comment-file.pdf');

        $response = $this->actingAs($this->admin)
            ->get("/api/helpdesk/admin/tickets/{$ticket->id}/attachments/download-all");

        $response->assertOk();
        $response->assertDownload("ticket-{$ticket->number}-attachments.zip");
    }

    public function test_returns_404_when_no_attachments(): void
    {
        $ticket = $this->createTicket();

        $response = $this->actingAs($this->admin)
            ->get("/api/helpdesk/admin/tickets/{$ticket->id}/attachments/download-all");

        $response->assertNotFound();
        $response->assertJson(['message' => 'No attachments to download']);
    }

    public function test_unauthorized_user_cannot_download_zip(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'doc.pdf');

        $otherUser = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($otherUser)
            ->get("/api/helpdesk/user/tickets/{$ticket->id}/attachments/download-all");

        $response->assertForbidden();
    }

    public function test_unauthenticated_cannot_download_zip(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'doc.pdf');

        $response = $this->get("/api/helpdesk/user/tickets/{$ticket->id}/attachments/download-all");

        $response->assertRedirect();
    }

    public function test_duplicate_filenames_are_deduplicated(): void
    {
        $ticket = $this->createTicket();
        $this->createAttachment($ticket, 'report.pdf');
        $this->createAttachment($ticket, 'report.pdf');
        $this->createAttachment($ticket, 'report.pdf');

        $response = $this->actingAs($this->admin)
            ->get("/api/helpdesk/admin/tickets/{$ticket->id}/attachments/download-all");

        $response->assertOk();
        $response->assertDownload("ticket-{$ticket->number}-attachments.zip");
    }
}
