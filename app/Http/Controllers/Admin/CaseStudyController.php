<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CaseStudy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CaseStudyController extends Controller
{
    public function index()
    {
        $caseStudies = CaseStudy::orderBy('order')->get();
        return response()->json($caseStudies);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:case_studies,slug',
            'subtitle' => 'nullable|string',
            'description' => 'nullable|string',
            'client_name' => 'nullable|string',
            'industry' => 'nullable|string',
            'project_type' => 'nullable|string',
            'technologies' => 'nullable|string',
            'hero_image' => 'nullable|image|max:2048',
            'hero_image_url' => 'nullable|string',
            'content' => 'required|string',
            'metrics' => 'nullable|string',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        
        // Decode JSON strings
        if (isset($validated['technologies'])) {
            $validated['technologies'] = json_decode($validated['technologies'], true);
        }
        if (isset($validated['metrics'])) {
            $validated['metrics'] = json_decode($validated['metrics'], true);
        }
        
        // Handle image upload
        if ($request->hasFile('hero_image')) {
            $path = $request->file('hero_image')->store('case-studies', 'public');
            $validated['hero_image'] = '/storage/' . $path;
        } elseif (isset($validated['hero_image_url'])) {
            $validated['hero_image'] = $validated['hero_image_url'];
        }
        unset($validated['hero_image_url']);

        $caseStudy = CaseStudy::create($validated);
        return response()->json($caseStudy, 201);
    }

    public function show($id)
    {
        $caseStudy = CaseStudy::findOrFail($id);
        return response()->json($caseStudy);
    }

    public function update(Request $request, $id)
    {
        $caseStudy = CaseStudy::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:case_studies,slug,' . $id,
            'subtitle' => 'nullable|string',
            'description' => 'nullable|string',
            'client_name' => 'nullable|string',
            'industry' => 'nullable|string',
            'project_type' => 'nullable|string',
            'technologies' => 'nullable|string',
            'hero_image' => 'nullable|image|max:2048',
            'hero_image_url' => 'nullable|string',
            'content' => 'required|string',
            'metrics' => 'nullable|string',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        
        // Decode JSON strings
        if (isset($validated['technologies'])) {
            $validated['technologies'] = json_decode($validated['technologies'], true);
        }
        if (isset($validated['metrics'])) {
            $validated['metrics'] = json_decode($validated['metrics'], true);
        }
        
        // Handle image upload
        if ($request->hasFile('hero_image')) {
            // Delete old image if exists
            if ($caseStudy->hero_image && str_starts_with($caseStudy->hero_image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $caseStudy->hero_image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('hero_image')->store('case-studies', 'public');
            $validated['hero_image'] = '/storage/' . $path;
        } elseif (isset($validated['hero_image_url'])) {
            $validated['hero_image'] = $validated['hero_image_url'];
        } else {
            unset($validated['hero_image']);
        }
        unset($validated['hero_image_url']);

        $caseStudy->update($validated);
        return response()->json($caseStudy);
    }

    public function destroy($id)
    {
        $caseStudy = CaseStudy::findOrFail($id);
        $caseStudy->delete();
        return response()->json(['message' => 'Case study deleted'], 200);
    }

    public function togglePublish($id)
    {
        $caseStudy = CaseStudy::findOrFail($id);
        $caseStudy->is_published = !$caseStudy->is_published;
        $caseStudy->save();
        return response()->json($caseStudy);
    }
}
