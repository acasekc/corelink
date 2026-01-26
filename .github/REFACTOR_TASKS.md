# Refactor Task Tracking

**Start Date**: January 24, 2026  
**Target Completion**: [TBD based on team capacity]  
**Status**: Planning Complete → Ready for Execution

---

## PHASE 1: Foundation (Services & API Resources)

### 1.1 Article Service
- [ ] Standardize ArticleService methods (list, paginate, getById, create, update, delete)
- [ ] Add return type hints to all methods
- [ ] Ensure eager loading of relationships
- [ ] Create unit test for ArticleService

### 1.2 API Resources
- [ ] Create `app/Http/Resources/ArticleResource.php`
- [ ] Create `app/Http/Resources/TicketResource.php`
- [ ] Create `app/Http/Resources/CommentResource.php`
- [ ] Create `app/Http/Resources/ProjectResource.php`
- [ ] Create `app/Http/Resources/TimeEntryResource.php`
- [ ] Create `app/Http/Resources/InvoiceResource.php`
- [ ] Create `app/Http/Resources/ProjectUserResource.php` (if needed)
- [ ] Test resources return correct structure

### 1.3 Service Updates
- [ ] Review InviteCodeService - standardize if needed
- [ ] Review ConversationService - standardize if needed
- [ ] Review Helpdesk/TicketService (create if missing)
- [ ] Review Helpdesk/CommentService (create if missing)
- [ ] Review Helpdesk/TimeEntryService (create if missing)
- [ ] Keep specialized services (WebhookService, StripePaymentService)

---

## PHASE 2: Controllers & Routes

### 2.1 Middleware Setup
- [ ] Create `app/Http/Middleware/ApiKeyAuth.php`
- [ ] Create `app/Http/Middleware/AdminRole.php`
- [ ] Create `app/Http/Middleware/HelpdeskUser.php`
- [ ] Register middleware in `bootstrap/app.php`
- [ ] Test middleware functionality

### 2.2 Form Requests (Articles)
- [ ] Create `app/Http/Requests/StoreArticleRequest.php`
- [ ] Create `app/Http/Requests/UpdateArticleRequest.php`
- [ ] Include validation rules and custom messages

### 2.3 Form Requests (Helpdesk)
- [ ] Create `app/Http/Requests/StoreTicketRequest.php`
- [ ] Create `app/Http/Requests/UpdateTicketRequest.php`
- [ ] Create `app/Http/Requests/StoreCommentRequest.php`
- [ ] Create `app/Http/Requests/UpdateCommentRequest.php`
- [ ] Create `app/Http/Requests/StoreTimeEntryRequest.php`

### 2.4 Controller Refactoring (Articles)
- [ ] Refactor `ArticleController` - use service, resources, form requests
- [ ] Remove business logic from controller
- [ ] Add authorization checks
- [ ] Test manually in API client

### 2.5 Controller Refactoring (Helpdesk)
- [ ] Merge `Helpdesk/Api/TicketApiController` + `Helpdesk/Admin/TicketController` + `Helpdesk/User/TicketController` into one `TicketController`
- [ ] Use middleware to differentiate routes
- [ ] Same for CommentController
- [ ] Same for ProjectController
- [ ] Update routes to use middleware groups instead of nested paths

### 2.6 Routes Update
- [ ] Update `routes/api/helpdesk.php` - use middleware groups
- [ ] Update `routes/api/discovery-bot.php` - apply patterns
- [ ] Verify route groups separate by middleware not namespace

---

## PHASE 3: Authorization & Policies

### 3.1 Policy Classes
- [ ] Create `app/Policies/ArticlePolicy.php`
- [ ] Create `app/Policies/TicketPolicy.php`
- [ ] Create `app/Policies/CommentPolicy.php`
- [ ] Create `app/Policies/TimeEntryPolicy.php`
- [ ] Create `app/Policies/InvoicePolicy.php`

### 3.2 Policy Implementation
- [ ] Add view, create, update, delete methods to each policy
- [ ] Register policies in `app/Providers/AuthServiceProvider.php`
- [ ] Add authorization checks to controllers: `$this->authorize('view', $model)`

### 3.3 Test Policies
- [ ] Unit test each policy (or feature test)
- [ ] Verify authorization prevents unauthorized access

---

## PHASE 4: Testing

### 4.1 Feature Tests (Articles)
- [ ] `tests/Feature/ArticleTest.php` - index, store, show, update, destroy
- [ ] Test validation failures
- [ ] Test authorization failures
- [ ] Test success cases

### 4.2 Feature Tests (Helpdesk)
- [ ] `tests/Feature/Helpdesk/TicketTest.php` - full CRUD
- [ ] `tests/Feature/Helpdesk/CommentTest.php` - full CRUD
- [ ] `tests/Feature/Helpdesk/TimeEntryTest.php` - full CRUD
- [ ] `tests/Feature/Helpdesk/TicketAuthenticationTest.php` - API key, session, authorization

### 4.3 Feature Tests (Middleware/Auth)
- [ ] `tests/Feature/Helpdesk/Api/ApiKeyAuthenticationTest.php` - API key works
- [ ] `tests/Feature/Helpdesk/AdminAuthenticationTest.php` - Admin middleware
- [ ] `tests/Feature/Helpdesk/UserAuthenticationTest.php` - User middleware

### 4.4 Run All Tests
- [ ] `php artisan test` - all pass
- [ ] Review code coverage
- [ ] Fix any failing tests

---

## PHASE 5: Code Quality

