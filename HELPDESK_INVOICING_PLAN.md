# Helpdesk Invoicing & Payments System

## Overview

This document outlines the design for adding invoicing and payment tracking to the CoreLink Helpdesk system. Invoices are generated based on time tracked against tickets, with configurable hourly rates per project and work category. The system also supports invoicing for other billables (products/services) and integrates with Stripe for online payments.

---

## Design Decisions

The following decisions were made regarding open questions:

| Question | Decision |
|----------|----------|
| Rate History | ✅ **Track history** - Store rate changes over time for accurate billing of past work |
| Partial Invoicing | ✅ **Allow only if specifically requested** - Default is full period invoicing |
| Billing Increments | **15-minute increments with 1-hour minimum** - Round up to nearest 15 min, minimum billable time is 1 hour |
| Time Entry Editing | **Hard lock** - Void invoice if changes needed to time entries |

---

## Core Concepts

### Hourly Rate Categories
Predefined categories of work with different billing rates:
- **Development** - Code changes, bug fixes, feature implementation
- **Data Entry** - Manual data input, imports, migrations
- **SEO** - Search engine optimization work
- **Marketing** - Marketing-related tasks
- **Consulting** - Advisory, meetings, planning
- **Support** - General support, troubleshooting
- **Misc** - Uncategorized work

### Project Hourly Rates
Each project can have different rates per category. For example:
- PantryLink: Development @ $150/hr, Support @ $75/hr
- ChampLink: Development @ $125/hr, Support @ $60/hr

### Time Entry Enhancement
Time entries need to be categorized so they can be billed at the appropriate rate.

### Invoice Generation
Invoices are created from unbilled time entries within a date range, grouped by category, and calculated at the project's hourly rates.

### Other Billables
Beyond time entries, invoices can include:
- **Product/Service Line Items** - Flat fees, software licenses, hosting, etc.
- **Custom Line Items** - Ad-hoc charges as needed
- **Discounts** - Applied at invoice level

### Payment Processing
Multiple payment methods supported:
- **Stripe** - Credit/debit card payments via Laravel Cashier integration
- **COD (Check/Cash on Delivery)** - Recorded manually
- **Cash** - In-person payments recorded manually
- **Bank Transfer** - Manual recording with reference numbers

---

## Database Schema

### 1. `helpdesk_hourly_rate_categories`
Global list of rate categories. **Admins can manage these at the helpdesk/site level.**

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | string(100) | Display name (e.g., "Development") |
| `slug` | string(50) | URL-safe identifier (e.g., "development") |
| `description` | text | Optional description |
| `is_active` | boolean | Whether available for new entries |
| `order` | smallint | Display order |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Seed Data:** development, data-entry, seo, marketing, consulting, support, misc

**Admin Management:** Admins can create, edit, reorder, and deactivate categories through the admin interface.

---

### 2. `helpdesk_project_hourly_rates`
Per-project rates for each category.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `project_id` | bigint FK | Reference to project |
| `category_id` | bigint FK | Reference to rate category |
| `rate` | decimal(10,2) | Hourly rate in dollars |
| `effective_from` | date | When this rate starts |
| `effective_to` | date | When this rate ends (null = current) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Unique constraint:** `(project_id, category_id, effective_from)`

**Note:** Rate history allows tracking changes over time. When calculating invoices, use the rate that was effective on the date the work was performed.

---

### 3. `helpdesk_time_entries` (modification)
Add category reference to existing table.

| Column | Type | Description |
|--------|------|-------------|
| `hourly_rate_category_id` | bigint FK nullable | Work category for billing |
| `is_billable` | boolean | Whether this entry is billable (default: true) |
| `invoice_line_item_id` | bigint FK nullable | Set when invoiced (locks the entry) |
| `billable_minutes` | int nullable | Rounded/adjusted minutes for billing (null = use actual) |

**Billing Increment Logic:**
- Time is rounded up to nearest 15 minutes for billing purposes
- Minimum billable time per entry is 1 hour (60 minutes)
- Original `minutes` field preserved for accurate tracking
- `billable_minutes` stores the adjusted amount used for invoicing

