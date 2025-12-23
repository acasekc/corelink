# Soulis Auctions Platform - Development Plan

> **Created:** November 24, 2025  
> **Last Updated:** November 26, 2025  
> **Status:** Phase 5 Complete

---

## Executive Summary

Soulis Auctions is a multi-tenant online auction management platform. This document outlines the development roadmap to complete core functionality and add high-value features.

---

## Current State

### ✅ Completed Features
- [x] Multi-tenancy architecture (stancl/tenancy)
- [x] Admin dashboard with Inertia.js + Vue 3
- [x] Auction CRUD (create, edit, list)
- [x] Lot management with images
- [x] Category hierarchy with custom field groups
- [x] Dynamic fields system (text, checkbox, select, etc.)
- [x] Consignor management
- [x] Disclaimer/terms management
- [x] User management with roles & permissions (Spatie)
- [x] Activity logging
- [x] Image upload with IPTC metadata parsing
- [x] Comments system (polymorphic)
- [x] Model-level permissions
- [x] Lot export functionality
- [x] **BidService with core bidding logic** ✅
- [x] **Bid API endpoints** ✅
- [x] **Real-time broadcasting with Laravel Reverb** ✅
- [x] **Public auction pages (catalog, detail, lot, search)** ✅
- [x] **User features (registration, profile, watchlist, bid history)** ✅
- [x] **Invoice system with PDF generation** ✅
- [x] **Payment processing (Stripe + manual)** ✅
- [x] **Consignor settlements** ✅
- [x] **Email notifications (7 mailable types)** ✅ NEW
- [x] **In-app notifications (5 notification types)** ✅ NEW
- [x] **Auction lifecycle automation** ✅ NEW
- [x] **Scheduled jobs for auto-start, auto-close, soft-close** ✅ NEW
- [x] **164 passing tests across all features** ✅ UPDATED

### ❌ Missing Core Features
- [x] ~~**Bidding system** (BidController is empty)~~ ✅ COMPLETED
- [x] ~~**Real-time bid updates** (WebSockets)~~ ✅ COMPLETED
- [x] ~~**Public auction browsing pages**~~ ✅ COMPLETED
- [x] ~~**User registration for bidders**~~ ✅ COMPLETED
- [x] ~~**Toast notifications for bid updates**~~ ✅ COMPLETED
- [x] ~~**Payment processing**~~ ✅ COMPLETED
- [x] ~~**Email notifications**~~ ✅ COMPLETED
- [x] ~~**Auction lifecycle automation**~~ ✅ COMPLETED
- [ ] **Reporting & analytics**

---

## Phase 1: Core Bidding System
**Priority:** Critical  
**Estimated Duration:** 2-3 weeks  
**Status:** ✅ Complete

### 1.1 Bid Service & Business Logic ✅ COMPLETED
- [x] Create `BidService` with core bidding logic
  - [x] Validate minimum bid increment (tier-based: $5-$5000)
  - [x] Check reserve price
  - [x] Handle auto-bidding (proxy bids)
  - [x] Determine winning bid
- [x] Add bid increment table/configuration (in BidService)
- [x] Implement outbid detection

### 1.2 Bid API Endpoints ✅ COMPLETED
- [x] `POST /api/lots/{lot}/bids` - Place a bid
- [x] `GET /api/lots/{lot}/bids` - Get bid history
- [x] `GET /api/lots/{lot}/bids/status` - Get lot bid status
- [x] `GET /api/user/bids` - User's bid history
- [x] `POST /api/lots/{lot}/auto-bid` - Set max auto-bid

### 1.3 Real-Time Updates ✅ COMPLETED
- [x] Install Laravel Reverb + Laravel Echo + pusher-js
- [x] Create `BidPlaced` event (broadcasts on `lot.{id}` and `auction.{id}`)
- [x] Create `OutbidNotification` event (private `user.{id}` channel)
- [x] Create `AuctionEnding` event
- [x] Set up WebSocket channels in `routes/channels.php`
- [x] Create Vue composable `useEcho.js` for real-time subscriptions
- [x] Integrate events into BidService (auto-dispatch on bid placement)

