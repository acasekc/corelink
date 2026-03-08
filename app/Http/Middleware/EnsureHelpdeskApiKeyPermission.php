<?php

namespace App\Http\Middleware;

use App\Models\Helpdesk\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHelpdeskApiKeyPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        /** @var ApiKey|null $apiKey */
        $apiKey = $request->attributes->get('helpdesk_api_key');

        if (! $apiKey) {
            return response()->json(['message' => 'API key context missing'], 401);
        }

        if ($permissions !== [] && ! $apiKey->hasAnyPermission($permissions)) {
            return response()->json([
                'message' => 'API key does not have the required permissions.',
            ], 403);
        }

        return $next($request);
    }
}
