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
        $apiKey = $request->header('X-Helpdesk-Key');

        if (! $apiKey) {
            return response()->json(['error' => 'API key required'], 401);
        }

        $key = ApiKey::findByKey($apiKey);

        if (! $key) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        if ($key->isExpired()) {
            return response()->json(['error' => 'API key expired'], 401);
        }

        if (! $key->project || ! $key->project->is_active) {
            return response()->json(['error' => 'Project is not active'], 403);
        }

        // Record usage
        $key->recordUsage($request->ip());

        // Attach project to request for controllers
        $request->attributes->set('helpdesk_project', $key->project);
        $request->attributes->set('helpdesk_api_key', $key);

        return $next($request);
    }
}
