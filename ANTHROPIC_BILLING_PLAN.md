# Anthropic API Billing Integration — Implementation Plan

**Ticket:** CORE-0027  
**Status:** All Phases Complete  
**Last Updated:** 2025-07-10

## Decisions Made

| Question | Decision |
|----------|----------|
| Pricing model | Configurable markup percentage per project |
| Billing cycle | Configurable per project (`cycle_start_day` 1–28) |
| Key management | Manual entry by admin (no programmatic Anthropic API key management) |
| Invoice system | Plug into existing helpdesk invoicing (Invoice, InvoiceLineItem models) |
| Admin UI | New card section on existing ProjectDetail.jsx page |

## Deviations from Original Ticket

- **No KeyManagementService** — Anthropic has no public API for programmatic key management. Admin manually enters/rotates keys.
- **No new invoicing infrastructure** — The existing helpdesk Invoice/InvoiceLineItem/InvoicePayment system with Stripe + PDF support is used directly.
- **Enum columns** → PHP-backed string enums per project convention (not DB ENUM types).
- **Project FK** → `helpdesk_projects.id` (not a generic `projects` table).

---

## Phase 1: Data Model & Key Management

**Goal:** Migrations, enums, models, basic CRUD controller, and admin UI section.

### Enums

- [x] `app/Enums/Helpdesk/OverageMode.php` — `Silent`, `Proactive`
- [x] `app/Enums/Helpdesk/ApiKeyStatus.php` — `Active`, `Grace`, `Disabled`, `Suspended`

### Migrations

- [x] `create_helpdesk_anthropic_api_configs_table`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `project_id` | bigint FK → `helpdesk_projects` | cascadeOnDelete, unique |
| `api_key_name` | varchar | Human-readable label |
| `api_key_encrypted` | text | Encrypted API key |
| `plan_tier` | varchar(32) | Starter, Growth, Pro, Custom |
| `included_allowance` | decimal(10,2) | $ included per cycle |
| `grace_threshold` | decimal(10,2) | $ max before hard disable |
| `markup_percentage` | decimal(5,2) default 0 | % markup on Anthropic cost |
| `overage_mode` | varchar(32) | Cast to OverageMode enum |
| `notification_emails` | json nullable | Emails for proactive notifications |
| `key_status` | varchar(32) default 'active' | Cast to ApiKeyStatus enum |
| `cycle_start_day` | tinyint unsigned | 1–28 |
| `cycle_usage_cents` | integer unsigned default 0 | Running total this cycle |
| `last_synced_at` | timestamp nullable | |
| `disabled_reason` | varchar nullable | |
| `timestamps` | | |

- [x] `create_helpdesk_anthropic_usage_logs_table`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `anthropic_config_id` | bigint FK → `helpdesk_anthropic_api_configs` | cascadeOnDelete |
| `synced_at` | timestamp | |
| `period_start` | date | |
| `period_end` | date | |
| `tokens_input` | bigint unsigned | |
| `tokens_output` | bigint unsigned | |
| `cost_cents` | integer unsigned | |
| `model_breakdown` | json nullable | Per-model cost detail |
| `raw_response` | json nullable | Full API response |
| `timestamps` | | |

### Models

- [x] `app/Models/Helpdesk/AnthropicApiConfig.php`
  - BelongsTo `Project`
  - HasMany `AnthropicUsageLog`
  - Casts: `overage_mode` → OverageMode, `key_status` → ApiKeyStatus, `notification_emails` → array, `included_allowance` → decimal:2, `grace_threshold` → decimal:2, `markup_percentage` → decimal:2, `last_synced_at` → datetime
  - Encrypted attribute: `api_key_encrypted`
  - Helper methods: `isActive()`, `isInGrace()`, `isDisabled()`, `cycleUsageDollars()`, `allowanceRemainingCents()`, `isOverAllowance()`, `isOverGraceThreshold()`

- [x] `app/Models/Helpdesk/AnthropicUsageLog.php`
  - BelongsTo `AnthropicApiConfig`
  - Casts: `synced_at` → datetime, `period_start` → date, `period_end` → date, `model_breakdown` → array, `raw_response` → array

### Project Model Update

- [x] Add `anthropicApiConfig()` HasOne relationship to `app/Models/Helpdesk/Project.php`

### Controller

- [x] `app/Http/Controllers/Helpdesk/Admin/AnthropicBillingController.php`
  - `show(Project)` → get config (or null)
  - `store(Request, Project)` → create/update config
  - `usageLogs(Project)` → paginated usage history

### Routes

- [x] Add to `routes/api/helpdesk.php`:
  - `GET projects/{project}/anthropic-config`
  - `POST projects/{project}/anthropic-config`
  - `GET projects/{project}/anthropic-usage-logs`

