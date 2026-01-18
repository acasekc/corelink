<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $keys = $project->apiKeys()->orderByDesc('created_at')->get();

        return response()->json([
            'data' => $keys->map(fn (ApiKey $key) => [
                'id' => $key->id,
                'name' => $key->name,
                'key' => '••••••••'.substr($key->key, -8),
                'key_preview' => '••••••••'.substr($key->key, -8),
                'is_active' => $key->is_active,
                'expires_at' => $key->expires_at?->toIso8601String(),
                'last_used_at' => $key->last_used_at?->toIso8601String(),
                'last_used_ip' => $key->last_used_ip,
                'created_at' => $key->created_at->toIso8601String(),
            ]),
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now',
            'permissions' => 'nullable|array',
        ]);

        $plainKey = ApiKey::generateKey();

        $apiKey = $project->apiKeys()->create([
            'key' => ApiKey::hashKey($plainKey),
            'name' => $validated['name'],
            'expires_at' => $validated['expires_at'] ?? null,
            'permissions' => $validated['permissions'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $plainKey, // Only shown once!
                'is_active' => $apiKey->is_active,
                'expires_at' => $apiKey->expires_at?->toIso8601String(),
            ],
            'message' => 'API key created. Save this key - it will not be shown again.',
        ], 201);
    }

    public function show(Project $project, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->project_id !== $project->id) {
            abort(404);
        }

        return response()->json([
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key_preview' => '••••••••'.substr($apiKey->key, -8),
                'is_active' => $apiKey->is_active,
                'expires_at' => $apiKey->expires_at?->toIso8601String(),
                'last_used_at' => $apiKey->last_used_at?->toIso8601String(),
                'last_used_ip' => $apiKey->last_used_ip,
                'permissions' => $apiKey->permissions,
                'created_at' => $apiKey->created_at->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Project $project, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
            'expires_at' => 'nullable|date|after:now',
            'permissions' => 'nullable|array',
        ]);

        $apiKey->update($validated);

        return response()->json([
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'is_active' => $apiKey->is_active,
                'expires_at' => $apiKey->expires_at?->toIso8601String(),
            ],
            'message' => 'API key updated successfully',
        ]);
    }

    public function destroy(Project $project, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->project_id !== $project->id) {
            abort(404);
        }

        $apiKey->delete();

        return response()->json([
            'message' => 'API key revoked successfully',
        ]);
    }

    public function regenerate(Project $project, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->project_id !== $project->id) {
            abort(404);
        }

        $plainKey = ApiKey::generateKey();
        $apiKey->update([
            'key' => ApiKey::hashKey($plainKey),
            'last_used_at' => null,
            'last_used_ip' => null,
        ]);

        return response()->json([
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $plainKey, // Only shown once!
            ],
            'message' => 'API key regenerated. Save this key - it will not be shown again.',
        ]);
    }
}
