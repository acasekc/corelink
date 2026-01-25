# 📊 Refactoring Plan Overview (Visual)

---

## Architecture Flow

```
REQUEST COMES IN
    ↓
MIDDLEWARE LAYER (Authentication/Authorization)
├─ api-key middleware (for external API)
├─ admin middleware (for admin routes)
└─ helpdesk.user middleware (for user routes)
    ↓
CONTROLLER (Thin HTTP Handler)
├─ Route model binding (auto-loads model)
├─ Authorization check via Policy: authorize('view', $model)
├─ Validate via Form Request: new StoreTicketRequest
├─ Delegate to Service
    ↓
SERVICE (Business Logic)
├─ list() - get all
├─ paginate() - get paginated
├─ getById() - get one
├─ create() - create new
├─ update() - update existing
└─ delete() - delete
    ↓
RESPONSE
├─ Use API Resource to format
├─ Return JsonResponse
└─ Format: { "data": {...}, "meta": {...} }
    ↓
FRONTEND RECEIVES
└─ Knows structure: result.data, result.meta
```

---

## Before vs After

```
BEFORE                          AFTER
================                ================

Controllers/                    Controllers/
├─ Admin/                       ├─ ArticleController
│  └─ TicketController         ├─ TicketController
├─ API/                        ├─ CommentController
│  └─ TicketApiController      └─ ...
└─ Helpdesk/
   ├─ Api/
   │  └─ TicketApiController
   ├─ User/
   │  └─ TicketController
   └─ Admin/
      └─ TicketController

(3 controllers for same feature)  (1 controller, middleware handles roles)


Validation:                     Validation:
In controller:                  In Form Request:
$request->validate([...])       StoreTicketRequest extends FormRequest


Responses:                      Responses:
Manual JSON:                    API Resource:
response()->json([              response()->json([
  'data' => [...],                'data' => new TicketResource($ticket),
  ...                             'meta' => [...]
])                              ])


Services:                       Services:
Inconsistent methods:           Standardized CRUD:
createTicket()                  create($data)
getTickets()                    list()
getTicket($id)                  getById($id)
updateTicket()                  update($model, $data)
deleteTicket()                  delete($model)


Authorization:                  Authorization:
In controller logic:            In Policy classes:
if (!$user->isAdmin()) abort    $this->authorize('view', $ticket)
```

---

## Phase Implementation Timeline

```
START → PHASE 1 (Foundation) → PHASE 2 (Controllers) → PHASE 3 (Auth)
                                      ↓
                              (For each feature:)
                              1. Articles
                              2. Tickets
                              3. Comments
                              4. TimeEntries
                              5. Invoices
                              6. Projects

PHASE 1:                        PHASE 2:                  PHASE 3:
Services                        Controllers               Policies
Resources                       Routes                    Tests
                               Form Requests             FE Testing
                               Middleware

        ↓
    PHASE 4                  →  PHASE 5              →  PHASE 6           →  PHASE 7
    Write                       Code Quality             Frontend            Final
    Tests                       (pint)                  Manual Testing      Review
                               Type Safety              Regression
```

---

## Testing Strategy

```
For each phase/feature:

┌─ BACKEND TESTS ─────────────┐
│ php artisan test            │ ← All tests must PASS
│ vendor/bin/pint --dirty     │ ← Code style must PASS
└─────────────────────────────┘
           ↓
┌─ MANUAL FE TESTING ────────────────────────────┐
│ □ Page loads without errors                    │
│ □ API calls succeed (Network tab)              │
│ □ Forms submit correctly                       │
│ □ Error messages display                       │
│ □ No console errors                            │
│ □ No breaking changes in other features        │
└────────────────────────────────────────────────┘
           ↓
   READY TO PUSH ✓
```

---

## API Response Contract

```javascript
// Single Resource
GET /api/tickets/1
↓
{
  "data": {
    "id": 1,
    "title": "...",
    "status": { "id": 1, "name": "Open" },
    "created_at": "2026-01-24T10:00:00Z"
  }
}

// List (Paginated)
GET /api/tickets
↓
{
  "data": [
    { "id": 1, "title": "..." },
    { "id": 2, "title": "..." }
  ],
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15,
    "last_page": 7
  }
}

// Create (POST)
POST /api/tickets
↓
Status: 201
{
  "data": {
    "id": 123,
    "title": "...",
    "created_at": "2026-01-24T10:00:00Z"
  }
}

// Error
POST /api/tickets (invalid data)
↓
Status: 422
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"],
    "content": ["Content is required"]
  }
}

// Delete
DELETE /api/tickets/1
↓
Status: 204 (empty response)
```

---

## File Structure (New)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── ArticleController.php
│   │   ├── TicketController.php
│   │   └── ...
│   ├── Middleware/                ← NEW
│   │   ├── ApiKeyAuth.php
│   │   ├── AdminRole.php
│   │   └── HelpdeskUser.php
│   ├── Requests/                  ← NEW
│   │   ├── StoreTicketRequest.php
│   │   ├── UpdateTicketRequest.php
│   │   └── ...
│   └── Resources/                 ← NEW
│       ├── TicketResource.php
│       ├── CommentResource.php
│       └── ...
├── Services/
│   ├── TicketService.php          ← REFACTORED
│   ├── CommentService.php
│   └── ...
├── Policies/                      ← NEW
│   ├── TicketPolicy.php
│   ├── CommentPolicy.php
│   └── ...
└── Models/
    ├── Ticket.php
    └── ...

