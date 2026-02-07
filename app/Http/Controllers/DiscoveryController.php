<?php

namespace App\Http\Controllers;

use App\Models\BotSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DiscoveryController extends Controller
{
    /**
     * Show the discovery chat interface.
     */
    public function chat(Request $request): InertiaResponse
    {
        return Inertia::render('Discovery/Chat', [
            'meta' => [
                'title' => 'Project Discovery',
                'description' => 'Start your project with our AI-powered discovery process. Get a detailed project plan, timeline, and estimate tailored to your business needs.',
            ],
        ]);
    }

    /**
     * Show the discovery summary page.
     */
    public function summary(string $sessionId): InertiaResponse
    {
        $session = BotSession::with('discoveryPlan')->findOrFail($sessionId);

        $plan = $session->discoveryPlan;
        $userSummary = $plan?->user_summary;
        $requirements = $plan?->structured_requirements;

        $summary = $userSummary ? [
            'project_name' => $requirements['project']['name'] ?? 'Your Project',
            'overview' => $userSummary['project_overview'] ?? null,
            'key_features' => $userSummary['high_level_features'] ?? [],
            'target_users' => $requirements['users']['primary_users'] ?? null,
            'success_metrics' => $userSummary['goals_and_success'] ?? [],
            'next_steps' => $userSummary['next_steps_message'] ?? null,
            'complexity' => $userSummary['complexity'] ?? null,
        ] : null;

        return Inertia::render('Discovery/Summary', [
            'meta' => [
                'title' => 'Project Summary',
                'description' => 'Review your project discovery summary including features, timeline, and next steps.',
            ],
            'sessionId' => $sessionId,
            'summary' => $summary,
        ]);
    }
}