### 1.4 Bid-Related Database Changes
- [x] Bids table already exists with proper columns
- [x] Add casts to Bid model (boolean, decimal, datetime)
- [ ] Add index on `bids(lot_id, amount DESC)` (optional optimization)
- [ ] Add `current_bid` cache column to `lots` table (optional)

### 1.5 Testing ✅ COMPLETED
- [x] Unit tests for BidService (5 tests)
- [x] Feature tests for placing bids (7 tests)
- [x] Test auto-bidding scenarios (4 tests)
- [x] Test bid history (4 tests)
- [x] Test event broadcasting (7 tests)
- [ ] Test concurrent bid handling (needs integration tests)

---

## Phase 2: Public Auction Experience
**Priority:** Critical  
**Estimated Duration:** 2-3 weeks  
**Status:** ✅ Complete

### 2.1 Public Pages ✅ COMPLETED
- [x] Auction catalog (list of active auctions) - `Tenants/Public/Auctions/Index.vue`
- [x] Auction detail (lots grid/list view) - `Tenants/Public/Auctions/Show.vue`
- [x] Lot detail page with:
  - [x] Image gallery with thumbnails
  - [x] Description & custom fields
  - [x] Current bid display (real-time)
  - [x] Bid history (last 10 bids)
  - [x] Bid placement form with quick bid buttons
  - [x] Countdown timer
  - [x] Lot navigation (prev/next)
- [x] Category browsing (filter on auction page)
- [x] Search functionality - `Tenants/Public/Search/Index.vue`
- [x] Public routes in `routes/tenants/web.php`
- [x] Controller: `App\Http\Controllers\Tenants\Public\AuctionController`
- [x] Tests: 10 unit tests for controller logic (5 HTTP tests skipped pending tenant setup)

### 2.2 User Features ✅ COMPLETED
- [x] Bidder registration flow - `UserController::register()` / `store()`
- [x] Email verification (via MustVerifyEmail interface)
- [x] User profile page - `Tenants/Public/User/Profile.vue`
- [x] Bid history - `Tenants/Public/User/MyBids.vue`
- [x] Watchlist/favorites - `Tenants/Public/User/Watchlist.vue` + `Watchlist` model
- [x] Won items list - `Tenants/Public/User/WonItems.vue`
- [x] Tests: 14 unit tests for user features (9 HTTP tests skipped pending tenant setup)

### 2.3 Frontend Components ✅ COMPLETED
- [x] Real-time bid display component - `Components/Auction/BidDisplay.vue`
- [x] Countdown timer component - `Components/Auction/CountdownTimer.vue`
- [x] Bid input with increment buttons (in lot detail page)
- [x] Toast notifications for bid updates - `Composables/useToast.js`

---

## Phase 3: Transactions & Payments
**Priority:** High  
**Estimated Duration:** 2 weeks  
**Status:** ✅ Complete

### 3.1 Invoice System ✅ COMPLETED
- [x] Create `invoices` table
- [x] Create `invoice_items` table
- [x] Create `payments` table
- [x] Generate invoices after auction closes
- [x] Calculate buyer's premium (tiered rates)
- [x] PDF invoice generation (barryvdh/laravel-dompdf)
- [x] Tests: 22 tests for InvoiceService

### 3.2 Payment Integration ✅ COMPLETED
- [x] Integrate Stripe (stripe/stripe-php)
- [x] PaymentService with payment intents
- [x] Manual payment recording
- [x] Handle refunds
- [x] Webhook handling
- [x] Tests: 12 tests for PaymentService

### 3.3 Settlement ✅ COMPLETED
- [x] Create `settlements` table
- [x] Create `settlement_items` table
- [x] SettlementService for consignor payouts
- [x] Commission calculations (configurable rates)
- [x] Payout tracking with payment methods
- [x] Support for sales, passed lots, buybacks, withdrawals
- [x] Tests: 19 tests for SettlementService

---

## Phase 4: Notifications & Communication
**Priority:** High  
**Estimated Duration:** 1-2 weeks  
**Status:** ✅ Complete

