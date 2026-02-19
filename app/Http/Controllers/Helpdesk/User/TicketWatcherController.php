<?php

namespace App\Http\Controllers\Helpdesk\User;

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
    public function index(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $watchers = $ticket->watchers()->select('users.id', 'users.name', 'users.email')->get();

        return response()->json([
            'data' => $watchers->map(fn (User $watcher) => [
                'id' => $watcher->id,
                'name' => $watcher->name,
                'email' => $watcher->email,
            ]),
        ]);
    }

    /**
     * Toggle the current user's watch on a ticket (watch/unwatch)
     */
    public function toggle(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (! $user->canViewTicket($ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $isWatching = $ticket->watchers()->where('user_id', $user->id)->exists();

        if ($isWatching) {
            $ticket->watchers()->detach($user->id);
            $ticket->logActivity('watcher_removed', $user->name, null, $user->id);

            return response()->json([
                'watching' => false,
                'message' => 'You are no longer watching this ticket',
            ]);
        }

        $ticket->watchers()->attach($user->id);
        $ticket->logActivity('watcher_added', null, $user->name, $user->id);

        return response()->json([
            'watching' => true,
            'message' => 'You are now watching this ticket',
        ]);
    }
}
