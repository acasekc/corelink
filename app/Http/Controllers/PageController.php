<?php

namespace App\Http\Controllers;

class PageController extends Controller
{
    /**
     * Page-specific meta descriptions for SEO.
     */
    private function getPageMeta(string $page): array
    {
        $meta = match ($page) {
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

        return [
            'ogMeta' => array_filter([
                'title' => $meta['title'],
                'description' => $meta['description'],
                'url' => url()->current(),
            ]),
        ];
    }

    /**
     * Return the React app view for all page routes.
     * React Router handles client-side routing.
     */
    public function home()
    {
        return view('app', $this->getPageMeta('home'));
    }

    public function projects()
    {
        return view('app', $this->getPageMeta('projects'));
    }

    public function process()
    {
        return view('app', $this->getPageMeta('process'));
    }

    public function about()
    {
        return view('app', $this->getPageMeta('about'));
    }

    public function contact()
    {
        return view('app', $this->getPageMeta('contact'));
    }

    public function caseStudies()
    {
        return view('app', $this->getPageMeta('case-studies'));
    }

    public function terms()
    {
        return view('app', $this->getPageMeta('terms'));
    }

    public function privacy()
    {
        return view('app', $this->getPageMeta('privacy'));
    }

    public function caseStudyDustiesDelights()
    {
        return view('app', $this->getPageMeta('case-studies'));
    }

    public function helpdesk()
    {
        return view('app');
    }
}
