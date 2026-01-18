<?php

namespace App\Http\Middleware;

use App\Models\Helpdesk\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HelpdeskApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Accept both X-API-Key (documented) and X-Helpdesk-Key (legacy)
        $apiKey = $request->header('X-API-Key') ?? $request->header('X-Helpdesk-Key');

        if (! $apiKey) {
            return response()->json(['message' => 'API key required'], 401);
        }

        $key = ApiKey::findByKey($apiKey);

        if (! $key) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }

        if ($key->isExpired()) {
            return response()->json(['message' => 'API key expired'], 401);
        }

        if (! $key->project || ! $key->project->is_active) {
            return response()->json(['message' => 'Project is not active'], 403);
        }

        // Record usage
        $key->recordUsage($request->ip());

        // Attach project to request for controllers
        $request->attributes->set('helpdesk_project', $key->project);
        $request->attributes->set('helpdesk_api_key', $key);

        return $next($request);
    }
}
