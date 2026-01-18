<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::withCount([
            'tickets',
            'tickets as open_tickets_count' => function ($q) {
                $q->whereHas('status', fn ($s) => $s->whereIn('slug', ['open', 'in-progress', 'pending']));
            },
            'apiKeys as active_api_keys_count' => fn ($q) => $q->where('is_active', true),
        ])->get();

        return response()->json([
            'data' => $projects->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'ticket_prefix' => $project->ticket_prefix,
                'github_repo' => $project->github_repo,
                'is_active' => $project->is_active,
                'tickets_count' => $project->tickets_count,
                'open_tickets_count' => $project->open_tickets_count,
                'active_api_keys_count' => $project->active_api_keys_count,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:helpdesk_projects,slug',
            'description' => 'nullable|string',
            'ticket_prefix' => 'nullable|string|max:4',
            'github_repo' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string',
        ]);

        // Auto-generate slug from name if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

            // Ensure uniqueness
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Project::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $baseSlug.'-'.$counter++;
            }
        }

        // Auto-generate ticket prefix from name if not provided
        if (empty($validated['ticket_prefix'])) {
            // Take first letters of each word, max 4 characters, uppercase
            $words = preg_split('/\s+/', $validated['name']);
            $prefix = '';
            foreach ($words as $word) {
                $prefix .= strtoupper(substr($word, 0, 1));
                if (strlen($prefix) >= 4) {
                    break;
                }
            }
            // If only one word, take first 3-4 characters
            if (strlen($prefix) < 2) {
                $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $validated['name']), 0, 4));
            }
            $validated['ticket_prefix'] = $prefix;
        }

        $project = Project::create($validated);

        // Create default API key
        $plainKey = ApiKey::generateKey();
        $project->apiKeys()->create([
            'key' => ApiKey::hashKey($plainKey),
            'name' => 'Default Key',
            'is_active' => true,
        ]);

        return response()->json([
            'data' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'ticket_prefix' => $project->ticket_prefix,
            ],
            'api_key' => $plainKey, // Only returned once!
            'message' => 'Project created successfully. Save the API key - it will not be shown again.',
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $project->loadCount([
            'tickets',
            'tickets as open_tickets_count' => function ($q) {
                $q->whereHas('status', fn ($s) => $s->whereIn('slug', ['open', 'in-progress', 'pending']));
            },
        ]);

        return response()->json([
            'data' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'ticket_prefix' => $project->ticket_prefix,
                'github_repo' => $project->github_repo,
                'color' => $project->color,
                'icon' => $project->icon,
                'is_active' => $project->is_active,
                'settings' => $project->settings,
                'tickets_count' => $project->tickets_count,
                'open_tickets_count' => $project->open_tickets_count,
                'created_at' => $project->created_at->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:helpdesk_projects,slug,'.$project->id,
            'description' => 'nullable|string',
            'ticket_prefix' => 'sometimes|string|max:4',
            'github_repo' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'settings' => 'nullable|array',
        ]);

        $project->update($validated);

        return response()->json([
            'data' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'color' => $project->color,
                'ticket_prefix' => $project->ticket_prefix,
                'is_active' => $project->is_active,
            ],
            'message' => 'Project updated successfully',
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'message' => 'Project archived successfully',
        ]);
    }
}
