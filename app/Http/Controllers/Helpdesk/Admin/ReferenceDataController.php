<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\TicketPriority;
use App\Models\Helpdesk\TicketStatus;
use App\Models\Helpdesk\TicketType;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReferenceDataController extends Controller
{
    public function statuses(): JsonResponse
    {
        $statuses = TicketStatus::whereNull('project_id')
            ->orderBy('order')
            ->get();

        return response()->json([
            'data' => $statuses->map(fn (TicketStatus $status) => [
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

    public function priorities(): JsonResponse
    {
        $priorities = TicketPriority::whereNull('project_id')
            ->orderBy('order')
            ->get();

        return response()->json([
            'data' => $priorities->map(fn (TicketPriority $priority) => [
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

    public function types(): JsonResponse
    {
        $types = TicketType::whereNull('project_id')->get();

        return response()->json([
            'data' => $types->map(fn (TicketType $type) => [
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
