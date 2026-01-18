<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Enums\Helpdesk\ProjectRole;
use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Project;
use App\Models\User;
use App\Services\Helpdesk\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * List all users with their project assignments
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->with(['helpdeskProjects' => fn ($q) => $q->select('helpdesk_projects.id', 'name', 'slug')])
            ->withCount('helpdeskProjects');

        // Include trashed users if requested
        if ($request->input('trashed') === 'only') {
            $query->onlyTrashed();
        } elseif ($request->input('trashed') === 'with') {
            $query->withTrashed();
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            if ($request->input('role') === 'admin') {
                $query->where('is_admin', true);
            } else {
                $query->whereHas('helpdeskProjects', function ($q) use ($request) {
                    $q->where('helpdesk_project_users.role', $request->input('role'));
                });
            }
        }

        $users = $query->orderBy('name')->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
        ]);
    }

    /**
     * Get a specific user with their project assignments
     */
    public function show(User $user): JsonResponse
    {
        $user->load([
            'helpdeskProjects' => fn ($q) => $q->select('helpdesk_projects.id', 'name', 'slug', 'color', 'description'),
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'created_at' => $user->created_at,
            'helpdesk_projects' => $user->helpdeskProjects->map(fn ($project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'color' => $project->color,
                'description' => $project->description,
                'pivot' => [
                    'role' => $project->pivot->role->value,
                    'receive_notifications' => $project->pivot->receive_notifications,
                ],
            ]),
        ]);
    }

    /**
     * Create a new user
     */
    public function store(Request $request, NotificationService $notificationService): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'is_admin' => ['boolean'],
            'send_welcome_email' => ['boolean'],
            'projects' => ['array'],
            'projects.*.id' => ['required', 'exists:helpdesk_projects,id'],
            'projects.*.role' => ['required', Rule::enum(ProjectRole::class)],
        ]);

        $plainPassword = $validated['password'];

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'is_admin' => $validated['is_admin'] ?? false,
            'force_password_change' => true,
        ]);

        $firstProject = null;
        if (! empty($validated['projects'])) {
            foreach ($validated['projects'] as $projectData) {
                $user->helpdeskProjects()->attach($projectData['id'], [
                    'role' => $projectData['role'],
                ]);
                if (! $firstProject) {
                    $firstProject = Project::find($projectData['id']);
                }
            }
        }

        // Send welcome email if requested (default true)
        if ($validated['send_welcome_email'] ?? true) {
            $notificationService->sendUserWelcome($user, $plainPassword, $firstProject);
        }

        return response()->json([
            'data' => $user->load('helpdeskProjects'),
            'message' => 'User created successfully',
        ], 201);
    }

    /**
     * Update a user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', Password::defaults()],
            'is_admin' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'data' => $user->fresh()->load('helpdeskProjects'),
            'message' => 'User updated successfully',
        ]);
    }

    /**
     * Delete a user (soft delete)
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->is_admin && User::where('is_admin', true)->count() === 1) {
            return response()->json([
                'message' => 'Cannot delete the only admin user',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Restore a soft-deleted user
     */
    public function restore(int $userId): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($userId);
        $user->restore();

        return response()->json([
            'data' => $user->fresh()->load('helpdeskProjects'),
            'message' => 'User restored successfully',
        ]);
    }

    /**
     * Permanently delete a user (hard delete)
     */
    public function forceDelete(int $userId): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($userId);

        // Only block if this is an active admin AND they're the only active admin
        // Soft-deleted admins can always be permanently deleted as long as there's at least one active admin
        if ($user->is_admin) {
            $activeAdminCount = User::where('is_admin', true)->count();
            $isUserActive = $user->deleted_at === null;

            // If the user is active and they're the only admin, block deletion
            // If the user is soft-deleted, only block if there are no active admins left
            if ($isUserActive && $activeAdminCount === 1) {
                return response()->json([
                    'message' => 'Cannot permanently delete the only admin user',
                ], 422);
            }

            if (! $isUserActive && $activeAdminCount === 0) {
                return response()->json([
                    'message' => 'Cannot permanently delete: no active admin users would remain',
                ], 422);
            }
        }

        // Detach from all projects first
        $user->helpdeskProjects()->detach();

        $user->forceDelete();

        return response()->json([
            'message' => 'User permanently deleted',
        ]);
    }

    /**
     * Search users for autocomplete
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->input('q', '');

        $users = User::query()
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email', 'is_admin']);

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Get available roles
     */
    public function roles(): JsonResponse
    {
        return response()->json(
            array_map(fn ($role) => [
                'value' => $role->value,
                'label' => $role->label(),
                'description' => $role->description(),
            ], ProjectRole::cases())
        );
    }
}