**Payment Tracking on Time Entries:**
Time entries track their payment status through the invoice relationship:
- `invoice_line_item_id` = null → Unbilled
- `invoice_line_item_id` set, invoice status = draft/sent → Invoiced but unpaid
- `invoice_line_item_id` set, invoice status = paid → Paid

This allows reporting on:
- Unbilled hours
- Invoiced but unpaid hours
- Paid hours

---

### 4. `helpdesk_billable_items`
Per-project products, services, and other billable items (not time-based).

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `project_id` | bigint FK | Reference to project |
| `name` | string(100) | Item name |
| `description` | text | Item description |
| `default_rate` | decimal(10,2) | Default price |
| `unit` | string(20) | Unit type: "each", "monthly", "yearly", "flat" |
| `is_active` | boolean | Available for use |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Unique constraint:** `(project_id, name)`

**Examples per project:**
- PantryLink: Monthly Hosting ($50), SSL Renewal ($99), Domain ($15/yr)
- ChampLink: Premium Support Package ($500/mo), Data Migration (flat fee)

---

### 5. `helpdesk_invoices`
Invoice header/summary.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `project_id` | bigint FK | Reference to project |
| `invoice_number` | string(50) | Unique invoice number (e.g., "INV-PL-2026-0001") |
| `status` | string(20) | draft, sent, paid, void, overdue |
| `period_start` | date | Start of billing period |
| `period_end` | date | End of billing period |
| `issue_date` | date | Date invoice was issued |
| `due_date` | date | Payment due date |
| `subtotal` | decimal(12,2) | Total before adjustments |
| `discount_amount` | decimal(12,2) | Discount applied |
| `discount_description` | string | Reason for discount |
| `tax_rate` | decimal(5,2) | Tax percentage (nullable) |
| `tax_amount` | decimal(12,2) | Calculated tax |
| `total` | decimal(12,2) | Final amount due |
| `amount_paid` | decimal(12,2) | Amount received |
| `currency` | string(3) | Currency code (default: USD) |
| `notes` | text | Notes to appear on invoice |
| `internal_notes` | text | Internal notes (not on invoice) |
| `bill_to_name` | string | Client name for invoice |
| `bill_to_email` | string | Client email |
| `bill_to_address` | text | Client address |
| `stripe_invoice_id` | string(100) nullable | Stripe invoice ID if using Stripe |
| `stripe_payment_intent_id` | string(100) nullable | Stripe PaymentIntent ID |
| `stripe_hosted_invoice_url` | string(500) nullable | Stripe-hosted payment URL |
| `created_by` | bigint FK | User who created |
| `sent_at` | timestamp | When invoice was sent |
| `paid_at` | timestamp | When marked as paid |
| `voided_at` | timestamp | When voided |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `deleted_at` | timestamp | Soft delete |

**Unique constraint:** `invoice_number`

---

