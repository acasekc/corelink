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