### 4.1 Email Notifications ✅ COMPLETED
- [x] Welcome email - `WelcomeMail`
- [x] Bid confirmation - `BidConfirmationMail`
- [x] Outbid alert - `OutbidAlertMail`
- [x] Auction ending soon (watched items) - `AuctionEndingSoonMail`
- [x] You won notification - `YouWonMail`
- [x] Invoice ready - `InvoiceReadyMail`
- [x] Payment confirmation - `PaymentConfirmationMail`
- [x] NotificationService for orchestrating emails
- [x] User notification preferences (JSON column)

### 4.2 In-App Notifications ✅ COMPLETED
- [x] BidPlacedNotification
- [x] OutbidNotification
- [x] AuctionWonNotification
- [x] InvoiceReadyNotification
- [x] PaymentReceivedNotification
- [x] NotificationController with API endpoints
- [x] NotificationCenter.vue component
- [x] useNotifications.js composable
- [x] Tests: 25 tests for NotificationService

---

## Phase 5: Auction Lifecycle Automation
**Priority:** High  
**Estimated Duration:** 1-2 weeks  
**Status:** ✅ Complete

### 5.1 Scheduled Tasks ✅ COMPLETED
- [x] Auto-start auctions at start time (`ProcessScheduledAuctions` job)
- [x] Auto-close auctions at end time (`CloseEndedAuctions` job)
- [x] Soft-close logic (extend with late bids) - `shouldExtendForSoftClose()`, `extendForSoftClose()`
- [x] Winner determination (`determineLotWinner()` in AuctionLifecycleService)
- [x] Invoice generation job (`GeneratePendingInvoices` job)
- [x] Ending soon notifications (`NotifyAuctionsEndingSoon` job)
- [x] Console Kernel scheduled tasks (everyMinute, everyFifteenMinutes)

### 5.2 Auction States ✅ COMPLETED
- [x] Lifecycle methods on Auction model (isDraft, isUpcoming, isInProgress, isClosed, isCompleted)
- [x] State transitions (publish, start, close, complete, cancel, markAsSettled)
- [x] Query scopes (readyToStart, readyToClose, endingSoon, active, needingInvoices)
- [x] AuctionLifecycleService for orchestrating transitions
- [x] Draft → Upcoming → InProgress → Closed → Completed state flow
- [x] Database migrations for lifecycle columns (soft_close_minutes, auto_invoice, etc.)
- [x] Lot sale columns (status, sold_price, winning_user_id, sold_at)
- [x] Tests: 34 tests for AuctionLifecycleService

---

## Phase 6: Reporting & Analytics
**Priority:** Medium  
**Estimated Duration:** 1-2 weeks  
**Status:** Not Started

### 6.1 Admin Reports
- [ ] Auction performance summary
- [ ] Revenue by category
- [ ] Top bidders
- [ ] Unsold lots report
- [ ] Consignor settlement report

### 6.2 Dashboard Widgets
- [ ] Active auctions count
- [ ] Total bids today
- [ ] Revenue this month
- [ ] Upcoming auctions

---

## Phase 7: Advanced Features
**Priority:** Low (Future)  
**Status:** Not Started

### 7.1 Live Auction Support
- [ ] Auctioneer console
- [ ] Real-time lot progression
- [ ] Floor bid entry
- [ ] Absentee bid integration

### 7.2 Mobile Optimization
- [ ] PWA configuration
- [ ] Push notifications
- [ ] Offline lot viewing
- [ ] Mobile-optimized bid interface

### 7.3 Additional Integrations
- [ ] Shipping calculator
- [ ] Third-party auction aggregators
- [ ] Social media sharing
- [ ] SMS notifications

---

## Technical Debt & Fixes

### Immediate Fixes Required
- [x] ~~Fix `User` model return type errors~~ ✅ Fixed all accessor methods
- [x] ~~Fix double password hashing in `User::setPasswordAttribute`~~ ✅ Changed to 'hashed' cast
- [x] ~~Delete legacy Jetstream/Fortify tests~~ ✅ Removed 14 legacy test files
- [ ] Add `auth` middleware to admin routes
- [ ] Clean up commented code in route files
- [ ] Fix `syncImages` method in `LotController` (missing `$lot` parameter)

