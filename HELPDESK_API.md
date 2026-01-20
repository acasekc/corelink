# CoreLink Helpdesk API

This document describes how to integrate with the CoreLink Helpdesk API to submit and manage support tickets from external applications.

## Base URL

```
https://corelink.dev/api/helpdesk/v1
```

## Authentication

All API requests require an API key passed in the `X-API-Key` header.

```
X-API-Key: your-api-key-here
```

API keys are project-scoped. Contact CoreLink to obtain an API key for your project.

---

## Endpoints

### Tickets

#### Create Ticket

Create a new support ticket.

```
POST /tickets
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Ticket title (max 255 chars) |
| `content` | string | Yes | Detailed description of the issue |
| `submitter_name` | string | Yes | Name of the person submitting |
| `submitter_email` | string | Yes | Email of the person submitting |
| `submitter_user_id` | string | No | Your application's user ID (for reference) |
| `priority` | string | No | Priority slug: `low`, `medium`, `high`, `critical` |
| `type` | string | No | Type slug: `bug`, `feature`, `question`, `task` |
| `time_estimate` | string | No | Estimated time (format: `2w 4d 6h 45m`) |
| `metadata` | object | No | Any additional structured data |

**Example Request:**

```json
{
  "title": "Unable to export inventory report",
  "content": "When I click the Export button on the inventory page, nothing happens. I've tried Chrome and Firefox. The console shows a 500 error.",
  "submitter_name": "John Smith",
  "submitter_email": "john@example.com",
  "submitter_user_id": "user_12345",
  "priority": "high",
  "type": "bug",
  "metadata": {
    "browser": "Chrome 120",
    "page_url": "/inventory/reports",
    "organization_id": "org_789"
  }
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 42,
    "number": "PL-42",
    "title": "Unable to export inventory report",
    "content": "When I click the Export button...",
    "status": {
      "slug": "open",
      "title": "Open",
      "color": "#f59e0b"
    },
    "priority": {
      "slug": "high",
      "title": "High",
      "color": "#f97316"
    },
    "type": {
      "slug": "bug",
      "title": "Bug",
      "color": "#ef4444"
    },
    "assignee": null,
    "submitter": {
      "name": "John Smith",
      "email": "john@example.com",
      "user_id": "user_12345"
    },
    "created_at": "2026-01-17T10:30:00+00:00",
    "updated_at": "2026-01-17T10:30:00+00:00"
  },
  "message": "Ticket created successfully"
}
```

---

#### List Tickets

Retrieve tickets, optionally filtered by submitter or status.

```
GET /tickets
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `submitter_user_id` | string | Filter by your app's user ID |
| `submitter_email` | string | Filter by submitter email |
| `status` | string | Filter by status slug: `open`, `in_progress`, `pending`, `resolved`, `closed` |
| `per_page` | integer | Results per page (default: 15) |
| `page` | integer | Page number |

**Example Request:**

```
GET /tickets?submitter_user_id=user_12345&status=open
```

**Response:**

```json
{
  "data": [
    {
      "id": 42,
      "number": "PL-42",
      "title": "Unable to export inventory report",
      "content": "When I click the Export button...",
      "status": { "slug": "open", "title": "Open", "color": "#f59e0b" },
      "priority": { "slug": "high", "title": "High", "color": "#f97316" },
      "type": { "slug": "bug", "title": "Bug", "color": "#ef4444" },
      "assignee": null,
      "submitter": {
        "name": "John Smith",
        "email": "john@example.com",
        "user_id": "user_12345"
      },
      "created_at": "2026-01-17T10:30:00+00:00",
      "updated_at": "2026-01-17T10:30:00+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

#### Get Ticket

Retrieve a single ticket with its comments.

```
GET /tickets/{id}
```

**Response:**

```json
{
  "data": {
    "id": 42,
    "number": "PL-42",
    "title": "Unable to export inventory report",
    "content": "When I click the Export button...",
    "status": { "slug": "in_progress", "title": "In Progress", "color": "#3b82f6" },
    "priority": { "slug": "high", "title": "High", "color": "#f97316" },
    "type": { "slug": "bug", "title": "Bug", "color": "#ef4444" },
    "assignee": {
      "id": 1,
      "name": "Support Agent"
    },
    "submitter": {
      "name": "John Smith",
      "email": "john@example.com",
      "user_id": "user_12345"
    },
    "comments": [
      {
        "id": 101,
        "content": "Thanks for reporting this. Can you tell me which date range you're trying to export?",
        "author": "Support Agent",
        "is_from_admin": true,
        "created_at": "2026-01-17T11:00:00+00:00"
      }
    ],
    "labels": [
      { "id": 1, "name": "needs-info", "color": "#8b5cf6" }
    ],
    "time_tracking": {
      "estimate": "4h",
      "estimate_minutes": 240,
      "time_spent": "2h 30m",
      "time_spent_minutes": 150
    },
    "created_at": "2026-01-17T10:30:00+00:00",
    "updated_at": "2026-01-17T11:00:00+00:00"
  }
}
```

---

#### Update Ticket

Update the title or content of a ticket.

```
PATCH /tickets/{id}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated title |
| `content` | string | No | Updated description |
| `time_estimate` | string | No | Estimated time (format: `2w 4d 6h 45m`) |

**Example Request:**

```json
{
  "content": "Updated: The error happens specifically when exporting more than 1000 items."
}
```

**Response:**

```json
{
  "data": { ... },
  "message": "Ticket updated successfully"
}
```

---

### Comments

#### List Comments

Get all public comments on a ticket.

```
GET /tickets/{id}/comments
```

**Response:**