### 6. `helpdesk_invoice_line_items`
Individual line items on an invoice.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `invoice_id` | bigint FK | Reference to invoice |
| `type` | string(20) | "time", "billable_item", "custom" |
| `category_id` | bigint FK nullable | Rate category (for time-based items) |
| `billable_item_id` | bigint FK nullable | Reference to billable item (for products/services) |
| `description` | string | Line item description |
| `quantity` | decimal(10,2) | Hours or units |
| `unit` | string(20) | "hours", "each", "monthly", "yearly", "flat" |
| `rate` | decimal(10,2) | Rate per unit |
| `amount` | decimal(12,2) | Calculated total (quantity × rate) |
| `sort_order` | smallint | Display order |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### 7. `helpdesk_invoice_payments`
Payment records for invoices.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `invoice_id` | bigint FK | Reference to invoice |
| `amount` | decimal(12,2) | Payment amount |
| `payment_method` | string(50) | stripe, cash, cod, check, bank_transfer, other |
| `stripe_payment_id` | string(100) nullable | Stripe Payment ID |
| `stripe_charge_id` | string(100) nullable | Stripe Charge ID |
| `reference_number` | string(100) | Check #, transaction ID, etc. |
| `payment_date` | date | Date of payment |
| `notes` | text | Payment notes |
| `recorded_by` | bigint FK nullable | User who recorded payment (null for Stripe auto) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### 8. `helpdesk_project_invoice_settings`
Per-project invoice configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `project_id` | bigint FK | Reference to project |
| `invoice_prefix` | string(10) | Prefix for invoice numbers (e.g., "PL") |
| `next_invoice_number` | int | Auto-increment counter |
| `default_payment_terms` | smallint | Days until due (default: 30) |
| `default_tax_rate` | decimal(5,2) | Default tax rate |
| `bill_to_name` | string | Default billing name |
| `bill_to_email` | string | Default billing email |
| `bill_to_address` | text | Default billing address |
| `invoice_footer` | text | Footer text on invoices |
| `stripe_enabled` | boolean | Allow Stripe payments for this project |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## Permissions

### New Permissions to Add

| Permission | Description |
|------------|-------------|
| `invoice.view` | View invoices for project |
| `invoice.create` | Generate new invoices |
| `invoice.edit` | Edit draft invoices |
| `invoice.send` | Send invoices to clients |
| `invoice.void` | Void invoices |
| `invoice.delete` | Delete draft invoices |
| `payment.view` | View payment records |
| `payment.record` | Record payments |
| `rates.view` | View hourly rates |
| `rates.manage` | Create/edit hourly rates |
| `rate-categories.manage` | Create/edit/deactivate global rate categories (Admin only) |
| `billable-items.manage` | Create/edit/deactivate project billable items |

### Permission Matrix

| Role | invoice.view | invoice.create | invoice.edit | invoice.send | invoice.void | payment.record | rates.manage | billable-items |
|------|-------------|----------------|--------------|--------------|--------------|----------------|--------------|----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Project Manager | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Developer | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Support | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Client | Own only | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Invoice Workflow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  DRAFT  │────▶│  SENT   │────▶│  PAID   │     │  VOID   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               ▲               ▲
     │               │               │               │
     └───────────────┴───────────────┴───────────────┘
           (can void from any state except paid)
