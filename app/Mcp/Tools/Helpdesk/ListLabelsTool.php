<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListLabelsTool extends Tool
{
    protected string $description = 'List all labels available in this project.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        $labels = $project->labels()->orderBy('name')->get();

        $result = $labels->map(fn ($l) => [
            'id' => $l->id,
            'name' => $l->name,
            'color' => $l->color,
        ]);

        return Response::text(json_encode([
            'count' => $labels->count(),
            'labels' => $result,
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
