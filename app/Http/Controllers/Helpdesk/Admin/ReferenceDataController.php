<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceDataController extends Controller
{
    public function statuses(Request $request): JsonResponse
    {
        $projectId = $request->input('project_id');

        // Try project-specific first, then fall back to global
        $statuses = TicketStatus::where(function ($query) use ($projectId) {
            $query->where('project_id', $projectId)
                ->orWhereNull('project_id');
        })
            ->orderByRaw('project_id IS NULL') // Project-specific first
            ->orderBy('order')
            ->get()
            ->unique('slug'); // Dedupe by slug, keeping project-specific

        return response()->json([
            'data' => $statuses->values()->map(fn (TicketStatus $status) => [
                'id' => $status->id,
                'slug' => $status->slug,
                'title' => $status->title,
                'text_color' => $status->text_color,
                'bg_color' => $status->bg_color,
                'is_default' => $status->is_default,
                'order' => $status->order,
            ]),
        ]);
    }

    public function priorities(Request $request): JsonResponse
    {
        $projectId = $request->input('project_id');

        // Try project-specific first, then fall back to global
        $priorities = TicketPriority::where(function ($query) use ($projectId) {
            $query->where('project_id', $projectId)
                ->orWhereNull('project_id');
        })
            ->orderByRaw('project_id IS NULL') // Project-specific first
            ->orderBy('order')
            ->get()
            ->unique('slug'); // Dedupe by slug, keeping project-specific

        return response()->json([
            'data' => $priorities->values()->map(fn (TicketPriority $priority) => [
                'id' => $priority->id,
                'slug' => $priority->slug,
                'title' => $priority->title,
                'text_color' => $priority->text_color,
                'bg_color' => $priority->bg_color,
                'icon' => $priority->icon,
                'order' => $priority->order,
            ]),
        ]);
    }

    public function types(Request $request): JsonResponse
    {
        $projectId = $request->input('project_id');

        // Try project-specific first, then fall back to global
        $types = TicketType::where(function ($query) use ($projectId) {
            $query->where('project_id', $projectId)
                ->orWhereNull('project_id');
        })
            ->orderByRaw('project_id IS NULL') // Project-specific first
            ->get()
            ->unique('slug'); // Dedupe by slug, keeping project-specific

        return response()->json([
            'data' => $types->values()->map(fn (TicketType $type) => [
                'id' => $type->id,
                'slug' => $type->slug,
                'title' => $type->title,
                'text_color' => $type->text_color,
                'bg_color' => $type->bg_color,
                'icon' => $type->icon,
            ]),
        ]);
    }

    public function admins(): JsonResponse
    {
        $admins = User::where('is_admin', true)->get();

        return response()->json([
            'data' => $admins->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]),
        ]);
    }
}
