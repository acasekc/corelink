<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::ordered()->get();

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'features' => 'required|string',
            'tech_stack' => 'required|string',
            'link' => 'nullable|string|url',
            'screenshots' => 'nullable|array',
            'screenshots.*' => 'image|max:2048',
            'order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $validated['features'] = json_decode($validated['features'], true);
        $validated['tech_stack'] = json_decode($validated['tech_stack'], true);
        $validated['screenshots'] = $this->storeScreenshots($request->file('screenshots', []));

        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    public function show(\App\Models\Project $adminProject): JsonResponse
    {
        return response()->json($adminProject);
    }

    public function update(Request $request, \App\Models\Project $adminProject): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'features' => 'required|string',
            'tech_stack' => 'required|string',
            'link' => 'nullable|string|url',
            'new_screenshots' => 'nullable|array',
            'new_screenshots.*' => 'image|max:2048',
            'existing_screenshots' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $validated['features'] = json_decode($validated['features'], true);
        $validated['tech_stack'] = json_decode($validated['tech_stack'], true);

        $existingScreenshots = $request->filled('existing_screenshots')
            ? json_decode($validated['existing_screenshots'], true)
            : [];
        $newScreenshots = $this->storeScreenshots($request->file('new_screenshots', []));
        $validated['screenshots'] = array_merge($existingScreenshots, $newScreenshots);

        unset($validated['new_screenshots'], $validated['existing_screenshots']);

        $adminProject->update($validated);

        return response()->json($adminProject);
    }

    public function destroy(\App\Models\Project $adminProject): JsonResponse
    {
        if ($adminProject->screenshots) {
            foreach ($adminProject->screenshots as $screenshot) {
                $path = $this->extractRelativePath((string) $screenshot);

                if ($path === null) {
                    continue;
                }

                Storage::disk('public')->delete($path);

                $assetDisk = $this->getPublicAssetDisk();
                if ($assetDisk !== 'public') {
                    Storage::disk($assetDisk)->delete($path);
                }
            }
        }

        $adminProject->delete();

        return response()->json(null, 204);
    }

    /**
     * Store uploaded screenshot files and return their public paths.
     */
    private function storeScreenshots(array $files): array
    {
        $paths = [];
        $disk = $this->getPublicAssetDisk();

        foreach ($files as $file) {
            $path = $file->store('projects', $disk);

            if ($disk === 'public') {
                $paths[] = '/storage/'.$path;

                continue;
            }

            /** @var \Illuminate\Filesystem\FilesystemAdapter $storage */
            $storage = Storage::disk($disk);
            $paths[] = $storage->url($path);
        }

        return $paths;
    }

    private function getPublicAssetDisk(): string
    {
        $defaultDisk = (string) config('filesystems.default', 'local');

        return $defaultDisk === 'local' ? 'public' : $defaultDisk;
    }

    private function extractRelativePath(string $storedPath): ?string
    {
        if (str_starts_with($storedPath, '/storage/')) {
            return ltrim(str_replace('/storage/', '', $storedPath), '/');
        }

        if (str_starts_with($storedPath, 'http://') || str_starts_with($storedPath, 'https://')) {
            $path = parse_url($storedPath, PHP_URL_PATH);

            if (! is_string($path) || $path === '') {
                return null;
            }

            if (str_starts_with($path, '/storage/')) {
                return ltrim(str_replace('/storage/', '', $path), '/');
            }

            return ltrim($path, '/');
        }

        return ltrim($storedPath, '/');
    }
}
