<?php

namespace App\Http\Controllers;

use App\Models\CaseStudy;
use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PageController extends Controller
{
    /**
     * Page-specific meta descriptions for SEO.
     *
     * @return array{title: string|null, description: string|null}
     */
    private function getPageMeta(string $page): array
    {
        return match ($page) {
            'home' => [
                'title' => 'AI-Powered Web & Mobile Development',
                'description' => 'CoreLink Development builds intelligent, scalable web and mobile applications using AI technology with expert developer oversight. Based in Missouri, serving clients nationwide.',
            ],
            'projects' => [
                'title' => 'Our Projects',
                'description' => 'Explore our portfolio of custom web applications, SaaS platforms, and mobile apps. See how we help businesses transform with modern technology solutions.',
            ],
            'process' => [
                'title' => 'Our Development Process',
                'description' => 'Learn about our proven development process: from discovery and planning through design, development, and launch. Transparent, collaborative, and results-driven.',
            ],
            'about' => [
                'title' => 'About Us',
                'description' => 'Meet CoreLink Development - a team of senior developers combining AI efficiency with expert oversight. We build with integrity, serving clients with modern web solutions.',
            ],
            'contact' => [
                'title' => 'Contact Us',
                'description' => 'Get in touch with CoreLink Development. Request a free consultation for your web or mobile application project. Based in Missouri, serving clients nationwide.',
            ],
            'case-studies' => [
                'title' => 'Case Studies',
                'description' => 'Real success stories from our clients. Discover how CoreLink Development has helped businesses grow with custom web applications and digital solutions.',
            ],
            'terms' => [
                'title' => 'Terms of Service',
                'description' => 'Terms of Service for CoreLink Development LLC. Review our policies for using our services and website.',
            ],
            'privacy' => [
                'title' => 'Privacy Policy',
                'description' => 'Privacy Policy for CoreLink Development LLC. Learn how we collect, use, and protect your personal information.',
            ],
            'discovery' => [
                'title' => 'Project Discovery',
                'description' => 'Start your project with our AI-powered discovery process. Get a detailed project plan, timeline, and estimate tailored to your business needs.',
            ],
            'blog' => [
                'title' => 'Blog',
                'description' => 'Insights on web development, AI, Laravel, React, and building modern applications. Tips and tutorials from the CoreLink Development team.',
            ],
            default => [
                'title' => null,
                'description' => null,
            ],
        };
    }

    public function home(): InertiaResponse
    {
        return Inertia::render('Index', [
            'meta' => $this->getPageMeta('home'),
        ]);
    }

    public function projects(): InertiaResponse
    {
        return Inertia::render('Projects', [
            'meta' => $this->getPageMeta('projects'),
            'projects' => Project::published()->ordered()->get(),
        ]);
    }

    public function process(): InertiaResponse
    {
        return Inertia::render('Process', [
            'meta' => $this->getPageMeta('process'),
        ]);
    }

    public function about(): InertiaResponse
    {
        return Inertia::render('About', [
            'meta' => $this->getPageMeta('about'),
        ]);
    }

    public function contact(): InertiaResponse
    {
        return Inertia::render('Contact', [
            'meta' => $this->getPageMeta('contact'),
        ]);
    }

    public function caseStudies(?string $slug = null): InertiaResponse
    {
        if ($slug) {
            $caseStudy = CaseStudy::where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail();

            return Inertia::render('CaseStudyDetail', [
                'meta' => [
                    'title' => $caseStudy->title,
                    'description' => $caseStudy->description,
                ],
                'caseStudy' => $caseStudy,
            ]);
        }

        return Inertia::render('CaseStudies', [
            'meta' => $this->getPageMeta('case-studies'),
            'caseStudies' => CaseStudy::where('is_published', true)
                ->orderBy('order')
                ->get(['id', 'slug', 'title', 'subtitle', 'description', 'client_name', 'industry', 'hero_image']),
        ]);
    }

    public function terms(): InertiaResponse
    {
        return Inertia::render('Terms', [
            'meta' => $this->getPageMeta('terms'),
        ]);
    }

    public function privacy(): InertiaResponse
    {
        return Inertia::render('Privacy', [
            'meta' => $this->getPageMeta('privacy'),
        ]);
    }

    /**
     * Admin/helpdesk SPA routes — unchanged.
     */
    public function helpdesk()
    {
        return view('app');
    }

    /**
     * Generic SPA view for admin routes that use React Router.
     */
    public function adminSpa()
    {
        return view('app');
    }
}
