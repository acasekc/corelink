<?php

namespace App\Http\Controllers;

use App\Models\BotSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscoveryController extends Controller
{
    /**
     * Show the discovery chat interface
     */
    public function chat(Request $request): Response
    {
        return Inertia::render('Discovery/Chat', [
            'initialSessionId' => $request->query('session'),
            'initialToken' => $request->query('token'),
        ]);
    }

    /**
     * Show the discovery summary page
     */
    public function summary(string $sessionId): Response
    {
        $session = BotSession::with('discoveryPlan')->findOrFail($sessionId);

        $plan = $session->discoveryPlan;
        $userSummary = $plan?->user_summary;
        $requirements = $plan?->structured_requirements;

        // Transform the data to match what the Summary.vue component expects
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
            'sessionId' => $sessionId,
            'summary' => $summary,
        ]);
    }
}
