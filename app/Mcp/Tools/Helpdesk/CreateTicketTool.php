<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateTicketTool extends Tool
{
    protected string $description = 'Create a new support ticket in the helpdesk.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $title = $request->get('title');
        $content = $request->get('content');
        $submitterName = $request->get('submitter_name');
        $submitterEmail = $request->get('submitter_email');
        $prioritySlug = $request->get('priority');
        $typeSlug = $request->get('type');
        $metadata = $request->get('metadata');

        // Validate required fields
        if (empty($title) || empty($content) || empty($submitterName) || empty($submitterEmail)) {
            return Response::error('Missing required fields: title, content, submitter_name, and submitter_email are required.');
        }

        if (! filter_var($submitterEmail, FILTER_VALIDATE_EMAIL)) {
            return Response::error('Invalid email address provided for submitter_email.');
        }

        // Get default status
        $status = TicketStatus::getDefaultForProject($project->id);

        // Get priority - use provided or default
        $priority = null;
        if (! empty($prioritySlug)) {
            $priority = TicketPriority::where('slug', $prioritySlug)
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();

            if (! $priority) {
                return Response::error("Invalid priority slug: {$prioritySlug}. Use list_priorities to see available options.");
            }
        }
        if (! $priority) {
            $priority = TicketPriority::query()
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->orderBy('order')
                ->orderBy('id')
                ->first();
        }

        // Get type - use provided or default
        $type = null;
        if (! empty($typeSlug)) {
            $type = TicketType::where('slug', $typeSlug)
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->first();

            if (! $type) {
                return Response::error("Invalid type slug: {$typeSlug}. Use list_types to see available options.");
            }
        }
        if (! $type) {
            $type = TicketType::query()
                ->where(fn ($q) => $q->where('project_id', $project->id)->orWhereNull('project_id'))
                ->orderBy('id')
                ->first();
        }

        // Create the ticket
        $ticket = $project->tickets()->create([
            'number' => $project->getNextTicketNumber(),
            'title' => $title,
            'content' => $content,
            'status_id' => $status->id,
            'priority_id' => $priority->id,
            'type_id' => $type->id,
            'submitter_name' => $submitterName,
            'submitter_email' => $submitterEmail,
            'metadata' => $metadata,
        ]);

        $ticket->logActivity('created', null, null, null);

        // Load relationships for response
        $ticket->load(['status', 'priority', 'type']);

        return Response::text(json_encode([
            'success' => true,
            'ticket' => [
                'id' => $ticket->id,
                'number' => $ticket->number,
                'title' => $ticket->title,
                'content' => $ticket->content,
                'status' => [
                    'id' => $ticket->status?->id,
                    'name' => $ticket->status?->title,
                    'slug' => $ticket->status?->slug,
                ],
                'priority' => [
                    'id' => $ticket->priority?->id,
                    'name' => $ticket->priority?->title,
                    'slug' => $ticket->priority?->slug,
                ],
                'type' => [
                    'id' => $ticket->type?->id,
                    'name' => $ticket->type?->title,
                    'slug' => $ticket->type?->slug,
                ],
                'submitter_name' => $ticket->submitter_name,
                'submitter_email' => $ticket->submitter_email,
                'created_at' => $ticket->created_at->toIso8601String(),
            ],
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()
                ->description('The ticket title/subject (max 255 characters)')
                ->required(),
            'content' => $schema->string()
                ->description('The ticket description/body')
                ->required(),
            'submitter_name' => $schema->string()
                ->description('Name of the person submitting the ticket')
                ->required(),
            'submitter_email' => $schema->string()
                ->description('Email address of the person submitting the ticket')
                ->required(),
            'priority' => $schema->string()
                ->description('Priority slug (optional). Use list_priorities to see available options.'),
            'type' => $schema->string()
                ->description('Type slug (optional). Use list_types to see available options.'),
            'metadata' => $schema->object()
                ->description('Optional metadata object to store custom fields.'),
        ];
    }
}
