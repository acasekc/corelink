<?php

use App\Http\Middleware\McpApiKeyAuth;
use App\Mcp\Servers\HelpdeskServer;
use Laravel\Mcp\Facades\Mcp;

/*
|--------------------------------------------------------------------------
| MCP Server Routes
|--------------------------------------------------------------------------
|
| Here you may register MCP servers that expose AI-accessible tools,
| resources, and prompts. Authentication is via project API keys.
|
*/

Mcp::web('/mcp/helpdesk', HelpdeskServer::class)
    ->middleware(McpApiKeyAuth::class);

// Temporary key-in-URL variant for claude.ai custom connectors, which can't
// send an Authorization header. Remove when CoreLink moves platforms.
Mcp::web('/mcp/helpdesk/k/{key}', HelpdeskServer::class)
    ->middleware(McpApiKeyAuth::class);
