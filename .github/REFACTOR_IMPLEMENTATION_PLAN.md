# Comprehensive Backend & Frontend Refactor Plan

**Status**: Analysis Complete | Ready for Implementation  
**Scope**: Complete system refactor - all domains simultaneously  
**Timeline**: Phased execution  
**Testing**: PHPUnit + Manual FE testing before each push

---

## Decisions Made ✅

1. **Middleware for Authorization** - Use middleware for role/access control (Admin/User/Api), NOT separate controller namespaces
2. **Selective CRUD** - Only implement what's needed per feature, not forced full CRUD
3. **Middleware for Concerns** - Authorization, API key validation, etc. in middleware
4. **API Resources Mandatory** - Consistent response format with explicit resource classes
5. **Feature Tests Priority** - PHPUnit feature tests as primary testing strategy
6. **All-At-Once Refactor** - Systematic refactoring across all domains simultaneously
7. **FE/BE Consistency Check** - Ensure API contracts align before testing

---

## API Response Contract (FE Expectations)

Based on FE code analysis, the expected response format is:

### Standard Success Response
```json
{
  "data": {
    "id": 1,
    "name": "Example",
    "created_at": "2026-01-24T10:00:00Z",
    ...
  }
}
```

### List/Paginated Response
```json
{
  "data": [
    { "id": 1, ... },
    { "id": 2, ... }
  ],
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15,
    "last_page": 7
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}
```

**Note**: This is what FE expects based on `result.data` access pattern. All API Resources must follow this.

---

## Architecture Changes

### BEFORE: Controller Organization
```
Controllers/
├── Admin/
│   ├── TicketController
│   ├── ProjectController
│   └── ...
├── API/
│   └── ...
└── Helpdesk/
    ├── Api/
    │   └── TicketApiController
    ├── User/
    │   └── TicketController
    └── ...
```

### AFTER: Middleware-Based Organization
```
Controllers/
├── TicketController (handles all ticket endpoints)
├── ProjectController
├── CommentController
└── ... (feature-based, not role-based)

Middleware/
├── 'admin' → requires admin role
├── 'helpdesk.user' → requires helpdesk access
├── 'api-key' → requires valid API key
└── ... (authorization/auth concerns)
```