### Admin UI

- [x] Add "Anthropic API Billing" card section to `resources/js/Pages/Admin/Helpdesk/ProjectDetail.jsx`:
  - API Key (masked input + copy)
  - Plan Tier dropdown
  - Included Allowance $ input
  - Grace Threshold $ input
  - Markup % input
  - Overage Mode toggle (Silent/Proactive)
  - Notification Emails (multi-value, visible in Proactive mode only)
  - Cycle Start Day (1–28)
  - Key Status badge
  - Current Cycle Usage (read-only)
  - Last Synced timestamp

### Tests

- [x] `tests/Feature/Helpdesk/AnthropicBillingConfigTest.php`
  - Create config
  - Update config
  - Validation (grace >= allowance, cycle_start_day 1–28, etc.)
  - Non-admin cannot access
  - Config returned with project

---

## Phase 2: Usage Sync Service & Command

**Goal:** Pull usage data from Anthropic API, store logs, update cycle totals.

### Service

- [x] `app/Services/Helpdesk/AnthropicUsageSyncService.php`
  - `syncAll(): void` — sync all active/grace configs
  - `syncForConfig(AnthropicApiConfig): AnthropicUsageLog` — call Anthropic usage API, calculate cost, update cycle_usage_cents, write log
  - Uses decrypted `api_key_encrypted` for Anthropic API auth
  - Dispatches `UsageSynced` event after each sync

### Event

- [x] `app/Events/Helpdesk/UsageSynced.php`
  - Properties: `AnthropicApiConfig $config`, `AnthropicUsageLog $log`

### Artisan Command

- [x] `app/Console/Commands/AnthropicSyncUsageCommand.php`
  - Signature: `anthropic:sync-usage {--project=}`
  - No option: syncs all active/grace configs
  - With `--project`: syncs single project by ID

### Schedule

- [x] Register in `routes/console.php`: daily at 2:00 AM

### Admin API Addition

- [x] `POST projects/{project}/anthropic-config/sync` → trigger manual sync
  - Add to `AnthropicBillingController`

### Admin UI Addition

- [x] "Sync Now" button on the Anthropic API Billing card
- [x] Usage History expandable table (past sync logs with tokens/cost)

### Tests

- [x] `tests/Feature/Helpdesk/AnthropicUsageSyncTest.php`
  - Sync updates cycle_usage_cents
  - Sync creates usage log entry
  - Only syncs active/grace configs
  - Manual sync via API endpoint
  - Handles Anthropic API errors gracefully

---

## Phase 3: Threshold Monitoring

**Goal:** Evaluate usage thresholds after each sync, update key status, send notifications.

### Service

- [x] `app/Services/Helpdesk/AnthropicThresholdMonitorService.php`
  - `evaluate(AnthropicApiConfig): void`
  - Threshold logic:
    - Below allowance → status stays Active
    - Between allowance & grace → status becomes Grace
      - Silent: log internally
      - Proactive: notify client + admin
    - At/above grace → status becomes Disabled
      - Both modes: notify admin
      - Proactive: notify client

### Listener

- [x] `app/Listeners/Helpdesk/EvaluateUsageThresholds.php`
  - Listens for `UsageSynced`
  - Calls `AnthropicThresholdMonitorService::evaluate()`

### Register Event/Listener

- [x] Register in `app/Providers/AppServiceProvider.php` (L12 style — Event::listen in boot())

### Mailables

- [x] `app/Mail/Helpdesk/AnthropicUsageWarning.php` — client entering grace zone (proactive)
- [x] `app/Mail/Helpdesk/AnthropicUsageLimitReached.php` — key disabled (proactive)
- [x] `app/Mail/Helpdesk/AnthropicUsageAdminAlert.php` — internal admin notification (both modes)

### Blade Views

- [x] `resources/views/emails/helpdesk/anthropic-usage-warning.blade.php`
- [x] `resources/views/emails/helpdesk/anthropic-usage-limit-reached.blade.php`
- [x] `resources/views/emails/helpdesk/anthropic-usage-admin-alert.blade.php`

### Admin API Addition

- [x] `POST projects/{project}/anthropic-config/toggle-key` → manual enable/disable (done in Phase 1)

### Admin UI Addition

- [x] Key Status override buttons (Enable / Disable / Suspend) (done in Phase 1)
- [x] Usage progress bar (spend vs allowance vs grace thresholds) (done in Phase 2)

### Tests