```json
{
  "data": [
    {
      "id": 101,
      "content": "Thanks for reporting this. Can you tell me which date range?",
      "author": "Support Agent",
      "is_from_admin": true,
      "created_at": "2026-01-17T11:00:00+00:00"
    },
    {
      "id": 102,
      "content": "I was trying to export January 2026 data.",
      "author": "John Smith",
      "is_from_admin": false,
      "created_at": "2026-01-17T11:15:00+00:00"
    }
  ]
}
```

---

#### Add Comment

Add a comment to a ticket.

```
POST /tickets/{id}/comments
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The comment text |
| `submitter_name` | string | No | Override submitter name (defaults to ticket submitter) |
| `submitter_email` | string | No | Override submitter email (defaults to ticket submitter) |

**Example Request:**

```json
{
  "content": "I was trying to export January 2026 data."
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 102,
    "content": "I was trying to export January 2026 data.",
    "author": "John Smith",
    "is_from_admin": false,
    "created_at": "2026-01-17T11:15:00+00:00"
  },
  "message": "Comment added successfully"
}
```

---

### Reference Data

#### Get Statuses

```
GET /statuses
```

**Response:**

```json
{
  "data": [
    { "slug": "open", "title": "Open", "color": "#f59e0b", "is_default": true },
    { "slug": "in_progress", "title": "In Progress", "color": "#3b82f6", "is_default": false },
    { "slug": "pending", "title": "Pending", "color": "#8b5cf6", "is_default": false },
    { "slug": "resolved", "title": "Resolved", "color": "#22c55e", "is_default": false },
    { "slug": "closed", "title": "Closed", "color": "#64748b", "is_default": false }
  ]
}
```

---

#### Get Priorities

```
GET /priorities
```

**Response:**

```json
{
  "data": [
    { "slug": "low", "title": "Low", "color": "#22c55e" },
    { "slug": "medium", "title": "Medium", "color": "#f59e0b" },
    { "slug": "high", "title": "High", "color": "#f97316" },
    { "slug": "critical", "title": "Critical", "color": "#ef4444" }
  ]
}
```

---

#### Get Types

```
GET /types
```

**Response:**

```json
{
  "data": [
    { "slug": "bug", "title": "Bug", "color": "#ef4444", "icon": "bug" },
    { "slug": "feature", "title": "Feature Request", "color": "#8b5cf6", "icon": "lightbulb" },
    { "slug": "question", "title": "Question", "color": "#3b82f6", "icon": "help-circle" },
    { "slug": "task", "title": "Task", "color": "#22c55e", "icon": "check-square" }
  ]
}
```

---

## Error Responses

All errors return a JSON object with a `message` field.

**401 Unauthorized** - Missing or invalid API key:

```json
{
  "message": "Invalid API key"
}
```

**404 Not Found** - Resource not found:

```json
{
  "message": "Ticket not found"
}
```

**422 Unprocessable Entity** - Validation error:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "submitter_email": ["The submitter email must be a valid email address."]
  }
}
```

---

## Code Examples

### PHP (Laravel)

```php
use Illuminate\Support\Facades\Http;

class HelpdeskService
{
    private string $apiKey;
    private string $baseUrl = 'https://corelink.dev/api/helpdesk/v1';

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function createTicket(array $data): array
    {
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->post("{$this->baseUrl}/tickets", $data);

        return $response->json();
    }

    public function getTicket(int $id): array
    {
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->get("{$this->baseUrl}/tickets/{$id}");

        return $response->json();
    }

    public function addComment(int $ticketId, string $content): array
    {
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->post("{$this->baseUrl}/tickets/{$ticketId}/comments", [
            'content' => $content,
        ]);

        return $response->json();
    }

    public function getUserTickets(string $userId): array
    {
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->get("{$this->baseUrl}/tickets", [
            'submitter_user_id' => $userId,
        ]);

        return $response->json();
    }
}

// Usage
$helpdesk = new HelpdeskService(config('services.corelink.api_key'));

$ticket = $helpdesk->createTicket([
    'title' => 'Export not working',
    'content' => 'Detailed description here...',
    'submitter_name' => auth()->user()->name,
    'submitter_email' => auth()->user()->email,
    'submitter_user_id' => (string) auth()->id(),
    'priority' => 'high',
    'type' => 'bug',
]);
```

### JavaScript (Node.js / Fetch)

```javascript
class HelpdeskClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://corelink.dev/api/helpdesk/v1';
  }

  async request(method, path, data = null) {
    const options = {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${path}`, options);
    return response.json();
  }

  async createTicket(data) {
    return this.request('POST', '/tickets', data);
  }

  async getTicket(id) {
    return this.request('GET', `/tickets/${id}`);
  }

  async addComment(ticketId, content) {
    return this.request('POST', `/tickets/${ticketId}/comments`, { content });
  }

  async getUserTickets(userId) {
    return this.request('GET', `/tickets?submitter_user_id=${userId}`);
  }
}

// Usage
const helpdesk = new HelpdeskClient(process.env.CORELINK_API_KEY);

const ticket = await helpdesk.createTicket({
  title: 'Export not working',
  content: 'Detailed description here...',
  submitter_name: user.name,
  submitter_email: user.email,
  submitter_user_id: user.id,
  priority: 'high',
  type: 'bug',
});
```

---

## Best Practices

1. **Store the ticket ID**: After creating a ticket, store the returned `id` in your database so users can track their tickets.

2. **Use `submitter_user_id`**: Always pass your application's user ID so you can filter tickets by user later.

3. **Include metadata**: Use the `metadata` field to include context like browser info, page URL, or relevant IDs from your application.

4. **Check for updates**: Poll `GET /tickets/{id}` to check for status changes or new comments from support staff.

5. **Handle errors gracefully**: Always check for error responses and display appropriate messages to users.