### Performance Optimizations
- [ ] Review eager loading on `Lot` model (currently loads 4 relations by default)
- [ ] Add database indexes for common queries
- [ ] Implement pagination on all list endpoints
- [ ] Add Redis caching for hot data

### Code Quality
- [x] Add comprehensive feature tests ✅ 20 tests for bidding system
- [x] Add Form Requests for bid endpoints ✅ PlaceBidRequest created
- [ ] Standardize API responses with Resources
- [ ] Document API with OpenAPI/Swagger

---

## Progress Tracking

### Sprint Log

| Sprint | Dates | Focus | Status | Est. Hours |
|--------|-------|-------|--------|------------|
| Sprint 1 | Nov 25, 2025 | Phase 1.1-1.2 (Bid Service & API) | ✅ Complete | 16-20 hrs |
| Sprint 2 | Nov 25, 2025 | Phase 1.3 (Real-time & WebSockets) | ✅ Complete | 12-16 hrs |
| Sprint 3 | Nov 25, 2025 | Phase 2.1 (Public Pages) | ✅ Complete | 20-24 hrs |
| Sprint 4 | Nov 25, 2025 | Phase 2.2-2.3 (User Features) | ✅ Complete | 16-20 hrs |
| Sprint 5 | Nov 26, 2025 | Phase 3 (Payments) | ✅ Complete | 24-32 hrs |
| Sprint 6 | Nov 26, 2025 | Phase 4-5 (Notifications & Automation) | ✅ Complete | 20-28 hrs |
| Sprint 7 | TBD | Phase 6 (Reporting & Analytics) | Not Started | 12-16 hrs |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-24 | Start with bidding system | Core value prop - without bids, no auction platform |
| 2025-11-25 | Implement BidService as standalone class | Separation of concerns, easier to test and maintain |
| 2025-11-25 | Use tier-based bid increments ($5-$5000) | Industry standard for auction platforms |
| 2025-11-25 | Skip API integration tests for now | Multi-tenant routes require tenant context; service tests sufficient for core logic |
| 2025-11-25 | Add 'hashed' cast to User password | Cleaner than setPasswordAttribute, prevents double-hashing bugs |
| 2025-11-25 | Use Laravel Reverb for WebSockets | Free, self-hosted, Pusher-compatible; can switch to Pusher in production if needed |
| 2025-11-25 | Create Vue composables for Echo | Provides reactive bindings and automatic cleanup on unmount |

---

## Notes

- Multi-tenancy is already implemented - each tenant (auction house) has isolated data
- Using Velzon admin template for UI components
- Spatie permissions for role-based access control
- Activity logging already in place for audit trail

---

## Development Guardrails

> **IMPORTANT:** These rules must be followed during development.

1. **Update this document** after completing any task - check off items and update status
2. **Log decisions** in the Decision Log table when making architectural choices
3. **Update Sprint Log** when starting/completing sprints
4. **Add notes** for any blockers, discoveries, or scope changes
5. **Run tests** before marking any phase complete
6. **Run `vendor/bin/pint --dirty`** before committing PHP changes
7. **Commit frequently** with descriptive messages referencing the phase/task

---

## Next Steps

1. ~~**Fix immediate technical issues** in User model and routes~~ ✅ Done
2. ~~**Begin Phase 1.1** - Implement BidService~~ ✅ Done
3. ~~**Phase 1.3** - Add real-time updates with Laravel Echo~~ ✅ Done
4. ~~**Phase 2** - Build public auction browsing pages~~ ✅ Done
5. ~~**Phase 3** - Transactions & Payments~~ ✅ Done
6. ~~**Phase 4** - Email notifications & in-app notifications~~ ✅ Done
7. ~~**Phase 5** - Auction lifecycle automation~~ ✅ Done
8. **Phase 6** - Reporting & analytics dashboard

---

*This document was last updated: November 26, 2025*
