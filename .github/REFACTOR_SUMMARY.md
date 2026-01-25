# Refactoring Plan Summary

**Status**: ✅ Ready for Implementation  
**Date**: January 24, 2026  
**Scope**: Complete backend refactoring with frontend compatibility

---

## What's Changing

### Backend Architecture
- **FROM**: Controller namespaces (Admin/, User/, Api/) handling auth/roles
- **TO**: Middleware handling auth/roles, unified controller structure

- **FROM**: Inconsistent services, inline validation, manual JSON responses
- **TO**: Standardized CRUD services, Form Requests, API Resources

- **FROM**: Business logic scattered in controllers
- **TO**: Controllers as thin HTTP handlers delegating to services

### Frontend API Contract
- **FROM**: Implicit/inconsistent API expectations
- **TO**: Explicit documented response format (data/meta structure)

---

## Documents Created

1. **`.github/REFACTOR_ANALYSIS.md`** - Initial gap analysis
2. **`.github/REFACTOR_IMPLEMENTATION_PLAN.md`** - Detailed phase-by-phase plan
3. **`.github/agents/backend.agent.md`** - UPDATED with new architecture
4. **`.github/agents/frontend.agent.md`** - UPDATED with API contract

---

## Key Decisions

✅ **Middleware instead of controller namespaces**
- Middleware groups: `api-key`, `admin`, `helpdesk.user`
- Route files define access, not directory structure
- Cleaner controller organization

✅ **Standardized Service CRUD**
- All services: `list()`, `paginate()`, `getById()`, `create()`, `update()`, `delete()`
- Services handle relationships (eager loading)
- Services never aware of HTTP

✅ **API Resources for responses**
- Consistent format across all endpoints
- FE expects: `{ "data": {...}, "meta": {...} }`
- No breaking changes if contract maintained

✅ **Feature Tests Priority**
- PHPUnit feature tests cover user workflows
- Test both happy path and error cases
- Manual FE testing before each phase

✅ **All-at-once Refactoring**
- Systematic across all domains
- One feature at a time from simpler to complex
- Order: Articles → Tickets → Comments → TimeEntries → Invoices → Projects

---

## What Stays the Same (No Breaking Changes)

✅ Frontend doesn't need changes (API contract preserved)
✅ Database schema unchanged
✅ Model relationships unchanged
✅ User experience unchanged
✅ Feature functionality unchanged

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Review current services
- [ ] Create API Resources for all models
- [ ] Standardize service methods

### Phase 2: Controllers
- [ ] Create middleware classes
- [ ] Register middleware in bootstrap/app.php
- [ ] Create Form Requests
- [ ] Refactor controllers

### Phase 3: Authorization
- [ ] Create policies
- [ ] Add authorization checks
- [ ] Test with feature tests

### Phase 4: Testing
- [ ] Write comprehensive feature tests
- [ ] All tests pass: `php artisan test`
- [ ] Code style: `vendor/bin/pint --dirty`

### Phase 5: Frontend Testing
- [ ] Manual test all affected pages
- [ ] Verify API responses received correctly
- [ ] Check form submissions work

---

## Testing Before Push

**Backend**:
```bash
php artisan test                    # All tests pass
vendor/bin/pint --dirty             # Code style OK
php artisan tinker                  # Manual checks if needed
```

**Frontend**:
```bash
# Manual testing in browser
- Load each affected page
- Try create/update/delete operations
- Verify error handling
- Check network responses in DevTools
```

---

## Order of Refactoring

Start with **simplest → most complex** to establish patterns:

1. **Articles** (independent, simpler CRUD)
2. **Helpdesk Tickets** (core feature, used heavily)
3. **Comments** (depends on tickets)
4. **TimeEntries** (medium complexity)
5. **Invoices** (depends on time entries)
6. **Projects** (medium complexity)
7. **Conversations** (specialized, AI-related)

---

## Agent Standards Alignment

✅ **Backend Agent Updated**
- New architecture section explaining middleware approach
- Standardized service pattern
- Controller pattern with authorization
- API Resource pattern
- Form Request pattern

✅ **Frontend Agent Updated**
- Clear API response contract documentation
- Data structure expectations
- Error handling expectations

---

## Success Criteria

**Implementation Complete When**:
1. ✅ All services follow standard CRUD interface
2. ✅ All endpoints return via API Resources
3. ✅ No business logic in controllers
4. ✅ All validation in Form Requests
5. ✅ Authorization via policies + middleware
6. ✅ All PHPUnit tests passing
7. ✅ Code passes pint linter
8. ✅ Manual FE testing complete
9. ✅ No FE breaking changes
10. ✅ Documentation synced with implementation

---

## Next Steps

**To begin refactoring**:

1. Start with Phase 1 (Services & Resources)
   - Review ArticleService as template
   - Create Resources for all return types
   
2. Create test file for first feature
   - tests/Feature/ArticleTest.php
   
3. Refactor Article domain (controller, requests, service)
   - Use as reference implementation
   
4. Test thoroughly
   - `php artisan test`
   - Manual FE testing
   
5. Repeat for next features

---

## Files to Review

### Agent Standards (READ FIRST)
- `.github/agents/backend.agent.md` - Updated architecture
- `.github/agents/frontend.agent.md` - Updated API contract
- `.github/AGENT_ORCHESTRATION.md` - How agents work together

### Implementation Guides (REFERENCE)
- `.github/REFACTOR_ANALYSIS.md` - Current state gaps
- `.github/REFACTOR_IMPLEMENTATION_PLAN.md` - Detailed phase plan

---

## Questions?

Refer to **REFACTOR_IMPLEMENTATION_PLAN.md** for:
- Detailed code examples
- Testing strategies
- Directory structure changes
- Frontend impact analysis
- Middleware configuration

---

**Ready to start Phase 1?** → Begin with reviewing current ArticleService and creating API Resources.
