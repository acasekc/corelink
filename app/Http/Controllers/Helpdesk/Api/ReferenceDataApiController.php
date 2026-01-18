<?php

namespace App\Http\Controllers\Helpdesk\Api;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceDataApiController extends Controller
{
    public function statuses(Request $request): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $statuses = TicketStatus::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->orderBy('order')
            ->get();

        return response()->json([
            'data' => $statuses->map(fn (TicketStatus $status) => [
                'slug' => $status->slug,
                'title' => $status->title,
                'color' => $status->bg_color,
                'is_default' => $status->is_default,
            ]),
        ]);
    }

    public function priorities(Request $request): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $priorities = TicketPriority::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->orderBy('order')
            ->get();

        return response()->json([
            'data' => $priorities->map(fn (TicketPriority $priority) => [
                'slug' => $priority->slug,
                'title' => $priority->title,
                'color' => $priority->bg_color,
            ]),
        ]);
    }

    public function types(Request $request): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('helpdesk_project');

        $types = TicketType::where('project_id', $project->id)
            ->orWhereNull('project_id')
            ->get();

        return response()->json([
            'data' => $types->map(fn (TicketType $type) => [
                'slug' => $type->slug,
                'title' => $type->title,
                'color' => $type->bg_color,
                'icon' => $type->icon,
            ]),
        ]);
    }
}
