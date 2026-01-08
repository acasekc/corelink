<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PageController extends Controller
{
    public function home()
    {
        return Inertia::render('Index');
    }

    public function projects()
    {
        return Inertia::render('Projects');
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function contact()
    {
        return Inertia::render('Contact');
    }

    public function caseStudyDustiesDelights()
    {
        return Inertia::render('CaseStudies/DustiesDelights');
    }
}
