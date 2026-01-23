<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Services\Helpdesk\TicketNotificationService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class AddCommentTool extends Tool
{
    protected string $description = 'Add a comment to a ticket. Can be marked as internal (staff only) or public.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $ticketId = $request->get('ticket_id');
        $ticket = $project->tickets()->find($ticketId);

        if (! $ticket) {
            return Response::error("Ticket not found with ID: {$ticketId}");
        }

        $content = $request->get('content');

        if (empty($content)) {
            return Response::error('Comment content is required.');
        }

        $comment = $ticket->comments()->create([
            'content' => $content,
            'is_internal' => $request->get('is_internal', false),
            'submitter_name' => 'MCP Bot',
            'submitter_email' => 'mcp@corelink.dev',
        ]);

        // Log activity
        $ticket->logActivity('comment_added');

        // Send notification (service handles internal comment exclusion)
        app(TicketNotificationService::class)->notifyCommentAdded($ticket, $comment);

        return Response::text(json_encode([
            'success' => true,
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'is_internal' => $comment->is_internal,
                'author' => $comment->author_name,
                'created_at' => $comment->created_at->toIso8601String(),
            ],
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ticket_id' => $schema->integer()
                ->description('The ID of the ticket to comment on')
                ->required(),
            'content' => $schema->string()
                ->description('The comment text')
                ->required(),
            'is_internal' => $schema->boolean()
                ->description('If true, comment is only visible to staff (default: false)'),
        ];
    }
}