```

### Status Definitions

| Status | Description | Editable | Time Entries |
|--------|-------------|----------|--------------|
| **Draft** | Being prepared, not sent | Yes | Unlocked |
| **Sent** | Sent to client, awaiting payment | No | Locked |
| **Paid** | Fully paid | No | Locked |
| **Partial** | Partially paid | No | Locked |
| **Overdue** | Past due date, not paid | No | Locked |
| **Void** | Cancelled | No | Unlocked |

### Time Entry Locking

When an invoice moves from **Draft** to **Sent**:
1. All associated time entries are locked (cannot be edited/deleted)
2. `invoice_line_item_id` is set on each time entry

When an invoice is **Voided**:
1. Time entries are unlocked (`invoice_line_item_id` set to null)
2. Time entries become available for future invoices

---

## Real-World Scenarios

### Scenario 1: Client Self-Service (Pay Now)

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT WORKFLOW: Generate & Pay Immediately                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Client logs into helpdesk portal                            │
│  2. Navigates to their project                                  │
│  3. Clicks "Generate Current Billables"                         │
│  4. System finds all unbilled time entries + billable items     │
│  5. Invoice created with status = DRAFT                         │
│  6. Client reviews line items                                   │
│  7. Client clicks "Pay Now"                                     │
│  8. Invoice status → SENT, Stripe payment link generated        │
│  9. Client completes Stripe payment                             │
│ 10. Webhook fires → Invoice status → PAID                       │
│ 11. All time entries marked as paid                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario 2: Client Self-Service (Pay Later)

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT WORKFLOW: Generate, Wait, More Work, Pay Later           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Day 1:                                                         │
│  1. Client generates invoice (10 hours of work)                 │
│  2. Invoice created as DRAFT                                    │
│  3. Client reviews but doesn't pay yet                          │
│                                                                 │
│  Day 5:                                                         │
│  4. More work is done (5 additional hours)                      │
│                                                                 │
│  Day 7:                                                         │
│  5. Client returns, clicks "Generate Current Billables"         │
│  6. System detects existing DRAFT invoice                       │
│  7. Options presented:                                          │
│     a) "Update existing draft" - adds new items to draft        │
│     b) "Create new invoice" - voids old draft, creates new      │
│  8. Client chooses option (a) - draft now has 15 hours          │
│  9. Client clicks "Pay Now"                                     │
│ 10. Proceeds as Scenario 1 from step 8                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario 3: Admin Generates Invoice (Check Payment)

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN WORKFLOW: Generate, Email, Receive Check                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Client calls/emails: "Can you send me an invoice?"          │
│  2. Admin logs in, navigates to project                         │
│  3. Admin clicks "Generate Invoice"                             │
│  4. Selects date range or "all unbilled"                        │
│  5. Reviews/adjusts line items, adds discount if needed         │
│  6. Clicks "Finalize & Download PDF"                            │
│  7. Invoice status → SENT                                       │
│  8. Admin emails PDF to client manually                         │
│                                                                 │
│  Later:                                                         │
│  9. Client mails check                                          │
│ 10. Admin receives check                                        │
│ 11. Admin goes to invoice, clicks "Record Payment"              │
│ 12. Selects method: "Check", enters check #, amount, date       │
│ 13. Invoice status → PAID                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario 4: Admin Sends Invoice with Stripe Link

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN WORKFLOW: Generate, Email with Payment Link               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin generates invoice for project                         │
│  2. Reviews line items                                          │
│  3. Clicks "Send Invoice" (vs manual download)                  │
│  4. System:                                                     │
│     - Creates Stripe invoice                                    │
│     - Generates payment link                                    │
│     - Sends email with PDF + "Pay Online" button                │
│     - Sets status → SENT                                        │
│  5. Client receives email                                       │
│  6. Client clicks "Pay Online"                                  │
│  7. Completes Stripe payment                                    │
│  8. Webhook → Invoice status → PAID                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario 5: Partial Payment

```
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW: Invoice with Multiple Payments                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Invoice total: $5,000                                       │
│  2. Client pays $2,500 via Stripe → status = PARTIAL            │
│  3. Client sends $2,500 check later                             │
│  4. Admin records check payment                                 │
│  5. Total payments = $5,000 → status = PAID                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Draft Invoice Rules

**Only ONE active draft per project:**
- When generating a new invoice, if a DRAFT exists:
  - Option to UPDATE existing draft (add new unbilled items)
  - Option to VOID existing draft and create new
- This prevents confusion from multiple unpaid drafts

**Draft invoices do NOT lock time entries:**
- Time can still be edited while invoice is in DRAFT
- Regenerate invoice to pick up changes
- Lock only occurs when status → SENT

**Draft expiration (optional):**
- Drafts older than X days could auto-void
- Or just notify admin of stale drafts

---

## Invoice Number Format

**Pattern:** `INV-{PREFIX}-{YEAR}-{SEQUENCE}`