tests/
├── Feature/
│   ├── ArticleTest.php
│   ├── TicketTest.php
│   └── ...Helpdesk/
│       └── ...
```

---

## Middleware Groups (Routes)

```php
// routes/api/helpdesk.php

// External API (API Key Auth)
Route::middleware(['api-key'])->group(function () {
    Route::apiResource('tickets', TicketController::class);
    // All external API endpoints
});

// Admin Dashboard
Route::middleware(['web', 'auth', 'admin'])->group(function () {
    Route::apiResource('admin/tickets', TicketController::class);
    // Admin-specific endpoints
});

// User Portal
Route::middleware(['web', 'auth', 'helpdesk.user'])->group(function () {
    Route::apiResource('user/tickets', TicketController::class);
    // User-specific endpoints
});
```

---

## Service Interface (Standard)

```php
class TicketService
{
    // Get all records as collection
    public function list(): Collection
    
    // Get paginated records
    public function paginate(int $perPage = 15): LengthAwarePaginator
    
    // Get single record by ID
    public function getById(int $id): Ticket
    
    // Create new record
    public function create(array $data): Ticket
    
    // Update existing record
    public function update(Ticket $model, array $data): Ticket
    
    // Delete record
    public function delete(Ticket $model): bool
}
```

---

## Controller Pattern (Template)

```php
class TicketController extends Controller
{
    public function __construct(private TicketService $service) {}

    public function index(): JsonResponse
    {
        $tickets = $this->service->paginate();
        return response()->json([
            'data' => TicketResource::collection($tickets->items()),
            'meta' => [/* pagination */]
        ]);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = $this->service->create($request->validated());
        return response()->json(['data' => new TicketResource($ticket)], 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);
        return response()->json(['data' => new TicketResource($ticket)]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);
        $ticket = $this->service->update($ticket, $request->validated());
        return response()->json(['data' => new TicketResource($ticket)]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);
        $this->service->delete($ticket);
        return response()->json(null, 204);
    }
}
```

---

## Feature Order & Complexity

```
ARTICLES
⭐⭐ Simple, independent
└─ Good template for other features

HELPDESK TICKETS  
⭐⭐⭐⭐ Complex, many relations
└─ Establish patterns at scale

COMMENTS
⭐⭐⭐ Depends on Tickets
└─ Reuse Ticket patterns

TIME ENTRIES
⭐⭐⭐ Depends on Tickets
└─ Similar patterns

INVOICES
⭐⭐⭐⭐ Depends on TimeEntries
└─ Complex, multiple relations

PROJECTS
⭐⭐⭐ Independent, many endpoints
└─ Variations on established patterns

CONVERSATIONS
⭐⭐⭐⭐⭐ AI-related, specialized
└─ May need custom patterns
```

---

## Decision Matrix

```
DECISION                    OPTION 1              OPTION 2 (CHOSEN)
──────────────────────────────────────────────────────────────────
Auth handling               Controller namespace  ✓ Middleware groups
Service CRUD interface      Inconsistent          ✓ Standardized CRUD
Response formatting         Manual JSON           ✓ API Resources
Validation location         Inline                ✓ Form Requests
Authorization check         Controllers           ✓ Policies + middleware
Test priority              Unit tests            ✓ Feature tests
Refactor scope             Feature by feature    ✓ All-at-once
FE changes needed?         Major refactor        ✓ Zero changes
```

---

## Quick Reference Card

```
TO CREATE A NEW FEATURE:
1. Create model+migration: php artisan make:model
2. Create service: php artisan make:class Services/FeatureService
   └─ Implement: list(), paginate(), getById(), create(), update(), delete()
3. Create resource: php artisan make:resource FeatureResource
   └─ Format response structure
4. Create requests: php artisan make:request StoreFeatureRequest
   └─ Add validation rules and messages
5. Create controller: php artisan make:controller FeatureController --resource
   └─ Inject service, use Form Requests, return Resources
6. Create policy: php artisan make:policy FeaturePolicy
   └─ Add view(), create(), update(), delete() methods
7. Create test: php artisan make:test Feature/FeatureTest
   └─ Test all CRUD operations
8. Register routes: Add to appropriate routes file with middleware
9. Test: php artisan test && vendor/bin/pint --dirty
10. Manual FE testing
```

---

## Success Checklist

```
SERVICES
☐ All services have: list(), paginate(), getById(), create(), update(), delete()
☐ Return types declared
☐ Relationships eager loaded

CONTROLLERS
☐ Thin (no business logic)
☐ Use dependency injection
☐ Use Form Requests
☐ Use authorization
☐ Return API Resources

REQUESTS
☐ All validation in Form Requests
☐ Custom error messages
☐ Authorization if needed

RESOURCES
☐ All responses use Resources
☐ Consistent structure
☐ Proper formatting

TESTS
☐ All CRUD operations tested
☐ Validation failures tested
☐ Authorization tested
☐ All tests passing

QUALITY
☐ Code style: vendor/bin/pint
☐ Type safety: proper annotations
☐ Manual FE testing: all pages work
```

---

**Everything is documented in `.github/`**  
**Start with `.github/START_HERE.md`**  
**Reference patterns in `.github/agents/backend.agent.md`**
