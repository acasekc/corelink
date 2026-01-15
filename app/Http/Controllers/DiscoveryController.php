<?php

namespace App\Http\Controllers;

use App\Models\BotSession;
use Illuminate\Http\Request;

class DiscoveryController extends Controller
{
    /**
     * Show the discovery chat interface
     */
    public function chat(Request $request)
    {
        return view('app');
    }

    /**
     * Show the discovery summary page
     */
    public function summary(string $sessionId)
    {
        return view('app');
    }

    /**
     * Get the discovery summary data as JSON
     */
    public function getSummaryData(string $sessionId)
    {
        $session = BotSession::with('discoveryPlan')->findOrFail($sessionId);

        $plan = $session->discoveryPlan;
        $userSummary = $plan?->user_summary;
        $requirements = $plan?->structured_requirements;

        // Transform the data to match what the Summary component expects
        $summary = $userSummary ? [
            'project_name' => $requirements['project']['name'] ?? 'Your Project',
            'overview' => $userSummary['project_overview'] ?? null,
            'key_features' => $userSummary['high_level_features'] ?? [],
            'target_users' => $requirements['users']['primary_users'] ?? null,
            'success_metrics' => $userSummary['goals_and_success'] ?? [],
            'next_steps' => $userSummary['next_steps_message'] ?? null,
            'complexity' => $userSummary['complexity'] ?? null,
        ] : null;

        return response()->json([
            'sessionId' => $sessionId,
            'summary' => $summary,
        ]);
    }
}
