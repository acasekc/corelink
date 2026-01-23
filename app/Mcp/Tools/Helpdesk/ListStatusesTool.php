<?php

namespace App\Mcp\Tools\Helpdesk;

use App\Mcp\McpContext;
use App\Models\Helpdesk\TicketStatus;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListStatusesTool extends Tool
{
    protected string $description = 'List all ticket statuses available in this project.';

    public function handle(Request $request): Response
    {
        $project = McpContext::project();

        if (! $project) {
            return Response::error('No project associated with this API key.');
        }

        // Get project-specific statuses OR global statuses (where project_id is null)
        $statuses = TicketStatus::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->orderBy('order')
            ->get();

        $result = $statuses->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->title,
            'text_color' => $s->text_color,
            'bg_color' => $s->bg_color,
            'is_default' => $s->is_default,
        ]);

        return Response::text(json_encode([
            'count' => $statuses->count(),
            'statuses' => $result,
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