**Examples:**
- `INV-PL-2026-0001` (PantryLink invoice #1 in 2026)
- `INV-CL-2026-0015` (ChampLink invoice #15 in 2026)

**Sequence resets:** Per project, per year

---

## API Endpoints

### Rate Categories (Admin only - site/helpdesk level)
```
GET    /api/helpdesk/admin/rate-categories
POST   /api/helpdesk/admin/rate-categories
PATCH  /api/helpdesk/admin/rate-categories/{id}
PATCH  /api/helpdesk/admin/rate-categories/reorder          # Update display order
DELETE /api/helpdesk/admin/rate-categories/{id}
```

### Project Billable Items (per-project products/services)
```
GET    /api/helpdesk/admin/projects/{project}/billable-items
POST   /api/helpdesk/admin/projects/{project}/billable-items
PATCH  /api/helpdesk/admin/projects/{project}/billable-items/{id}
DELETE /api/helpdesk/admin/projects/{project}/billable-items/{id}
```

### Project Hourly Rates
```
GET    /api/helpdesk/admin/projects/{project}/rates
POST   /api/helpdesk/admin/projects/{project}/rates
PATCH  /api/helpdesk/admin/projects/{project}/rates/{id}
DELETE /api/helpdesk/admin/projects/{project}/rates/{id}
GET    /api/helpdesk/admin/projects/{project}/rates/history # Rate change history
```

### Project Invoice Settings
```
GET    /api/helpdesk/admin/projects/{project}/invoice-settings
PATCH  /api/helpdesk/admin/projects/{project}/invoice-settings
```

### Invoices
```
GET    /api/helpdesk/admin/invoices                         # List all invoices
GET    /api/helpdesk/admin/projects/{project}/invoices      # List project invoices
POST   /api/helpdesk/admin/projects/{project}/invoices      # Create invoice
GET    /api/helpdesk/admin/invoices/{invoice}               # Get invoice details
PATCH  /api/helpdesk/admin/invoices/{invoice}               # Update draft invoice
DELETE /api/helpdesk/admin/invoices/{invoice}               # Delete draft invoice
POST   /api/helpdesk/admin/invoices/{invoice}/send          # Mark as sent
POST   /api/helpdesk/admin/invoices/{invoice}/void          # Void invoice
POST   /api/helpdesk/admin/invoices/{invoice}/regenerate    # Regenerate from time entries
GET    /api/helpdesk/admin/invoices/{invoice}/pdf           # Download PDF
POST   /api/helpdesk/admin/invoices/{invoice}/email         # Email to client

# Invoice Line Items (for adding billable items/custom charges)
POST   /api/helpdesk/admin/invoices/{invoice}/line-items    # Add line item
PATCH  /api/helpdesk/admin/invoices/{invoice}/line-items/{item}
DELETE /api/helpdesk/admin/invoices/{invoice}/line-items/{item}
```

### Invoice Preview (before creation)
```
POST   /api/helpdesk/admin/projects/{project}/invoice-preview
       Body: { period_start, period_end }
       Returns: preview of what invoice would contain
```

### Payments
```
GET    /api/helpdesk/admin/invoices/{invoice}/payments
POST   /api/helpdesk/admin/invoices/{invoice}/payments      # Record manual payment (cash/cod/check)
PATCH  /api/helpdesk/admin/invoices/{invoice}/payments/{payment}
DELETE /api/helpdesk/admin/invoices/{invoice}/payments/{payment}
```

### Stripe Integration
```
POST   /api/helpdesk/admin/invoices/{invoice}/stripe/create # Create Stripe invoice
POST   /api/helpdesk/admin/invoices/{invoice}/stripe/sync   # Sync status from Stripe
POST   /api/helpdesk/webhook/stripe                         # Stripe webhook handler
```

### User/Client-Facing Endpoints (Self-Service)
```
# Viewing
GET    /api/helpdesk/user/invoices                          # My invoices (all statuses)
GET    /api/helpdesk/user/invoices/{invoice}                # View invoice details
GET    /api/helpdesk/user/invoices/{invoice}/pdf            # Download PDF

# Self-Service Invoice Generation
GET    /api/helpdesk/user/projects/{project}/billable-summary  # Preview unbilled items
POST   /api/helpdesk/user/projects/{project}/invoices          # Generate invoice from unbilled
PATCH  /api/helpdesk/user/invoices/{invoice}/add-unbilled      # Add new unbilled items to draft

# Payment
GET    /api/helpdesk/user/invoices/{invoice}/pay            # Get Stripe payment URL
POST   /api/helpdesk/user/invoices/{invoice}/pay            # Initiate payment (creates Stripe session)
```

**Client Permissions:**
- Can only view/generate invoices for projects they belong to
- Can only pay their own invoices
- Cannot edit line items, apply discounts, or void invoices
- Cannot see internal notes

---

## Invoice Creation Flow

### 1. Select Date Range
User picks a billing period (e.g., January 1-31, 2026)

### 2. Preview
System calculates:
- Fetch all billable, uninvoiced time entries in date range
- Group by hourly rate category
- Look up applicable rate for each entry (based on date worked)
- Calculate totals with 15-minute rounding and 1-hour minimum

### 3. Review & Adjust (Admin only)
Admin can:
- Add billable items (products, services, hosting, etc.)
- Add custom line items (flat fees, one-off charges)
- Apply discount
- Edit descriptions
- Remove entries (marks as non-billable)
- Adjust billing details

### 4. Create Draft
System creates invoice with:
- Calculated line items
- Links time entries to line items
- Status = "draft"

### 5. Finalize & Send
Admin reviews PDF preview, then either:

**Option A: Download & Manual Send**
- Downloads PDF
- Emails to client manually
- Status → "sent"
- Awaits check/cash payment

**Option B: Send with Payment Link**
- Creates Stripe invoice
- Emails PDF + payment link to client
- Status → "sent"
- Client pays online

---

## Client Self-Service Flow

### 1. View Billable Summary
Client navigates to project and sees:
- Count of unbilled hours
- Count of unbilled items
- Estimated total
- "Generate Invoice" button

### 2. Generate Invoice
Client clicks "Generate Invoice":
- System checks for existing DRAFT invoice
- If exists: prompt to update or replace
- If none: create new draft

### 3. Review Invoice
Client sees:
- All line items (read-only)
- Subtotal, tax, total
- Cannot edit or apply discounts
- "Pay Now" button

### 4. Pay
Client clicks "Pay Now":
- Invoice status → "sent" (locks time entries)
- Redirects to Stripe checkout
- On success: status → "paid"
- On cancel: returns to invoice (still "sent")

### 5. Return Later (Optional)
If client doesn't pay immediately:
- Invoice remains in "sent" status
- Can return and pay anytime via "Pay Now"
- If more work done, client can request admin generate new invoice

---

## Billing Increment Logic

**Rules:**
1. **15-minute increments** - All time is rounded UP to the nearest 15 minutes
2. **1-hour minimum** - Any entry less than 60 minutes is billed as 60 minutes

**Examples:**
| Actual Time | Billable Time | Explanation |
|-------------|---------------|-------------|
| 5 minutes | 60 minutes | Minimum 1 hour |
| 45 minutes | 60 minutes | Minimum 1 hour |
| 62 minutes | 75 minutes | Rounds up to 1h 15m |
| 90 minutes | 90 minutes | Already at 15-min boundary |
| 92 minutes | 105 minutes | Rounds up to 1h 45m |

**Implementation:**
```php
public function calculateBillableMinutes(int $actualMinutes): int
{
    // Apply 1-hour minimum
    $minutes = max($actualMinutes, 60);
    
    // Round up to nearest 15 minutes
    return (int) ceil($minutes / 15) * 15;
}
```

---

## Time Entry Modifications

### Updated Time Entry Form Fields
When logging time, users will now see:
- **Time Spent** (existing)
- **Description** (existing)
- **Date Worked** (existing)
- **Category** (NEW - dropdown of rate categories)
- **Billable** (NEW - checkbox, default: true)

### Default Category
- Could be set per project
- Could be inferred from ticket type (bug → development)
- Could default to "misc" if not specified

### Migration Consideration
Existing time entries without category:
- Option A: Set all to "misc" 
- Option B: Set all to "development" (most common)
- Option C: Leave null, require manual categorization before invoicing

**Recommendation:** Option A (misc) - safest, can be recategorized

---

## Reports

### Available Reports

1. **Unbilled Time Report**
   - Time entries not yet invoiced
   - Grouped by project, category
   - Shows potential revenue

2. **Invoice Aging Report**
   - Outstanding invoices by age
   - 0-30, 31-60, 61-90, 90+ days

3. **Revenue by Project**
   - Total invoiced, paid, outstanding
   - Date range filter

4. **Revenue by Category**
   - Which types of work generate most revenue
   - Date range filter

5. **Time vs Billed Analysis**
   - Compare time logged vs time billed
   - Identify non-billable work trends

6. **Payment Report**
   - Payments by method (Stripe, Cash, COD, Check)
   - Date range filter

7. **Hours Payment Status Report**
   - Unbilled hours (time entries not on any invoice)
   - Invoiced but unpaid hours (on sent invoices)
   - Paid hours (on paid invoices)
   - Group by project, category, date range

---

## Future Considerations

### Phase 2+ Enhancements

1. **Recurring Invoices**
   - Monthly retainer invoices
   - Auto-generate on schedule

2. **Multi-Currency**
   - Store rates in multiple currencies
   - Currency conversion

3. **Estimates/Quotes**
   - Create estimates before work
   - Convert estimate to invoice

4. **Credit Notes**
   - Issue credits against invoices
   - Handle refunds via Stripe

### Not In Scope (for now)
- Subscription billing (use Stripe directly if needed)
- Complex tax rules (VAT, multi-jurisdiction)
- Purchase orders
- Vendor payments

---

## Implementation Order

### Phase 1: Foundation
1. ✅ Install Laravel Cashier (`composer require laravel/cashier`)
2. ✅ Create migrations for all tables
3. ✅ Create models with relationships
4. ✅ Seed rate categories
5. ✅ Add `hourly_rate_category_id` to time entries
6. ☐ Update time entry UI/API to include category

### Phase 2: Admin Configuration
7. ✅ Rate categories CRUD (admin management)
8. ✅ Billable items CRUD (products/services)
9. ✅ Project hourly rates CRUD (with history)
10. ✅ Project invoice settings
11. ☐ Add invoice permissions to role system

### Phase 3: Invoice Core
12. ✅ Invoice creation (with preview)
13. ✅ Invoice CRUD operations
14. ✅ Add billable items/custom line items to invoices
15. ✅ Invoice status workflow
16. ✅ Time entry locking logic
17. ✅ Billing increment calculation (15 min / 1 hr min)

### Phase 4: Delivery
18. ✅ PDF generation (DomPDF)
19. ✅ Email integration
20. ✅ Client-facing invoice view (public routes with signed URLs)

### Phase 5: Payments
21. ✅ Manual payment recording (Cash, COD, Check, Bank Transfer)
22. ✅ Stripe integration setup (config, StripePaymentService)
23. ✅ Create Stripe checkout session from helpdesk invoice
24. ✅ Stripe webhook handler for payment events
25. ✅ Invoice status updates from payments (via model observer)
26. ✅ Payment history (displayed in public invoice view)

### Phase 6: Polish
27. ☐ Reports and dashboards
28. ☐ Bulk operations
29. ☐ Overdue notifications

---

## Decisions Made

These questions have been answered and the decisions are incorporated into this plan:

| Question | Decision |
|----------|----------|
| Rate History | ✅ Track history for accurate billing of past work |
| Partial Invoicing | ✅ Allow only if specifically requested (default: full period) |
| Billing Increments | ✅ 15-minute increments with 1-hour minimum |
| Time Entry Editing | ✅ Hard lock after invoicing - void invoice if changes needed |
| Default Tax | Per-project setting, default to 0% (no tax) |
| PDF Approach | DomPDF initially (no server dependencies), Browsershot requires headless Chrome |

---

## Technical Notes

### PDF Generation
Options:
- **DomPDF** (pure PHP, simpler, no server dependencies) ✅ **Recommended Start**
- **Browsershot** (uses Chrome, better rendering - requires headless Chrome on server)
- **Spatie Laravel PDF** (wrapper around DomPDF/Browsershot)

**Decision:** Start with DomPDF. Browsershot upgrade possible later but requires headless Chrome installation on production server.

### Stripe / Laravel Cashier Integration

**Installation:**
```bash
composer require laravel/cashier
php artisan vendor:publish --tag="cashier-migrations"
php artisan migrate
```

**Config (config/services.php):**
```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],
],
```

**Webhook Setup:**
- Create webhook endpoint in Stripe Dashboard pointing to `/api/helpdesk/webhook/stripe`
- Listen for: `invoice.paid`, `invoice.payment_failed`, `payment_intent.succeeded`
- Store webhook secret in `.env`

**Payment Flow:**
1. Create invoice in Corelink (Draft)
2. Admin sends invoice → Optionally create Stripe Invoice
3. Client receives email with Stripe-hosted payment URL
4. Client pays via Stripe
5. Webhook fires → Corelink records payment automatically
6. Invoice marked as Paid

**Manual Payments (Cash/COD/Check):**
- Admin records payment manually through admin interface
- No Stripe involvement for these payment types

### Email
Use Laravel's built-in mail system with:
- Queued sending
- Attachment (PDF)
- HTML template with invoice summary
- Include Stripe payment link when applicable

### Money Handling
- Store as integers (cents) or decimal with 2 places
- Use `decimal(12,2)` for flexibility
- Consider using `brick/money` package for calculations

---

## Appendix: Example Invoice

```
┌────────────────────────────────────────────────────────────────┐
│                         INVOICE                                │
│                                                                │
│  CoreLink Development                    Invoice: INV-PL-2026-0001
│  123 Main Street                         Date: January 31, 2026
│  Kansas City, MO 64111                   Due: February 28, 2026
│                                                                │
│  Bill To:                                                      │
│  Food Bank of Kansas City                                      │
│  456 Oak Avenue                                                │
│  Kansas City, MO 64112                                         │
│  billing@foodbankkc.org                                        │
├────────────────────────────────────────────────────────────────┤
│  Description                    Qty      Rate         Amount   │
├────────────────────────────────────────────────────────────────┤
│  Development                                                   │
│  - PANT-0042: Fix inventory     2.5 hrs  $150.00     $375.00  │
│  - PANT-0045: Add export        4.0 hrs  $150.00     $600.00  │
│  - PANT-0047: Bug fixes         1.5 hrs  $150.00     $225.00  │
│                                                                │
│  Support                                                       │
│  - PANT-0043: User training     2.0 hrs   $75.00     $150.00  │
│  - PANT-0046: Data migration    3.0 hrs   $75.00     $225.00  │
│                                                                │
│  Products & Services                                           │
│  - SSL Certificate Renewal      1 each    $99.00      $99.00  │
│  - Monthly Hosting (Feb 2026)   1 month   $50.00      $50.00  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                          Subtotal:  $1,724.00  │
│                                          Discount:    -$74.00  │
│                                          Tax (0%):      $0.00  │
│                                          ─────────────────────  │
│                                          TOTAL:     $1,650.00  │
├────────────────────────────────────────────────────────────────┤
│  Notes:                                                        │
│  Thank you for your business! Payment due within 30 days.      │
│                                                                │
│  Payment Methods:                                              │
│  - Pay online: https://invoice.stripe.com/i/xxxxx              │
│  - Check payable to "CoreLink Development"                     │
│  - Cash or payment on delivery accepted                        │
│  - Bank Transfer: Routing 123456789, Account 987654321         │
└────────────────────────────────────────────────────────────────┘
```

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-20 | 1.0 | System | Initial planning document |
| 2026-01-20 | 1.1 | System | Added: rate history tracking, 15-min increments with 1-hr minimum, Stripe/Cashier integration, billable items for products/services, payment methods (Stripe/Cash/COD), admin rate category management |
| 2026-01-20 | 1.2 | System | Added: billable items per-project, time entry payment status tracking, client self-service invoice generation, real-world workflow scenarios (client pay now, pay later, admin check payment, partial payments), draft invoice rules, user-facing API endpoints |
