# Helpdesk Integration Roadmap

> **Goal:** Build a centralized helpdesk/ticketing system under `/helpdesk` that external applications (PantryLink, ChampLink, EcomLink) can integrate with via API keys. Users submit/track tickets from within those apps, and Corelink admins manage everything centrally.

---

## Overview

| Aspect | Decision |
|--------|----------|
| **Frontend** | React (consistent with existing app) |
| **Backend** | Laravel 12 API controllers |
| **Auth - Admin** | Existing User model (session-based) |
| **Auth - External** | API keys per project |
| **Route Prefix** | `/helpdesk` (admin UI), `/api/helpdesk/v1` (external API) |
| **DB Prefix** | `helpdesk_` tables |

---

## Architecture: API-First External Integration

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        External Applications                              │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
│   PantryLink    │   ChampLink     │   EcomLink      │   (Future Apps)  │
│   (Laravel)     │   (Laravel)     │   (Laravel)     │                  │
└────────┬────────┴────────┬────────┴────────┬────────┴──────────────────┘
         │                 │                 │
         │   API Key       │   API Key       │   API Key
         │   X-Helpdesk-Key│   X-Helpdesk-Key│   X-Helpdesk-Key
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Corelink Helpdesk API                                 │
│                    /api/helpdesk/v1/*                                    │
│                                                                          │
│  POST /tickets         - Submit new ticket                              │
│  GET  /tickets         - List tickets for this project                  │
│  GET  /tickets/{id}    - Get ticket details                             │
│  POST /tickets/{id}/comments - Add comment                              │
│  GET  /statuses        - Get available statuses                         │
│  GET  /priorities      - Get available priorities                       │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ Stored in DB
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Corelink Helpdesk Admin                               │
│                    /helpdesk/* (React SPA)                               │
│                                                                          │
│  • Global dashboard    - All tickets across all projects                │
│  • Per-project views   - Filter by PantryLink, ChampLink, etc.         │
│  • Ticket management   - Assign, respond, change status                │
│  • API key management  - Generate/revoke keys per project              │
│  • Webhooks           - Notify external apps of status changes         │
└─────────────────────────────────────────────────────────────────────────┘
```

### External App Capabilities (via API Key)

Each external app (PantryLink, ChampLink, EcomLink) can:
- **Submit tickets** - Bug reports, feature requests, support questions
- **Track tickets** - View status of tickets submitted from their app
- **Add comments** - Respond to admin questions on their tickets
- **List their tickets** - Only see tickets from their own project
- **Receive webhooks** - Get notified when ticket status changes

### Corelink Admin Capabilities (Session Auth)

Admins in Corelink's helpdesk can:
- **View all tickets** - Across all projects with filtering
- **Manage tickets** - Assign, respond, change status, close
- **Per-project dashboards** - Focused view for each external app
- **API key management** - Generate, view, revoke keys
- **Configure webhooks** - Set callback URLs per project
- **Analytics** - Ticket volume, response times, trends

### API Authentication

| Endpoint | Auth Method | Who Uses It |
|----------|-------------|-------------|
| `/api/helpdesk/v1/*` | API Key (header `X-Helpdesk-Key`) | External apps |
| `/helpdesk/*` (SPA) | Session (existing Laravel auth) | Corelink admins |
| `/api/helpdesk/admin/*` | Session (existing Laravel auth) | Helpdesk admin API |

---

## Linked Projects

| Project | Repo | Integration |
|---------|------|-------------|
| **PantryLink** | github.com/acasekc/pantrylink | API Key |
| **ChampLink** | github.com/acasekc/champlink | API Key |
| **EcomLink** | github.com/acasekc/ecomlink | API Key |
| *(future apps)* | ... | API Key |

---

## Phase 1: Foundation (Database & Models)

**Estimated Time:** 1-2 days

### 1.1 Database Migrations

Create the following tables:

```
helpdesk_projects
├── id, name, slug (unique - e.g., "pantrylink", "champlink")
├── description, ticket_prefix (4 chars)
├── github_repo (nullable - "acasekc/pantrylink")
├── color (hex - for UI badges/charts)
├── icon (optional - lucide icon name)
├── is_active
├── settings (JSON - project-specific config)
├── created_at, updated_at, deleted_at

helpdesk_api_keys
├── id, project_id
├── key (unique, hashed - the actual API key)
├── name (e.g., "Production", "Development")
├── last_used_at, last_used_ip
├── expires_at (nullable)
├── is_active
├── permissions (JSON - what this key can do)
├── created_at, updated_at, deleted_at

helpdesk_webhooks
├── id, project_id
├── url, secret (for signing)
├── events (JSON array - e.g., ["ticket.created", "ticket.status_changed"])
├── is_active
├── last_triggered_at, last_response_code
├── created_at, updated_at

helpdesk_tickets
├── id, number, title, content (longtext)
├── project_id (FK - which external app)
├── status_id, priority_id, type_id
├── assignee_id (FK to users - Corelink admin)
├── submitter_email, submitter_name (from external app)
├── submitter_user_id (optional - if external app passes user ID)
├── metadata (JSON - any extra data from external app)
├── github_issue_url (nullable)
├── created_at, updated_at, deleted_at

helpdesk_ticket_statuses
├── id, project_id (nullable - null = global default)
├── title, slug, text_color, bg_color, is_default, order
├── created_at, updated_at, deleted_at

helpdesk_ticket_priorities
├── id, project_id (nullable - null = global default)
├── title, slug, text_color, bg_color, icon, order
├── created_at, updated_at, deleted_at

helpdesk_ticket_types
├── id, project_id (nullable - null = global default)
├── title, slug, text_color, bg_color, icon
├── created_at, updated_at, deleted_at

helpdesk_labels (project-specific tags)
├── id, project_id, name, color
├── created_at, updated_at

helpdesk_ticket_labels (pivot)
├── ticket_id, label_id

helpdesk_comments
├── id, ticket_id
├── user_id (nullable - if from admin)
├── submitter_name, submitter_email (if from external app)
├── content (longtext)
├── is_internal (boolean - visible only to admins)
├── created_at, updated_at, deleted_at

helpdesk_ticket_activities (audit log)
├── id, ticket_id, user_id, action, old_value, new_value
├── created_at
```

### 1.2 Models

Create in `app/Models/Helpdesk/`:

- [ ] `Project.php` - with relationships to tickets, api keys, webhooks
- [ ] `ApiKey.php` - API key model with hashing/verification
- [ ] `Webhook.php` - webhook configuration
- [ ] `Ticket.php` - main ticket model with all relationships
- [ ] `TicketStatus.php` - status reference data (project-scoped or global)
- [ ] `TicketPriority.php` - priority reference data (project-scoped or global)
- [ ] `TicketType.php` - type reference data (project-scoped or global)
- [ ] `Label.php` - project-specific labels/tags
- [ ] `Comment.php` - ticket comments (from admins or external users)
- [ ] `TicketActivity.php` - audit trail

### 1.3 Seeders

Default projects:
- [ ] PantryLink (slug: `pantrylink`, prefix: `PANT`, repo: `acasekc/pantrylink`)
- [ ] ChampLink (slug: `champlink`, prefix: `CHMP`, repo: `acasekc/champlink`)
- [ ] EcomLink (slug: `ecomlink`, prefix: `ECOM`, repo: `acasekc/ecomlink`)

Default statuses (global): Open, In Progress, Pending, Resolved, Closed
Default priorities (global): Low, Medium, High, Critical
Default types (global): Bug, Feature Request, Question, Task

---

## Phase 2: API Layer

**Estimated Time:** 2-3 days

### 2.1 Controllers

**External API Controllers** (API key auth) - `app/Http/Controllers/Helpdesk/Api/`:

```
TicketApiController.php
├── index()          - List tickets for this project
├── store()          - Submit new ticket
├── show()           - Get ticket details
├── update()         - Update ticket (limited fields)

CommentApiController.php
├── index()          - List comments for ticket
├── store()          - Add comment to ticket

StatusApiController.php
├── index()          - List available statuses

PriorityApiController.php
├── index()          - List available priorities

TypeApiController.php
├── index()          - List available types
```

**Admin Controllers** (session auth) - `app/Http/Controllers/Helpdesk/Admin/`:

```
DashboardController.php
├── global()         - Cross-project overview
├── project()        - Single project dashboard

TicketController.php
├── index()          - List tickets (with project filter)
├── show()           - Get ticket details
├── update()         - Update ticket (full access)
├── destroy()        - Delete ticket
├── assign()         - Assign to admin user
├── changeStatus()   - Update status
├── addLabels()      - Attach labels

CommentController.php
├── index()          - List comments for ticket
├── store()          - Add comment (with internal flag)
├── update()         - Edit comment
├── destroy()        - Delete comment

ProjectController.php
├── index()          - List all projects
├── store()          - Create project
├── show()           - Get project details with stats
├── update()         - Update project
├── destroy()        - Archive project

ApiKeyController.php
├── index()          - List API keys for project
├── store()          - Generate new API key
├── show()           - Get key details (masked)
├── update()         - Update key name/permissions
├── destroy()        - Revoke API key
├── regenerate()     - Regenerate key value

WebhookController.php
├── index()          - List webhooks for project
├── store()          - Create webhook
├── update()         - Update webhook
├── destroy()        - Delete webhook
├── test()           - Send test webhook

LabelController.php
├── index()          - List labels for project
├── store()          - Create label
├── update()         - Update label
├── destroy()        - Delete label

AdminController.php
├── statuses()       - CRUD for statuses (global or project)
├── priorities()     - CRUD for priorities
├── types()          - CRUD for types

AnalyticsController.php
├── global()         - Cross-project stats
├── project()        - Single project stats
├── byStatus()       - Tickets grouped by status
├── byPriority()     - Tickets grouped by priority
├── byAssignee()     - Tickets per admin
├── timeline()       - Tickets over time
```

### 2.2 Form Requests

- [ ] `StoreTicketRequest.php`
- [ ] `UpdateTicketRequest.php`
- [ ] `StoreCommentRequest.php`
- [ ] `StoreProjectRequest.php`

### 2.3 API Resources

- [ ] `TicketResource.php` / `TicketCollection.php`
- [ ] `CommentResource.php`
- [ ] `ProjectResource.php`

### 2.4 Routes

```php
// routes/web.php
Route::prefix('helpdesk')->middleware(['auth'])->group(function () {
    // SPA entry point - catches all frontend routes
    Route::get('/{any?}', [HelpdeskController::class, 'index'])
        ->where('any', '.*');
});

// ============================================================
// EXTERNAL API (API Key Authentication)
// Used by PantryLink, ChampLink, EcomLink, etc.
// ============================================================
// routes/api/helpdesk.php
Route::prefix('api/helpdesk/v1')->middleware(['helpdesk.api-key'])->group(function () {
    
    // Tickets - submit and track
    Route::get('tickets', [TicketApiController::class, 'index']);
    Route::post('tickets', [TicketApiController::class, 'store']);
    Route::get('tickets/{ticket}', [TicketApiController::class, 'show']);
    Route::patch('tickets/{ticket}', [TicketApiController::class, 'update']);
    
    // Comments on tickets
    Route::get('tickets/{ticket}/comments', [CommentApiController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [CommentApiController::class, 'store']);
    
    // Reference data (read-only)
    Route::get('statuses', [StatusApiController::class, 'index']);
    Route::get('priorities', [PriorityApiController::class, 'index']);
    Route::get('types', [TypeApiController::class, 'index']);
});

// ============================================================
// ADMIN API (Session Authentication)
// Used by Corelink helpdesk admin UI
// ============================================================
Route::prefix('api/helpdesk/admin')->middleware(['auth'])->group(function () {
    
    // Global dashboard
    Route::get('dashboard', [DashboardController::class, 'global']);
    Route::get('analytics', [AnalyticsController::class, 'global']);
    
    // Projects management
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/stats', [ProjectController::class, 'stats']);
    Route::get('projects/{project}/dashboard', [DashboardController::class, 'project']);
    Route::get('projects/{project}/analytics', [AnalyticsController::class, 'project']);
    
    // API Keys management (per project)
    Route::prefix('projects/{project}')->group(function () {
        Route::apiResource('api-keys', ApiKeyController::class);
        Route::post('api-keys/{apiKey}/regenerate', [ApiKeyController::class, 'regenerate']);
    });
    
    // Webhooks management (per project)
    Route::prefix('projects/{project}')->group(function () {
        Route::apiResource('webhooks', WebhookController::class);
        Route::post('webhooks/{webhook}/test', [WebhookController::class, 'test']);
    });
    
    // Tickets management (admin full access)
    Route::get('tickets', [TicketController::class, 'index']); // Global, filterable
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);
    Route::patch('tickets/{ticket}', [TicketController::class, 'update']);
    Route::delete('tickets/{ticket}', [TicketController::class, 'destroy']);
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::post('tickets/{ticket}/status', [TicketController::class, 'changeStatus']);
    Route::post('tickets/{ticket}/labels', [TicketController::class, 'addLabels']);
    
    // Comments
    Route::apiResource('tickets.comments', CommentController::class)->shallow();
    
    // Labels (per project)
    Route::prefix('projects/{project}')->group(function () {
        Route::apiResource('labels', LabelController::class);
    });
    
    // Global reference data management
    Route::get('statuses', [AdminController::class, 'statuses']);
    Route::get('priorities', [AdminController::class, 'priorities']);
    Route::get('types', [AdminController::class, 'types']);
    
    // Admin users list (for assignment dropdown)
    Route::get('admins', [AdminController::class, 'admins']);
});
```

### 2.5 API Key Middleware

Create `app/Http/Middleware/HelpdeskApiKeyAuth.php`:

```php
class HelpdeskApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-Helpdesk-Key');
        
        if (!$apiKey) {
            return response()->json(['error' => 'API key required'], 401);
        }
        
        $key = ApiKey::where('key', hash('sha256', $apiKey))
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->with('project')
            ->first();
        
        if (!$key) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }
        
        if ($key->expires_at && $key->expires_at->isPast()) {
            return response()->json(['error' => 'API key expired'], 401);
        }
        
        // Update last used
        $key->update([
            'last_used_at' => now(),
            'last_used_ip' => $request->ip(),
        ]);
        
        // Attach project to request for controllers
        $request->merge(['helpdesk_project' => $key->project]);
        
        return $next($request);
    }
}
```

---

## Phase 3: React Frontend (Admin UI)

**Estimated Time:** 5-7 days

### 3.1 Core Components

```
resources/js/helpdesk/
├── HelpdeskApp.jsx              - Main app wrapper with routing
├── context/
│   └── ProjectContext.jsx       - Current project context provider
├── components/
│   ├── layout/
│   │   ├── HelpdeskLayout.jsx   - Main layout with sidebar
│   │   ├── ProjectSidebar.jsx   - Project navigation
│   │   └── ProjectSwitcher.jsx  - Quick project switch dropdown
│   ├── tickets/
│   │   ├── TicketList.jsx       - Filterable ticket table
│   │   ├── TicketCard.jsx       - Ticket summary card (for Kanban)
│   │   ├── TicketDetail.jsx     - Full ticket view
│   │   └── TicketFilters.jsx    - Filter controls
│   ├── comments/
│   │   ├── CommentList.jsx      - Comments thread (internal flag visible)
│   │   └── CommentForm.jsx      - Add comment (with internal toggle)
│   ├── projects/
│   │   ├── ProjectCard.jsx      - Project overview card
│   │   ├── ProjectForm.jsx      - Create/edit project
│   │   └── ProjectSettings.jsx  - Project configuration
│   ├── api-keys/
│   │   ├── ApiKeyList.jsx       - List keys for project
│   │   ├── ApiKeyForm.jsx       - Create/edit key
│   │   └── ApiKeyDisplay.jsx    - Show key (one-time display)
│   ├── webhooks/
│   │   ├── WebhookList.jsx      - List webhooks for project
│   │   ├── WebhookForm.jsx      - Create/edit webhook
│   │   └── WebhookTest.jsx      - Test webhook button/result
│   ├── dashboard/
│   │   ├── StatsCards.jsx       - Ticket count cards
│   │   ├── RecentTickets.jsx    - Recent ticket list
│   │   ├── TicketsByStatus.jsx  - Chart/breakdown
│   │   └── ProjectComparison.jsx - Cross-project stats
│   ├── kanban/
│   │   ├── KanbanBoard.jsx      - Drag-drop board
│   │   └── KanbanColumn.jsx     - Status column
│   └── common/
│       ├── StatusBadge.jsx      - Colored status indicator
│       ├── PriorityBadge.jsx    - Colored priority indicator
│       ├── ProjectBadge.jsx     - Project color badge
│       ├── LabelBadge.jsx       - Label tag
│       ├── SubmitterInfo.jsx    - External user info display
│       └── Pagination.jsx       - Pagination controls
├── pages/
│   ├── GlobalDashboard.jsx      - Overview of all projects
│   ├── ProjectDashboard.jsx     - Single project overview
│   ├── ProjectList.jsx          - All projects management
│   ├── ProjectSettingsPage.jsx  - Project config, API keys, webhooks
│   ├── TicketsPage.jsx          - Ticket list view (global or per-project)
│   ├── TicketDetailPage.jsx     - Single ticket view
│   ├── KanbanPage.jsx           - Kanban board view
│   └── SettingsPage.jsx         - Global admin settings
├── hooks/
│   ├── useTickets.js            - Ticket operations
│   ├── useComments.js           - Comment operations
│   ├── useProjects.js           - Project operations
│   ├── useApiKeys.js            - API key management
│   ├── useWebhooks.js           - Webhook management
│   └── useCurrentProject.js     - Get current project from URL
└── utils/
    ├── api.js                   - API client helpers
    └── projectColors.js         - Project color utilities
```

### 3.2 Pages Breakdown

#### Global Dashboard (`/helpdesk`)
- Project cards with ticket counts (color-coded)
- Cross-project stats comparison
- Recent tickets across all projects
- Chart: tickets by project over time
- Quick links to each project

#### Project Dashboard (`/helpdesk/projects/:slug`)
- Project header with name, description, GitHub link
- Ticket stats cards (Open, In Progress, Resolved, etc.)
- Recent tickets from this project
- API key status (active keys count)
- Webhook status (configured/last triggered)
- Quick actions: View tickets, Kanban, Settings

#### Tickets List (`/helpdesk/tickets` or `/helpdesk/projects/:slug/tickets`)
- Table with columns: Number, Title, Status, Priority, Project, Submitter, Created
- Filters: Project (if global), Status, Priority, Type, Assignee, Labels, Date range
- Search by title/content/submitter
- Sort by any column
- Bulk actions: Assign, Change status, Add labels

#### Ticket Detail (`/helpdesk/tickets/:id`)
- Header: Ticket number (PANT-0001), title, status badge, priority badge
- Project badge (links to project)
- **Submitter info**: Name, email, external user ID (from external app)
- Meta: Assigned admin, labels, dates
- Content: Rich text display
- Comments: 
  - Threaded comments with internal flag indicator
  - Internal comments only visible to admins
  - Add comment form with "Internal only" checkbox
- Activity log: Status changes, assignments, label changes
- Actions: Assign, Change status, Add labels, Delete
- GitHub link (if linked)

#### Project Settings (`/helpdesk/projects/:slug/settings`)
- **General tab**: Name, description, slug, prefix, color, icon
- **API Keys tab**: 
  - List of API keys (masked)
  - Generate new key (shows once, then hashed)
  - Revoke keys
  - Key permissions settings
- **Webhooks tab**:
  - Webhook URLs configured
  - Events to trigger on
  - Test webhook button
  - Last triggered status
- **Labels tab**: Project-specific labels management
- **Statuses/Priorities tab**: Override globals for this project

#### Kanban Board (`/helpdesk/projects/:slug/kanban`)
- Columns per status (drag & drop between columns)
- Ticket cards showing: Number, title, priority, assignee avatar, labels
- Click to open detail modal or navigate
- Filter by assignee, priority, type

#### Project Settings (`/helpdesk/p/:slug/settings`)
- Project info (name, description, prefix, color, icon)
- GitHub repo configuration
- Custom statuses (override defaults)
- Custom priorities
- Custom labels
- Team members management

#### My Tickets (`/helpdesk/my-tickets`)
- All tickets assigned to current user across all projects
- Grouped or filterable by project
- Quick status updates

#### Global Settings (Admin only, `/helpdesk/settings`)
- Default statuses
- Default priorities
- Default types
- User management

### 3.3 Routing Structure

```jsx
// React Router routes (Admin UI)
/helpdesk                         → Global Dashboard
/helpdesk/tickets                 → All tickets (filterable by project)
/helpdesk/tickets/:id             → Ticket detail
/helpdesk/kanban                  → Global Kanban (filterable)
/helpdesk/projects                → Projects list
/helpdesk/projects/:slug          → Project dashboard
/helpdesk/projects/:slug/tickets  → Project-specific tickets
/helpdesk/projects/:slug/kanban   → Project-specific Kanban
/helpdesk/projects/:slug/settings → Project settings (API keys, webhooks)
/helpdesk/settings                → Global admin settings
```

---

## Phase 4: External App Integration Guide

**Estimated Time:** Documentation + example code

### 4.1 Integration Package (For External Apps)

Create a simple helper class that PantryLink, ChampLink, EcomLink can use:

```php
// In external app (e.g., PantryLink)
// config/services.php
'corelink_helpdesk' => [
    'url' => env('CORELINK_HELPDESK_URL', 'https://corelink.dev'),
    'api_key' => env('CORELINK_HELPDESK_API_KEY'),
],

// app/Services/HelpdeskService.php
class HelpdeskService
{
    private string $baseUrl;
    private string $apiKey;
    
    public function __construct()
    {
        $this->baseUrl = config('services.corelink_helpdesk.url') . '/api/helpdesk/v1';
        $this->apiKey = config('services.corelink_helpdesk.api_key');
    }
    
    public function submitTicket(array $data): array
    {
        // POST /tickets
        // Required: title, content, type, priority
        // Optional: submitter_name, submitter_email, submitter_user_id, metadata
        return $this->post('/tickets', $data);
    }
    
    public function getTickets(array $filters = []): array
    {
        // GET /tickets?status=open&page=1
        return $this->get('/tickets', $filters);
    }
    
    public function getTicket(int $id): array
    {
        // GET /tickets/{id}
        return $this->get("/tickets/{$id}");
    }
    
    public function addComment(int $ticketId, string $content): array
    {
        // POST /tickets/{id}/comments
        return $this->post("/tickets/{$ticketId}/comments", [
            'content' => $content,
        ]);
    }
    
    public function getStatuses(): array
    {
        return $this->get('/statuses');
    }
    
    public function getPriorities(): array
    {
        return $this->get('/priorities');
    }
    
    private function request(string $method, string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders([
            'X-Helpdesk-Key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->{$method}($this->baseUrl . $endpoint, $data);
        
        return $response->json();
    }
    
    private function get(string $endpoint, array $query = []): array
    {
        return $this->request('get', $endpoint . '?' . http_build_query($query));
    }
    
    private function post(string $endpoint, array $data): array
    {
        return $this->request('post', $endpoint, $data);
    }
}
```

### 4.2 Example Usage in External App

```php
// In PantryLink's Support Controller
class SupportController extends Controller
{
    public function __construct(private HelpdeskService $helpdesk) {}
    
    public function index()
    {
        // Show user's tickets from Corelink helpdesk
        $tickets = $this->helpdesk->getTickets([
            'submitter_user_id' => auth()->id(),
        ]);
        
        return view('support.index', compact('tickets'));
    }
    
    public function create()
    {
        $priorities = $this->helpdesk->getPriorities();
        return view('support.create', compact('priorities'));
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|string',
        ]);
        
        $ticket = $this->helpdesk->submitTicket([
            ...$validated,
            'submitter_name' => auth()->user()->name,
            'submitter_email' => auth()->user()->email,
            'submitter_user_id' => auth()->id(),
            'metadata' => [
                'app_version' => config('app.version'),
                'user_role' => auth()->user()->role,
            ],
        ]);
        
        return redirect()->route('support.show', $ticket['id'])
            ->with('success', 'Support ticket submitted!');
    }
    
    public function show(int $id)
    {
        $ticket = $this->helpdesk->getTicket($id);
        return view('support.show', compact('ticket'));
    }
    
    public function comment(Request $request, int $id)
    {
        $this->helpdesk->addComment($id, $request->input('content'));
        return back()->with('success', 'Comment added!');
    }
}
```

### 4.3 Webhooks (Status Updates to External Apps)

When ticket status changes, Corelink sends webhook:

```json
// POST to configured webhook URL
{
    "event": "ticket.status_changed",
    "ticket_id": 123,
    "ticket_number": "PANT-0042",
    "old_status": "open",
    "new_status": "resolved",
    "timestamp": "2026-01-17T10:30:00Z",
    "signature": "sha256=abc123..."
}
```

External app can handle:

```php
// In PantryLink
Route::post('/webhooks/helpdesk', [WebhookController::class, 'helpdesk']);

class WebhookController extends Controller
{
    public function helpdesk(Request $request)
    {
        // Verify signature
        $signature = hash_hmac('sha256', $request->getContent(), config('services.corelink_helpdesk.webhook_secret'));
        if (!hash_equals('sha256=' . $signature, $request->header('X-Helpdesk-Signature'))) {
            abort(401);
        }
        
        $event = $request->input('event');
        
        match ($event) {
            'ticket.status_changed' => $this->handleStatusChange($request->all()),
            'ticket.commented' => $this->handleComment($request->all()),
            default => null,
        };
        
        return response()->json(['received' => true]);
    }
    
    private function handleStatusChange(array $data): void
    {
        // Notify user their ticket was updated
        $userId = $data['submitter_user_id'] ?? null;
        if ($userId && $user = User::find($userId)) {
            $user->notify(new TicketStatusUpdatedNotification($data));
        }
    }
}
```

---

## Phase 5: Notifications & Real-time

**Estimated Time:** 1-2 days

### 5.1 Email Notifications (Internal - to Admins)

- [ ] `TicketCreatedNotification` - When external app submits new ticket
- [ ] `TicketAssignedNotification` - To newly assigned admin
- [ ] `TicketCommentedNotification` - When external user adds comment

### 5.2 Webhooks (External - to Apps)

Webhook events to trigger:
- `ticket.status_changed` - When admin changes status
- `ticket.commented` - When admin responds (non-internal comment)
- `ticket.assigned` - When ticket is assigned/reassigned
- `ticket.resolved` - When ticket is closed/resolved

### 5.3 Real-time Updates (Admin UI - Using Reverb)

- [ ] Broadcast new tickets to admin dashboard
- [ ] Broadcast ticket updates to viewers
- [ ] Broadcast new comments in real-time
- [ ] Update ticket counts on dashboards

---

## Phase 6: Permissions (Optional Enhancement)

**Estimated Time:** 1 day

If you want granular admin permissions beyond `is_admin`:

### 6.1 Install Spatie Permissions

```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

### 6.2 Define Permissions

```
helpdesk.tickets.view
helpdesk.tickets.update
helpdesk.tickets.delete
helpdesk.tickets.assign
helpdesk.projects.manage
helpdesk.api-keys.manage
helpdesk.webhooks.manage
helpdesk.settings.manage
```

### 6.3 Define Roles

- **Helpdesk Admin** - All permissions (manage projects, API keys, settings)
- **Helpdesk Agent** - View/update/assign tickets, add comments

---

## Implementation Order

### MVP (Minimum Viable Product)

Get a working ticketing system with external API:

1. [ ] Phase 1.1 - Create migrations (projects, api_keys, tickets, comments)
2. [ ] Phase 1.2 - Create models with relationships
3. [ ] Phase 1.3 - Seed default projects + reference data
4. [ ] Phase 2.5 - API Key middleware
5. [ ] Phase 2.1 - External API controllers (TicketApiController, etc.)
6. [ ] Phase 2.1 - Admin API controllers (TicketController, ProjectController)
7. [ ] Phase 2.4 - Routes setup (external + admin)
8. [ ] Phase 3.1 - Core React components
9. [ ] Phase 3.2 - Tickets List + Detail pages (admin UI)

**MVP Deliverables:**
- External apps can submit tickets via API
- External apps can track their tickets via API  
- Admins can view all tickets in React UI
- Admins can respond and change status
- Admins can generate API keys for projects

### Post-MVP Enhancements

10. [ ] Phase 3.2 - Dashboard with stats
11. [ ] Phase 3.2 - Kanban board
12. [ ] Phase 3.2 - Project settings (API keys, webhooks UI)
13. [ ] Phase 4 - HelpdeskService class for external apps
14. [ ] Phase 5.2 - Webhook dispatching
15. [ ] Phase 5.1 - Admin email notifications
16. [ ] Phase 5.3 - Real-time updates (Reverb)
17. [ ] Phase 6 - Granular permissions

---

## File Structure Summary

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Helpdesk/
│   │       ├── Api/                    # External API (API key auth)
│   │       │   ├── TicketApiController.php
│   │       │   ├── CommentApiController.php
│   │       │   ├── StatusApiController.php
│   │       │   ├── PriorityApiController.php
│   │       │   └── TypeApiController.php
│   │       └── Admin/                  # Admin API (session auth)
│   │           ├── DashboardController.php
│   │           ├── TicketController.php
│   │           ├── CommentController.php
│   │           ├── ProjectController.php
│   │           ├── ApiKeyController.php
│   │           ├── WebhookController.php
│   │           ├── LabelController.php
│   │           ├── AdminController.php
│   │           └── AnalyticsController.php
│   ├── Middleware/
│   │   └── HelpdeskApiKeyAuth.php      # API key verification
│   └── Requests/
│       └── Helpdesk/
│           ├── StoreTicketRequest.php
│           ├── UpdateTicketRequest.php
│           └── StoreCommentRequest.php
├── Models/
│   └── Helpdesk/
│       ├── Project.php
│       ├── ApiKey.php
│       ├── Webhook.php
│       ├── Ticket.php
│       ├── TicketStatus.php
│       ├── TicketPriority.php
│       ├── TicketType.php
│       ├── Label.php
│       ├── Comment.php
│       └── TicketActivity.php
├── Notifications/
│   └── Helpdesk/
│       ├── TicketCreatedNotification.php
│       └── TicketAssignedNotification.php
└── Services/
    └── Helpdesk/
        └── WebhookDispatcher.php       # Send webhooks to external apps

database/
├── migrations/
│   ├── xxxx_create_helpdesk_projects_table.php
│   ├── xxxx_create_helpdesk_api_keys_table.php
│   ├── xxxx_create_helpdesk_webhooks_table.php
│   ├── xxxx_create_helpdesk_ticket_statuses_table.php
│   ├── xxxx_create_helpdesk_ticket_priorities_table.php
│   ├── xxxx_create_helpdesk_ticket_types_table.php
│   ├── xxxx_create_helpdesk_labels_table.php
│   ├── xxxx_create_helpdesk_tickets_table.php
│   ├── xxxx_create_helpdesk_ticket_labels_table.php
│   ├── xxxx_create_helpdesk_comments_table.php
│   └── xxxx_create_helpdesk_ticket_activities_table.php
└── seeders/
    └── HelpdeskSeeder.php

resources/js/
└── helpdesk/
    ├── HelpdeskApp.jsx
    ├── context/
    ├── components/
    │   ├── layout/
    │   ├── tickets/
    │   ├── comments/
    │   ├── projects/
    │   ├── api-keys/
    │   ├── webhooks/
    │   ├── dashboard/
    │   ├── kanban/
    │   └── common/
    ├── pages/
    ├── hooks/
    └── utils/

routes/
├── api/
│   └── helpdesk.php            # External + Admin API routes
```

---

## Decisions Needed

Before starting, confirm:

1. **Admin Access:** Who can access the helpdesk admin UI?
   - [x] Only `is_admin` users *(default - simplest)*
   - [ ] Role-based (requires Spatie permissions)

2. **Projects Table:** Use dedicated helpdesk_projects or integrate with existing?
   - [x] Separate `helpdesk_projects` table *(recommended - no coupling)*
   - [ ] Reuse existing `projects` table

3. **Assignees:** Who can be assigned tickets?
   - [x] Only admin users (`is_admin = true`)
   - [ ] Users with specific role/permission

4. **MVP Scope:** Which features are must-have for v1?
   - [x] External API + Admin ticket management (minimal)
   - [ ] + API key management UI
   - [ ] + Webhooks
   - [ ] + Kanban board
   - [ ] + Analytics dashboard

---

## Timeline Estimate

| Phase | Effort | Cumulative |
|-------|--------|------------|
| Phase 1: Foundation | 1-2 days | 1-2 days |
| Phase 2: External API | 1-2 days | 2-4 days |
| Phase 2: Admin API | 1-2 days | 3-6 days |
| Phase 3: React MVP | 3-4 days | 6-10 days |
| Phase 4: External Integration | 1 day | 7-11 days |
| Phase 5: Notifications/Webhooks | 1-2 days | 8-13 days |
| Phase 6: Permissions | 1 day | 9-14 days |

**Realistic MVP:** ~1.5-2 weeks
**Full Feature Set:** ~2-3 weeks

---

## API Quick Reference

### External API (for PantryLink, ChampLink, EcomLink)

```
Base URL: /api/helpdesk/v1
Auth: Header "X-Helpdesk-Key: <api-key>"

POST   /tickets                    - Submit ticket
GET    /tickets                    - List project tickets
GET    /tickets/{id}               - Get ticket details
PATCH  /tickets/{id}               - Update ticket (limited)
GET    /tickets/{id}/comments      - List comments
POST   /tickets/{id}/comments      - Add comment
GET    /statuses                   - Get statuses
GET    /priorities                 - Get priorities
GET    /types                      - Get types
```

### Admin API (for Helpdesk React UI)

```
Base URL: /api/helpdesk/admin
Auth: Laravel session (existing login)

# Dashboard
GET    /dashboard                  - Global stats
GET    /analytics                  - Global analytics
GET    /projects/{slug}/dashboard  - Project stats
GET    /projects/{slug}/analytics  - Project analytics

# Tickets (full admin access)
GET    /tickets                    - All tickets (filterable)
GET    /tickets/{id}               - Ticket details
PATCH  /tickets/{id}               - Update ticket
DELETE /tickets/{id}               - Delete ticket
POST   /tickets/{id}/assign        - Assign ticket
POST   /tickets/{id}/status        - Change status
POST   /tickets/{id}/labels        - Add labels

# Comments
GET    /tickets/{id}/comments      - List comments
POST   /tickets/{id}/comments      - Add comment
PATCH  /comments/{id}              - Edit comment
DELETE /comments/{id}              - Delete comment

# Projects
GET    /projects                   - List all
POST   /projects                   - Create
GET    /projects/{slug}            - Get one
PATCH  /projects/{slug}            - Update
DELETE /projects/{slug}            - Archive

# API Keys
GET    /projects/{slug}/api-keys           - List keys
POST   /projects/{slug}/api-keys           - Create key
DELETE /projects/{slug}/api-keys/{id}      - Revoke key
POST   /projects/{slug}/api-keys/{id}/regenerate - Regenerate

# Webhooks
GET    /projects/{slug}/webhooks           - List webhooks
POST   /projects/{slug}/webhooks           - Create
PATCH  /projects/{slug}/webhooks/{id}      - Update
DELETE /projects/{slug}/webhooks/{id}      - Delete
POST   /projects/{slug}/webhooks/{id}/test - Test webhook

# Labels
GET    /projects/{slug}/labels     - List labels
POST   /projects/{slug}/labels     - Create
PATCH  /labels/{id}                - Update
DELETE /labels/{id}                - Delete

# Reference data
GET    /statuses                   - Global statuses
GET    /priorities                 - Global priorities
GET    /types                      - Global types
GET    /admins                     - Admin users (for assignment)
```

---

## Next Steps

1. Review this roadmap
2. Answer any remaining questions in "Decisions Needed"
3. I'll start with Phase 1 (migrations + models)
4. Then build the External API so you can test with your apps
5. Build the Admin React UI

Let me know when you're ready to start! 🚀