### 5.1 Code Style
- [ ] Run `vendor/bin/pint --dirty`
- [ ] Fix any style issues
- [ ] Verify all code passes pint

### 5.2 Type Safety
- [ ] Review all method signatures
- [ ] Ensure return types declared
- [ ] Ensure parameter types declared

### 5.3 Linting
- [ ] Run PHPStan or similar if configured
- [ ] Fix any static analysis issues

---

## PHASE 6: Frontend Testing

### 6.1 Manual Frontend Testing

**Article Pages**:
- [ ] Blog list page loads
- [ ] Article detail page loads
- [ ] Admin create article form works
- [ ] Admin update article form works
- [ ] Admin delete article works

**Helpdesk Pages**:
- [ ] Ticket list loads
- [ ] Ticket detail loads
- [ ] Create ticket form works
- [ ] Update ticket form works
- [ ] Add comment works
- [ ] Add time entry works
- [ ] Create invoice works

**Test Checklist Per Page**:
- [ ] Page loads without errors
- [ ] API calls succeed (check Network tab)
- [ ] Data displays correctly
- [ ] Form submissions work
- [ ] Error messages display (if applicable)
- [ ] No console errors

### 6.2 Regression Testing
- [ ] Test existing features still work
- [ ] No breaking changes visible to users
- [ ] All buttons/links functional

---

## PHASE 7: Documentation & Final Review

### 7.1 Update Documentation
- [ ] Verify agent files match implementation
- [ ] Update CLAUDE.md if needed
- [ ] Add code comments for complex logic
- [ ] Verify copilot-instructions.md still accurate

### 7.2 Final Code Review
- [ ] Architecture follows pattern
- [ ] No business logic in controllers
- [ ] Services provide standard CRUD
- [ ] Resources return correct structure
- [ ] Middleware handles auth properly
- [ ] Tests cover happy + error paths

### 7.3 Deployment Ready
- [ ] All tests passing
- [ ] Code style clean
- [ ] Documentation updated
- [ ] FE testing complete
- [ ] Ready for staging/production

---

## Per-Feature Implementation Order

This is the order to refactor features (establish patterns with simpler ones first):

### FEATURE 1: Articles ✓
**Status**: Not started  
**Complexity**: ⭐⭐ (Simple, independent)  
**Phased tasks**: 
- [ ] Phase 1: ArticleService + ArticleResource
- [ ] Phase 2: ArticleController refactor + Form Requests
- [ ] Phase 3: ArticlePolicy
- [ ] Phase 4: ArticleTest
- [ ] Phase 5: Code quality
- [ ] Phase 6: Manual FE testing

### FEATURE 2: Helpdesk Tickets
**Status**: Not started  
**Complexity**: ⭐⭐⭐⭐ (Complex, many relations)  
**Phased tasks**: Similar to Articles

### FEATURE 3: Comments
**Status**: Not started  
**Complexity**: ⭐⭐⭐ (Depends on Tickets)  
**Phased tasks**: Similar to Articles

### FEATURE 4: TimeEntries
**Status**: Not started  
**Complexity**: ⭐⭐⭐ (Depends on Tickets)  
**Phased tasks**: Similar to Articles

### FEATURE 5: Invoices
**Status**: Not started  
**Complexity**: ⭐⭐⭐⭐ (Depends on TimeEntries)  
**Phased tasks**: Similar to Articles

### FEATURE 6: Projects
**Status**: Not started  
**Complexity**: ⭐⭐⭐ (Independent but many endpoints)  
**Phased tasks**: Similar to Articles

### FEATURE 7: Conversations (Optional)
**Status**: Not started  
**Complexity**: ⭐⭐⭐⭐⭐ (AI-related, specialized)  
**Phased tasks**: May need custom patterns

---

## Testing Checklist Template

For each phase/feature, use this checklist:

```
### ✅ Pre-Push Testing

Backend:
- [ ] php artisan test → all pass
- [ ] vendor/bin/pint --dirty → no issues
- [ ] Manual API testing in Postman/Thunder Client
  - [ ] GET list endpoint works
  - [ ] POST create works with valid data
  - [ ] POST create fails with invalid data (422)
  - [ ] GET detail works
  - [ ] PATCH update works
  - [ ] DELETE works
  - [ ] Authorization tests pass

Frontend:
- [ ] List page loads (no errors in console)
- [ ] Detail page loads
- [ ] Create form works
- [ ] Edit form works
- [ ] Delete works
- [ ] Error messages display correctly
- [ ] Network tab shows correct response structure
- [ ] No breaking changes to other features

Ready to push: YES / NO
```

---

## Notes & Decisions

- **Middleware approach** - Cleaner than controller namespaces, authorization in one place
- **All-at-once refactoring** - Ensures consistency across all domains
- **Feature-test priority** - Tests cover user workflows, easier to maintain
- **API Resources mandatory** - Consistent response format, FE expectation clear
- **No FE changes needed** - API contract preserved, responses in same format

---

## Progress Tracking

```
Phase 1 (Foundation):    ░░░░░░░░░░  0%
Phase 2 (Controllers):   ░░░░░░░░░░  0%
Phase 3 (Authorization): ░░░░░░░░░░  0%
Phase 4 (Testing):       ░░░░░░░░░░  0%
Phase 5 (Quality):       ░░░░░░░░░░  0%
Phase 6 (FE Testing):    ░░░░░░░░░░  0%
Phase 7 (Final):         ░░░░░░░░░░  0%

Overall: ░░░░░░░░░░  0% (0 of XX tasks complete)
```

---

**Last Updated**: January 24, 2026  
**Next Review**: After Phase 1 completion