### Routes: Middleware Groups
```php
// routes/api/helpdesk.php

// External API (API Key Auth)
Route::middleware(['api-key'])->group(function () {
    Route::apiResource('tickets', TicketController::class);
    // All shared endpoints
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

## Implementation Phases

### PHASE 1: Foundation (Services & Resources)
**Goal**: Standardize all services and create API resources

#### 1.1 Service Method Standardization
All services get these methods (if applicable):
```php
public function list(): Collection
public function paginate(int $perPage = 15): LengthAwarePaginator
public function getById(int $id): Model
public function create(array $data): Model
public function update(Model $model, array $data): Model
public function delete(Model $model): bool
```

**Services to Update**:
- [ ] ArticleService
- [ ] ArticleGenerationService (keep specialized methods)
- [ ] ConversationService
- [ ] InviteCodeService
- [ ] Helpdesk/TicketService (create)
- [ ] Helpdesk/CommentService (create)
- [ ] Helpdesk/StripePaymentService (keep specialized)
- [ ] Helpdesk/WebhookService (keep specialized - not a CRUD service)

#### 1.2 Create API Resources
Create `app/Http/Resources/` directory:
```
Resources/
├── ArticleResource.php
├── TicketResource.php
├── CommentResource.php
├── ProjectResource.php
├── InvoiceResource.php
├── TimeEntryResource.php
└── ... (one per model that's returned in API)
```

**Pattern**:
```php
namespace App\Http\Resources;

class TicketResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'title' => $this->title,
            'content' => $this->content,
            'status' => [
                'id' => $this->status?->id,
                'name' => $this->status?->name,
                'slug' => $this->status?->slug,
            ],
            'priority' => [
                'id' => $this->priority?->id,
                'name' => $this->priority?->name,
                'slug' => $this->priority?->slug,
            ],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### PHASE 2: Controllers & Routes
**Goal**: Extract business logic to services, use Form Requests, return Resources

#### 2.1 Create Form Requests
For each POST/PUT/PATCH endpoint:
```
Requests/
├── StoreTicketRequest.php
├── UpdateTicketRequest.php
├── StoreCommentRequest.php
├── StoreProjectRequest.php
└── ...
```

**Pattern**:
```php
namespace App\Http\Requests;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'project_id' => 'required|exists:helpdesk_projects,id',
            'priority_id' => 'nullable|exists:helpdesk_ticket_priorities,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A title is required',
            'content.required' => 'Description is required',
        ];
    }
}
```

#### 2.2 Refactor Controllers
Pattern for all controllers:

```php
namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Helpdesk\Ticket;
use App\Services\Helpdesk\TicketService;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function __construct(
        private TicketService $service,
    ) {}

    public function index(): JsonResponse
    {
        $tickets = $this->service->paginate(15);
        return response()->json([
            'data' => TicketResource::collection($tickets->items()),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
            ],
        ]);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = $this->service->create($request->validated());
        return response()->json(['data' => new TicketResource($ticket)], 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        // Authorization handled by route model binding + middleware
        return response()->json(['data' => new TicketResource($ticket)]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $updated = $this->service->update($ticket, $request->validated());
        return response()->json(['data' => new TicketResource($updated)]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->service->delete($ticket);
        return response()->json(null, 204);
    }
}
```

#### 2.3 Create Middleware
Replace controller namespace separation with middleware:

```php
// app/Http/Middleware/ApiKeyAuth.php
public function handle($request, Closure $next)
{
    $key = $request->header('X-API-Key');
    if (!$key || !ApiKey::where('key', $key)->exists()) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    return $next($request);
}

// app/Http/Middleware/AdminRole.php
public function handle($request, Closure $next)
{
    if (!$request->user()?->isAdmin()) {
        abort(403);
    }
    return $next($request);
}

// app/Http/Middleware/HelpdeskUser.php
public function handle($request, Closure $next)
{
    if (!$request->user()?->hasHelpdeskAccess()) {
        abort(403);
    }
    return $next($request);
}
```

Register in `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => AdminRole::class,
        'helpdesk.user' => HelpdeskUser::class,
        'api-key' => ApiKeyAuth::class,
    ]);
})
```

### PHASE 3: Authorization & Policies
**Goal**: Add policy authorization checks

#### 3.1 Create Policies
```php
// app/Policies/TicketPolicy.php
public function view(User $user, Ticket $ticket): bool
{
    return $user->isAdmin() || $user->id === $ticket->assignee_id;
}

public function update(User $user, Ticket $ticket): bool
{
    return $user->isAdmin() || $user->id === $ticket->assignee_id;
}
```

#### 3.2 Add Authorization Checks in Controllers
```php
public function show(Ticket $ticket): JsonResponse
{
    $this->authorize('view', $ticket); // ← Add this
    return response()->json(['data' => new TicketResource($ticket)]);
}
```

### PHASE 4: Tests
**Goal**: Comprehensive PHPUnit feature tests

#### 4.1 Feature Test Pattern
```php
// tests/Feature/Helpdesk/TicketTest.php
class TicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_all_tickets(): void
    {
        $admin = User::factory()->admin()->create();
        $tickets = Ticket::factory(5)->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/helpdesk/admin/tickets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'status', 'created_at'],
                ],
                'meta' => ['current_page', 'total', 'per_page', 'last_page'],
            ]);
    }

    public function test_user_can_only_see_their_tickets(): void
    {
        $user = User::factory()->create();
        $theirTicket = Ticket::factory()->create(['submitter_user_id' => $user->id]);
        $otherTicket = Ticket::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/helpdesk/user/tickets');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertContains($theirTicket->id, $ids);
        $this->assertNotContains($otherTicket->id, $ids);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/helpdesk/user/tickets', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content']);
    }

    public function test_api_key_auth_works(): void
    {
        $key = ApiKey::factory()->create();

        $response = $this->getJson('/api/helpdesk/v1/tickets', [
            'X-API-Key' => $key->key,
        ]);

        $response->assertStatus(200);
    }
}
```

---

## Directory Structure (After Refactor)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── TicketController.php          ← All ticket endpoints
│   │   ├── CommentController.php         ← All comment endpoints
│   │   ├── ProjectController.php
│   │   ├── ArticleController.php
│   │   ├── InvoiceController.php
│   │   └── ... (feature-based)
│   ├── Middleware/
│   │   ├── ApiKeyAuth.php                ← API key validation
│   │   ├── AdminRole.php                 ← Requires admin
│   │   ├── HelpdeskUser.php              ← Requires helpdesk access
│   │   └── ... (authorization concerns)
│   ├── Requests/
│   │   ├── StoreTicketRequest.php
│   │   ├── UpdateTicketRequest.php
│   │   ├── StoreCommentRequest.php
│   │   └── ... (form validation)
│   └── Resources/
│       ├── TicketResource.php
│       ├── CommentResource.php
│       ├── ProjectResource.php
│       └── ... (response formatting)
├── Services/
│   ├── TicketService.php                 ← CRUD + business logic
│   ├── CommentService.php
│   ├── ProjectService.php
│   └── ... (only business logic, never HTTP)
├── Models/
│   ├── Ticket.php                        ← Relationships + casts
│   └── ...
├── Policies/
│   ├── TicketPolicy.php                  ← Authorization rules
│   ├── CommentPolicy.php
│   └── ...
└── ...
```

---

## Testing Strategy

### Testing Sequence
1. **Unit Tests** (if needed) - Service methods
2. **Feature Tests** - Controller endpoints
3. **Manual Frontend Tests** - UI interaction
4. **Integration Tests** - Full workflows

### Test Coverage by Feature
```
Every feature needs:
✅ Happy path (success)
✅ Validation failure
✅ Authorization failure (403)
✅ Not found (404)
✅ Edge cases
```

### Testing Before Push Checklist
- [ ] All feature tests pass: `php artisan test`
- [ ] Code style fixed: `vendor/bin/pint --dirty`
- [ ] Manual FE testing for affected endpoints
- [ ] API responses match FE expectations
- [ ] No regression in existing features

---

## Frontend Impact Analysis

### FE Endpoints that will be affected:

#### Helpdesk Module
- ✅ GET `/api/helpdesk/user/tickets` - Response format stable
- ✅ GET `/api/helpdesk/user/tickets/{id}` - Response format stable
- ✅ POST `/api/helpdesk/user/tickets` - Response format stable
- ✅ PATCH `/api/helpdesk/user/tickets/{id}` - Response format stable
- ✅ GET/POST `/api/helpdesk/user/tickets/{id}/comments` - Response format stable
- ✅ GET `/api/helpdesk/user/projects` - Response format stable

#### Blog Module
- ✅ GET `/api/projects` - Response format stable
- ✅ GET/POST `/api/articles` - Response format stable

**Note**: FE expects `result.data` structure, which will be maintained through API Resources.

### Breaking Changes: NONE (if API contract is maintained)

The refactor changes HOW we build responses (using Resources) but NOT the structure of responses. FE will work without modification if:
1. Response structure stays: `{ "data": [...], "meta": {...} }`
2. Field names don't change
3. Relationship formatting stays consistent

### Manual FE Testing Required For:
- [ ] Create Ticket (form submission)
- [ ] Update Ticket (form submission)
- [ ] Create Comment (inline)
- [ ] Create Time Entry
- [ ] Attach files
- [ ] All list/detail pages load correctly

---

## Implementation Checklist

### Phase 1: Services & Resources
- [ ] Update all service methods to standard interface
- [ ] Create API Resource classes
- [ ] Test services with unit tests

### Phase 2: Controllers & Routes
- [ ] Create middleware classes
- [ ] Register middleware in bootstrap/app.php
- [ ] Create Form Request classes
- [ ] Refactor all controllers to use services + resources
- [ ] Update routes to use middleware groups
- [ ] Run feature tests

### Phase 3: Authorization
- [ ] Create policy classes
- [ ] Add authorization checks in controllers
- [ ] Test authorization with feature tests

### Phase 4: Tests
- [ ] Create comprehensive feature tests
- [ ] All tests pass: `php artisan test`
- [ ] Code style check: `vendor/bin/pint --dirty`

### Phase 5: Frontend Testing
- [ ] Manual test each affected FE page
- [ ] Verify API responses are received correctly
- [ ] Check error handling works
- [ ] Test form submissions

---

## Order of Refactoring Features

**By importance/complexity** (to establish patterns early):

1. **Articles** (simplest, public-facing)
2. **Helpdesk Tickets** (complex, used heavily)
3. **Comments** (depends on tickets)
4. **Time Entries** (medium complexity)
5. **Invoices** (depends on time entries)
6. **Projects** (medium complexity)
7. **Conversations** (AI-related, specialized)

---

## Code Review Checkpoints

Before pushing each phase:

1. **Service Methods** - All have proper return types, handle relationships
2. **API Resources** - Consistent structure, match FE expectations
3. **Form Requests** - Cover all validation cases, custom messages
4. **Controllers** - No business logic, use resources, proper error handling
5. **Middleware** - Works for all auth types (session, API key)
6. **Tests** - Comprehensive coverage, all green
7. **FE Testing** - No regressions, endpoints work as expected

---

## Success Criteria

✅ **Completion when:**
1. All services follow standard CRUD interface
2. All API endpoints use Resources for responses
3. All controllers are thin (no business logic)
4. All validation in Form Requests
5. Authorization enforced via policies
6. 100% FE endpoints tested manually
7. All PHPUnit tests passing
8. Code passes `vendor/bin/pint`
9. No FE breaking changes
10. Documentation updated

---

**Next Step**: Start Phase 1 with Articles service?
