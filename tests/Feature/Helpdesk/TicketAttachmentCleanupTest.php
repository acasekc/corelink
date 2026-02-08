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

class TicketAttachmentCleanupTest extends TestCase
{
    use RefreshDatabase;

    private Project $project;

    private TicketStatus $openStatus;

    private TicketStatus $closedStatus;

    private TicketPriority $priority;

    private TicketType $type;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

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

        $this->priority = TicketPriority::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $this->type = TicketType::factory()->create([
            'project_id' => $this->project->id,
        ]);
    }

    private function createTicket(array $attributes = []): Ticket
    {
        return Ticket::factory()->create(array_merge([
            'project_id' => $this->project->id,
            'status_id' => $this->openStatus->id,
            'priority_id' => $this->priority->id,
            'type_id' => $this->type->id,
        ], $attributes));
    }

    private function createAttachmentForModel($model, string $filename = 'test.pdf'): Attachment
    {
        $path = 'helpdesk/attachments/'.now()->format('Y/m').'/'.fake()->uuid().'_'.$filename;
        Storage::disk('local')->put($path, 'fake file contents');

        return $model->attachments()->create([
            'uploaded_by' => User::factory()->create()->id,
            'filename' => $filename,
            'path' => $path,
            'disk' => 'local',
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);
    }

    // ========== CLOSED_AT TRACKING TESTS ==========

    public function test_closed_at_is_set_when_ticket_status_changes_to_closed(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->openStatus->id]);

        $this->assertNull($ticket->closed_at);

        $ticket->update(['status_id' => $this->closedStatus->id]);

        $ticket->refresh();
        $this->assertNotNull($ticket->closed_at);
        $this->assertTrue($ticket->closed_at->isToday());
    }

    public function test_closed_at_is_cleared_when_ticket_is_reopened(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);

        // Manually set closed_at since the factory create bypasses updating event
        $ticket->update(['closed_at' => now()->subDays(5)]);
        $ticket->refresh();
        $this->assertNotNull($ticket->closed_at);

        $ticket->update(['status_id' => $this->openStatus->id]);

        $ticket->refresh();
        $this->assertNull($ticket->closed_at);
    }

    public function test_closed_at_is_not_affected_when_non_status_fields_change(): void
    {
        $ticket = $this->createTicket([
            'status_id' => $this->closedStatus->id,
        ]);
        $ticket->update(['closed_at' => now()->subDays(10)]);
        $ticket->refresh();

        $originalClosedAt = $ticket->closed_at->toIso8601String();

        $ticket->update(['title' => 'Updated title']);
        $ticket->refresh();

        $this->assertEquals($originalClosedAt, $ticket->closed_at->toIso8601String());
    }

    // ========== PURGE ON DELETE TESTS ==========

    public function test_soft_deleting_ticket_purges_ticket_attachments(): void
    {
        $ticket = $this->createTicket();
        $attachment = $this->createAttachmentForModel($ticket);

        Storage::disk('local')->assertExists($attachment->path);

        $ticket->delete(); // soft delete

        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_soft_deleting_ticket_purges_comment_attachments(): void
    {
        $ticket = $this->createTicket();
        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'content' => 'Test comment',
            'submitter_name' => 'Tester',
            'submitter_email' => 'test@example.com',
        ]);
        $attachment = $this->createAttachmentForModel($comment, 'comment-file.pdf');

        Storage::disk('local')->assertExists($attachment->path);

        $ticket->delete(); // soft delete

        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_force_deleting_ticket_purges_all_attachments(): void
    {
        $ticket = $this->createTicket();
        $ticketAttachment = $this->createAttachmentForModel($ticket, 'ticket-file.pdf');
        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'content' => 'Comment with file',
            'submitter_name' => 'Tester',
            'submitter_email' => 'test@example.com',
        ]);
        $commentAttachment = $this->createAttachmentForModel($comment, 'comment-file.pdf');

        Storage::disk('local')->assertExists($ticketAttachment->path);
        Storage::disk('local')->assertExists($commentAttachment->path);

        $ticket->forceDelete();

        Storage::disk('local')->assertMissing($ticketAttachment->path);
        Storage::disk('local')->assertMissing($commentAttachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $ticketAttachment->id]);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $commentAttachment->id]);
    }

    public function test_purge_handles_soft_deleted_comments(): void
    {
        $ticket = $this->createTicket();
        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'content' => 'Deleted comment',
            'submitter_name' => 'Tester',
            'submitter_email' => 'test@example.com',
        ]);
        $attachment = $this->createAttachmentForModel($comment, 'soft-deleted-comment-file.pdf');

        // Soft-delete the comment first
        $comment->delete();

        Storage::disk('local')->assertExists($attachment->path);

        // Now delete the ticket — should still find and purge the trashed comment's attachments
        $ticket->delete();

        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $attachment->id]);
    }

    // ========== CLEANUP COMMAND TESTS ==========

    public function test_cleanup_command_deletes_attachments_from_old_closed_tickets(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);
        $ticket->update(['closed_at' => now()->subDays(31)]);
        $attachment = $this->createAttachmentForModel($ticket);

        Storage::disk('local')->assertExists($attachment->path);

        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30])
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_cleanup_command_does_not_delete_recently_closed_ticket_attachments(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);
        $ticket->update(['closed_at' => now()->subDays(10)]);
        $attachment = $this->createAttachmentForModel($ticket);

        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30])
            ->assertExitCode(0);

        Storage::disk('local')->assertExists($attachment->path);
        $this->assertDatabaseHas('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_cleanup_command_does_not_delete_open_ticket_attachments(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->openStatus->id]);
        $attachment = $this->createAttachmentForModel($ticket);

        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30])
            ->assertExitCode(0);

        Storage::disk('local')->assertExists($attachment->path);
        $this->assertDatabaseHas('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_cleanup_command_dry_run_does_not_delete_files(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);
        $ticket->update(['closed_at' => now()->subDays(31)]);
        $attachment = $this->createAttachmentForModel($ticket);

        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30, '--dry-run' => true])
            ->assertExitCode(0);

        Storage::disk('local')->assertExists($attachment->path);
        $this->assertDatabaseHas('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_cleanup_command_respects_custom_days_option(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);
        $ticket->update(['closed_at' => now()->subDays(8)]);
        $attachment = $this->createAttachmentForModel($ticket);

        // 7 days threshold — ticket closed 8 days ago should be cleaned
        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 7])
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $attachment->id]);
    }

    public function test_cleanup_command_also_deletes_comment_attachments(): void
    {
        $ticket = $this->createTicket(['status_id' => $this->closedStatus->id]);
        $ticket->update(['closed_at' => now()->subDays(31)]);
        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'content' => 'Comment with file',
            'submitter_name' => 'Tester',
            'submitter_email' => 'test@example.com',
        ]);
        $commentAttachment = $this->createAttachmentForModel($comment, 'comment-doc.pdf');

        Storage::disk('local')->assertExists($commentAttachment->path);

        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30])
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($commentAttachment->path);
        $this->assertDatabaseMissing('helpdesk_attachments', ['id' => $commentAttachment->id]);
    }

    public function test_cleanup_command_reports_no_tickets_when_none_match(): void
    {
        $this->artisan('helpdesk:cleanup-attachments', ['--days' => 30])
            ->expectsOutput('No tickets with attachments found past the cleanup threshold.')
            ->assertExitCode(0);
    }
}
