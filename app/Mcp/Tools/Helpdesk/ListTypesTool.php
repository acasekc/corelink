<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketType;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListTypesTool extends Tool
{
    protected string $description = 'List all ticket types available in this project.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        // Get project-specific types OR global types (where project_id is null)
        $types = TicketType::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->orderBy('title')
            ->get();

        $result = $types->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->title,
            'icon' => $t->icon,
            'text_color' => $t->text_color,
            'bg_color' => $t->bg_color,
        ]);

        return Response::text(json_encode([
            'count' => $types->count(),
            'types' => $result,
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
