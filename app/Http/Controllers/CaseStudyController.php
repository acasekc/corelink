<?php

namespace App\Http\Controllers;

use App\Models\CaseStudy;
use Illuminate\Http\Request;

class CaseStudyController extends Controller
{
    public function index()
    {
        $caseStudies = CaseStudy::where('is_published', true)
            ->orderBy('order')
            ->get(['id', 'slug', 'title', 'subtitle', 'description', 'client_name', 'industry', 'hero_image']);
        
        return response()->json($caseStudies);
    }

    public function show($slug)
    {
        $caseStudy = CaseStudy::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();
        
        return response()->json($caseStudy);
    }
}
