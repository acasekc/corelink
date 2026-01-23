<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetProjectTool extends Tool
{
    protected string $description = 'Get details about the current project associated with this API key.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $project->loadCount(['tickets', 'labels', 'statuses', 'priorities', 'types']);

        return Response::text(json_encode([
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'description' => $project->description,
            'client_name' => $project->client_name,
            'ticket_prefix' => $project->ticket_prefix,
            'github_repo' => $project->github_repo,
            'is_active' => $project->is_active,
            'tickets_count' => $project->tickets_count,
            'labels_count' => $project->labels_count,
            'statuses_count' => $project->statuses_count,
            'priorities_count' => $project->priorities_count,
            'types_count' => $project->types_count,
        ], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, \Illuminate\JsonSchema\Type\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