- [x] `tests/Feature/Helpdesk/AnthropicThresholdMonitorTest.php` (23 tests)
  - Below allowance → stays Active
  - Between allowance & grace → Grace status
  - Above grace → Disabled status
  - Silent mode: no client email
  - Proactive mode: client + admin emailed
  - Already disabled not re-disabled
  - Listener integration
  - Full lifecycle test
  - Mailable subject assertions

---

## Phase 4: Invoice Integration

**Goal:** Auto-generate invoice line items from usage data at end of billing cycle.

### Service

- [x] `app/Services/Helpdesk/AnthropicBillingService.php`
  - `generateInvoice(AnthropicApiConfig): ?Invoice` — creates draft invoice with line items
  - `resetCycle(AnthropicApiConfig): void` — zeros usage, restores Active if usage-disabled
  - `isCycleEndDate(AnthropicApiConfig): bool` — checks if today matches cycle_start_day

### Controller & Routes

- [x] `POST projects/{project}/anthropic-config/generate-invoice` — admin API endpoint
- [x] `POST projects/{project}/anthropic-config/reset-cycle` — admin API endpoint

### Artisan Commands

- [x] `app/Console/Commands/AnthropicGenerateInvoicesCommand.php`
  - Signature: `anthropic:generate-invoices {--project=} {--force}`
  - Finds all configs whose cycle ends today, generates draft invoices, resets cycles
  - Scheduled: daily at 03:00

- [x] `app/Console/Commands/AnthropicResetCycleCommand.php`
  - Signature: `anthropic:reset-cycle {--project=}`
  - Manual cycle reset for a specific project

### Schedule

- [x] Register `anthropic:generate-invoices` in `routes/console.php` (daily at 03:00)

### Tests

- [x] `tests/Feature/Helpdesk/AnthropicInvoiceGenerationTest.php` (29 tests)
  - Invoice with included allowance only
  - Invoice with overage line item (markup applied)
  - Invoice total calculated correctly (with and without tax)
  - No invoice for zero usage
  - Correct billing info and period
  - Cycle reset zeros usage, restores usage-disabled but not manual-disabled
  - Cycle end date check
  - API endpoints (generate-invoice, reset-cycle, auth checks)
  - Artisan commands (generate, reset, force, skip non-cycle-end)
  - Full billing cycle workflow test

---

## Phase 5: Notifications & Polish

**Goal:** Weekly digests, additional admin commands, cleanup.

### Weekly Digest

- [x] `app/Console/Commands/AnthropicWeeklyDigestCommand.php`
  - Signature: `anthropic:weekly-digest`
  - Emails CoreLink admin with summary of all projects: usage, status, approaching thresholds
  - Scheduled: weekly on Mondays at 08:00

- [x] `app/Mail/Helpdesk/AnthropicWeeklyDigest.php`
- [x] `resources/views/emails/helpdesk/anthropic-weekly-digest.blade.php`

### Admin Commands

- [x] `app/Console/Commands/AnthropicDisableKeyCommand.php`
  - Signature: `anthropic:disable-key {--project=} {--reason=}`
  - Manually disables a key (e.g., overdue payment)

- [x] `app/Console/Commands/AnthropicEnableKeyCommand.php`
  - Signature: `anthropic:enable-key {--project=}`
  - Re-enables a suspended/disabled key

### Final Polish

- [x] Overdue invoice → Suspended key logic (check during sync if project has overdue invoice)
- [x] Comprehensive error handling audit
- [x] Full test suite run — 117 tests, 303 assertions, all passing
- [x] Run `vendor/bin/pint --dirty`

---

## File Summary

| Category | Count | Files |
|----------|-------|-------|
| Migrations | 2 | `create_helpdesk_anthropic_api_configs`, `create_helpdesk_anthropic_usage_logs` |
| Enums | 2 | `OverageMode`, `ApiKeyStatus` |
| Models | 2 | `AnthropicApiConfig`, `AnthropicUsageLog` |
| Services | 3 | `AnthropicUsageSyncService`, `AnthropicThresholdMonitorService`, `AnthropicBillingService` |
| Commands | 6 | `sync-usage`, `generate-invoices`, `reset-cycle`, `weekly-digest`, `disable-key`, `enable-key` |
| Controller | 1 | `AnthropicBillingController` |
| Event | 1 | `UsageSynced` |
| Listener | 1 | `EvaluateUsageThresholds` |
| Mailables | 4 | `UsageWarning`, `UsageLimitReached`, `UsageAdminAlert`, `WeeklyDigest` |
| Blade Views | 4 | Email templates for each mailable |
| Frontend | 1 | Modified `ProjectDetail.jsx` |
| Tests | 5 | Config (22), Sync (23), Threshold (23), Invoice (29), Notifications/Polish (20) |
| **Total** | **~31** | 117 tests, 303 assertions |
