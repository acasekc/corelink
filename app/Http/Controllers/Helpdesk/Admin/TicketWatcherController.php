<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketWatcherController extends Controller
{
    /**
     * List watchers for a ticket
     */
    public function index(Ticket $ticket): JsonResponse
    {
        $watchers = $ticket->watchers()->select('users.id', 'users.name', 'users.email')->get();

        return response()->json([
            'data' => $watchers->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]),
        ]);
    }

    /**
     * Add a watcher to a ticket
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($ticket->watchers()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is already watching this ticket',
            ], 422);
        }

        $ticket->watchers()->attach($user->id);

        $ticket->logActivity('watcher_added', null, $user->name);

        return response()->json([
            'message' => 'Watcher added successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    /**
     * Remove a watcher from a ticket
     */
    public function destroy(Ticket $ticket, User $user): JsonResponse
    {
        if (! $ticket->watchers()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is not watching this ticket',
            ], 404);
        }

        $ticket->watchers()->detach($user->id);

        $ticket->logActivity('watcher_removed', $user->name, null);

        return response()->json([], 204);
    }

    /**
     * Search users available to be added as watchers
     */
    public function available(Request $request, Ticket $ticket): JsonResponse
    {
        $search = $request->input('search', '');

        $existingWatcherIds = $ticket->watchers()->pluck('users.id')->toArray();

        $query = User::query()
            ->whereNotIn('id', $existingWatcherIds)
            ->whereNull('deleted_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->limit(10)->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]),
        ]);
    }
}
