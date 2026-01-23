<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\Helpdesk\AddCommentTool;
use App\Mcp\Tools\Helpdesk\AddTimeEntryTool;
use App\Mcp\Tools\Helpdesk\CreateTicketTool;
use App\Mcp\Tools\Helpdesk\GetProjectTool;
use App\Mcp\Tools\Helpdesk\GetTicketTool;
use App\Mcp\Tools\Helpdesk\ListLabelsTool;
use App\Mcp\Tools\Helpdesk\ListPrioritiesTool;
use App\Mcp\Tools\Helpdesk\ListStatusesTool;
use App\Mcp\Tools\Helpdesk\ListTicketsTool;
use App\Mcp\Tools\Helpdesk\ListTypesTool;
use App\Mcp\Tools\Helpdesk\UpdateTicketTool;
use Laravel\Mcp\Server;

class HelpdeskServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'CoreLink Helpdesk';

    /**
     * The MCP server's version.
     */
    protected string $version = '1.0.0';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        This MCP server provides access to a project-based helpdesk system.
        
        Authentication is project-scoped - your API key grants access to a specific project.
        
        ## Available Capabilities:
        
        **Project Info:**
        - `get_project` - Get details about the current project
        - `list_statuses` - List available ticket statuses
        - `list_priorities` - List available ticket priorities  
        - `list_types` - List available ticket types
        - `list_labels` - List available labels
        
        **Tickets:**
        - `list_tickets` - List and filter tickets
        - `get_ticket` - Get full ticket details including comments and time entries
        - `create_ticket` - Create a new support ticket
        - `update_ticket` - Update ticket status, priority, assignee, etc.
        
        **Comments & Time:**
        - `add_comment` - Add a comment to a ticket (can be internal or public)
        - `add_time_entry` - Log time worked on a ticket
        
        ## Tips:
        - Use `list_statuses` first to get valid status IDs for filtering or updating
        - Time can be logged using shorthand like "1h 30m" or just minutes
        - Internal comments are only visible to staff
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        GetProjectTool::class,
        ListStatusesTool::class,
        ListPrioritiesTool::class,
        ListTypesTool::class,
        ListLabelsTool::class,
        ListTicketsTool::class,
        GetTicketTool::class,
        CreateTicketTool::class,
        UpdateTicketTool::class,
        AddCommentTool::class,
        AddTimeEntryTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        //
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        //
    ];
}
