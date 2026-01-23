<?php

namespace App\Http\Middleware;

use App\Mcp\McpContext;
use App\Models\Helpdesk\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class McpApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // MCP clients typically use Authorization: Bearer <token>
        $token = $request->bearerToken();

        // Also accept X-API-Key header for flexibility
        if (! $token) {
            $token = $request->header('X-API-Key') ?? $request->header('X-Helpdesk-Key');
        }

        if (! $token) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32001,
                    'message' => 'API key required. Use Authorization: Bearer <key> or X-API-Key header.',
                ],
            ], 401);
        }

        $key = ApiKey::findByKey($token);

        if (! $key) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32001,
                    'message' => 'Invalid API key',
                ],
            ], 401);
        }

        if ($key->isExpired()) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32001,
                    'message' => 'API key expired',
                ],
            ], 401);
        }

        if (! $key->project || ! $key->project->is_active) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32003,
                    'message' => 'Project is not active',
                ],
            ], 403);
        }

        // Record usage
        $key->recordUsage($request->ip());

        // Set MCP context for tools to access
        McpContext::setProject($key->project);
        McpContext::setApiKey($key);

        return $next($request);
    }
}
