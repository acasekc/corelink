<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\Helpdesk\AddCommentTool;
use App\Mcp\Tools\Helpdesk\AddTimeEntryTool;
use App\Mcp\Tools\Helpdesk\CreateTicketTool;
use App\Mcp\Tools\Helpdesk\EndTimeEntrySessionTool;
use App\Mcp\Tools\Helpdesk\GetProjectTool;
use App\Mcp\Tools\Helpdesk\GetTicketTool;
use App\Mcp\Tools\Helpdesk\ListLabelsTool;
use App\Mcp\Tools\Helpdesk\ListPrioritiesTool;
use App\Mcp\Tools\Helpdesk\ListStatusesTool;
use App\Mcp\Tools\Helpdesk\ListTicketsTool;
use App\Mcp\Tools\Helpdesk\ListTypesTool;
use App\Mcp\Tools\Helpdesk\StartTimeEntrySessionTool;
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
        - `start_time_entry_session` - Start a tracked work session for a ticket
        - `end_time_entry_session` - End a tracked work session and automatically log the elapsed time
        - `add_time_entry` - Log time worked on a ticket
        
        ## Guidelines:
        - Use `list_statuses` first to get valid status IDs for filtering or updating
        - Time can be logged using shorthand like "1h 30m" or just minutes
        - Internal comments are only visible to staff
        - Prefer `start_time_entry_session` when work begins and `end_time_entry_session` when work ends so exact time is recorded automatically
        - Use `add_time_entry` only when you need to record work retroactively or correct time manually
        
        ## MANDATORY TIME TRACKING:
                **CRITICAL:** You MUST track time for ANY work done on tickets. This is required for all bot interactions.
                - When you begin work on a ticket, call `start_time_entry_session`
                - When you stop or complete that work, call `end_time_entry_session`
                - Always include a brief description of the work in the tracked session or final time entry
                - Use `add_time_entry` only for retroactive/manual corrections when a tracked session was not possible
                - Do not estimate time if you can track it with the session tools

                ## REQUIRED WHEN WORK IS COMPLETE:
                **CRITICAL:** When you finish work on a ticket, you must complete all of the following before ending your task:
                - End the active work session using `end_time_entry_session`
                - Add a brief comment describing what was done using `add_comment`
                - Include any special instructions in that comment, such as how to use the change, setup steps, URLs, menu locations, new environment variables, or other follow-up details the user will need
                - Set the ticket status to `resolved` using `update_ticket`
                - If you are not sure which status to use, call `list_statuses` and pick the `resolved` status or the closest equivalent completion status available for that project
                - Do not leave a completed ticket without an ended work session, a completion comment, and a completion status update
        
        ## Comment Style:
        - Keep comments brief and factual - avoid lengthy explanations
        - Use simple language, not overly formal or robotic
        - Focus on what was done, not how you did it
        - Good: "Fixed the login redirect issue"
        - Bad: "I have analyzed the codebase and implemented a comprehensive solution to address the authentication redirect problem by modifying the middleware configuration"
        - Markdown is supported but use sparingly - plain text is preferred for most comments
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
        StartTimeEntrySessionTool::class,
        EndTimeEntrySessionTool::class,
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
