<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketPriority;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListPrioritiesTool extends Tool
{
    protected string $description = 'List all ticket priorities available in this project.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        // Get project-specific priorities OR global priorities (where project_id is null)
        $priorities = TicketPriority::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->orderBy('order')
            ->get();

        $result = $priorities->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->title,
            'icon' => $p->icon,
            'text_color' => $p->text_color,
            'bg_color' => $p->bg_color,
        ]);

        return Response::text(json_encode([
            'count' => $priorities->count(),
            'priorities' => $result,
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
