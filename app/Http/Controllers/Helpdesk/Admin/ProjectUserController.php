<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Enums\Helpdesk\ProjectRole;
use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectUserController extends Controller
{
    /**
     * List users for a specific project
     */
    public function index(Project $project): JsonResponse
    {
        $users = $project->users()
            ->orderByPivot('role')
            ->orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'role' => $user->pivot->role->value,
                'role_label' => $user->pivot->role->label(),
                'receive_notifications' => $user->pivot->receive_notifications,
                'joined_at' => $user->pivot->created_at,
            ]);

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Add a user to a project
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::enum(ProjectRole::class)],
            'receive_notifications' => ['boolean'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($project->hasUser($user)) {
            return response()->json([
                'message' => 'User is already a member of this project',
            ], 422);
        }

        $project->users()->attach($user->id, [
            'role' => $validated['role'],
            'receive_notifications' => $validated['receive_notifications'] ?? true,
        ]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $validated['role'],
                'receive_notifications' => $validated['receive_notifications'] ?? true,
            ],
            'message' => 'User added to project successfully',
        ], 201);
    }

    /**
     * Update a user's role in a project
     */
    public function update(Request $request, Project $project, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['sometimes', Rule::enum(ProjectRole::class)],
            'receive_notifications' => ['sometimes', 'boolean'],
        ]);

        if (! $project->hasUser($user)) {
            return response()->json([
                'message' => 'User is not a member of this project',
            ], 404);
        }

        $updateData = [];
        if (isset($validated['role'])) {
            $updateData['role'] = $validated['role'];
        }
        if (isset($validated['receive_notifications'])) {
            $updateData['receive_notifications'] = $validated['receive_notifications'];
        }

        $project->users()->updateExistingPivot($user->id, $updateData);

        $freshUser = $project->users()->where('user_id', $user->id)->first();

        return response()->json([
            'data' => [
                'id' => $freshUser->id,
                'name' => $freshUser->name,
                'email' => $freshUser->email,
                'role' => $freshUser->pivot->role->value,
                'role_label' => $freshUser->pivot->role->label(),
                'receive_notifications' => $freshUser->pivot->receive_notifications,
            ],
            'message' => 'User role updated successfully',
        ]);
    }

    /**
     * Remove a user from a project
     */
    public function destroy(Project $project, User $user): JsonResponse
    {
        if (! $project->hasUser($user)) {
            return response()->json([
                'message' => 'User is not a member of this project',
            ], 404);
        }

        // Prevent removing the last owner
        if ($project->getUserRole($user) === ProjectRole::Owner) {
            $ownerCount = $project->owners()->count();
            if ($ownerCount <= 1) {
                return response()->json([
                    'message' => 'Cannot remove the only owner of the project',
                ], 422);
            }
        }

        $project->removeUser($user);

        return response()->json([
            'message' => 'User removed from project successfully',
        ]);
    }

    /**
     * Get users available to add to a project (not already members)
     */
    public function available(Request $request, Project $project): JsonResponse
    {
        $search = $request->input('q', '');

        $existingUserIds = $project->users()->pluck('users.id');

        $users = User::query()
            ->whereNotIn('id', $existingUserIds)
            ->where(function ($q) use ($search) {
                if ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }
            })
            ->limit(20)
            ->get(['id', 'name', 'email', 'is_admin']);

        return response()->json([
            'data' => $users,
        ]);
    }
}
