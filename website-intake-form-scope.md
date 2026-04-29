# Client Intake Form — Scope

A tracked, code-gated intake form for prospective web-development clients at CoreLink. Each prospect receives a unique URL of the form `/intake/{code}`. Without a valid code, the route 404s. On submission, the data is stored in the `client_intakes` table and a formatted ticket is posted to the dedicated **Prospects** helpdesk board for sales follow-up.

---

## Core flow

1. **Admin creates an invite** in `/admin/intake` with the prospect's name, email, and business name. A unique URL is generated. Optionally an email with the link is sent immediately via Mailjet.
2. **Prospect opens the link.** First open stamps `opened_at`, UA, and IP on the invite. The form is pre-filled with whatever the admin provided.
3. **Prospect fills the form** across multiple steps. Progress autosaves to the server every step (and to localStorage as a backup) so a refresh or coming back later resumes where they left off.
4. **Prospect submits.** The intake row is written, a PDF is rendered, a helpdesk ticket is posted to the Prospects board (with the PDF attached), the prospect receives a confirmation email, and the invite is marked `submitted` and de-activated.
5. **Admin reviews** the submission in `/admin/intake/{id}`. If they want to onboard the prospect, one click runs **Convert to Project**, which creates a `helpdesk_projects` row pre-filled from the intake data.

---

## Routes

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/intake/{code}` | Render form. 404 if code missing/invalid/expired/revoked/already-submitted. Stamps `opened_at` on first hit. |
| `POST` | `/intake/{code}/draft` | Autosave draft (throttled). |
| `POST` | `/intake/{code}` | Submit. Throttled, honeypot-protected. |
| `GET` | `/intake/{code}/submitted` | Confirmation page. |
| `GET` | `/admin/intake` | List invites + submissions. |
| `POST` | `/admin/intake/invites` | Create invite (admin form). |
| `POST` | `/admin/intake/invites/{id}/resend` | Resend invite email. |
| `POST` | `/admin/intake/invites/{id}/revoke` | Revoke invite. |
| `GET` | `/admin/intake/submissions/{id}` | View submission. |
| `GET` | `/admin/intake/submissions/{id}/pdf` | Download submission PDF. |
| `POST` | `/admin/intake/submissions/{id}/convert` | Convert intake → helpdesk project. |

---

## Form sections and fields

Required fields are flagged "Y" — note that some required fields from the original brief have been adjusted (see **Required-field policy** below).

### 1. Business Information

| Field | Type | Required |
|---|---|---|
| Business / organization name | Text | Y |
| Industry / niche | Text | Y |
| Primary contact name | Text | Y |
| Email | Email | Y |
| Phone | Phone | N |
| Website URL (if existing) | URL | N |
| How did you hear about us? | Select / Text | N |

### 2. Project Overview

| Field | Type | Required |
|---|---|---|
| Top 3 goals for this website | Multi-select (lead-gen, sell, credibility, info, bookings, other) | Y |
| Describe your business in 2–3 sentences | Textarea | Y |
| Target audience | Textarea | Y |
| Main competitors (URLs if possible) | Textarea | N |

### 3. Scope & Features

| Field | Type | Required |
|---|---|---|
| Estimated number of pages or sections | Select | Y |
| Required features | Multi-select checklist (see below) | Y |
| Other features (specify) | Text — only when "Other" checked | Conditional |
| Third-party integrations (CRM, POS, email marketing, accounting, etc.) | Textarea | N |
| Need a CMS to make your own updates? | Yes / No / Not sure | Y |

**Feature checklist:** Contact form · Blog/news · E-commerce · Booking/scheduling · User login/member area · Live chat · Newsletter · Social integration · Search · Multi-language · Other.

### 4. Content & Branding

| Field | Type | Required |
|---|---|---|
| Existing logo | File upload (PNG/SVG/JPG/PDF) | N |
| Brand guidelines exist? | Yes / No | Y |
| Brand-guidelines upload | File upload (PNG/SVG/JPG/PDF) — only when "Yes" | Conditional |
| Written content responsibility | Select (I'll provide / I need copywriting / Mix) | Y |
| Photos & video responsibility | Select (I'll provide / Need sourcing help / Mix) | Y |

### 5. Design Direction

| Field | Type | Required |
|---|---|---|
| 2–3 websites you admire and why | Textarea | N |
| Design styles or elements to avoid | Textarea | N |
| Specific colors, moods, aesthetic directions | Textarea | N |

### 6. Technical Details

| Field | Type | Required |
|---|---|---|
| Domain name (if owned) | Text | Y |
| Current hosting provider | Text | N |
| Platform preference | Select (WordPress, Laravel, Shopify, Static/JAMstack, No preference, Other) | N |
| Accessibility / compliance requirements (ADA, HIPAA, etc.) | Textarea | N |
| Expected monthly traffic volume | Text | N |
| SEO priority | Select (Low / Medium / High / Not sure) | N |

### 7. Timeline & Budget

| Field | Type | Required |
|---|---|---|
| Desired launch date | Date | N |
| Tied to a specific event or deadline? | Text | N |
| Budget range | Select (Under $5k / $5k–$10k / $10k–$25k / $25k–$50k / $50k+ / Prefer to discuss) | Y |

### 8. Process & Decision-Making

| Field | Type | Required |
|---|---|---|
| Primary point of contact for this project | Text | Y |
| Final approval authority on design and content | Text | N |
| Number of stakeholders involved in reviews | Number / Select | N |

### 9. Ongoing Needs

| Field | Type | Required |
|---|---|---|
| Interested in ongoing maintenance and support? | Yes / No / Maybe | N |
| Need training on how to update the site? | Yes / No | N |
| Future features or phases already planned | Textarea | N |

### 10. Anything Else

| Field | Type | Required |
|---|---|---|
| Additional notes, context, or questions | Textarea | N |

---

## Required-field policy (adjustments)

Two fields the original brief required have been softened to reduce drop-off:

- **Budget range** — kept required, but added a `Prefer to discuss` option so a prospect who genuinely doesn't know can still proceed.
- **SEO priority** — moved to optional (with a `Not sure` option) since most prospects can't meaningfully assess this up front.

---

## Data model

### `client_intake_invites`

| Column | Type | Notes |
|---|---|---|
| id | bigint pk | |
| code | string, unique, indexed | URL token; auto-generated UUID-ish, ~20 chars |
| prospect_name | string, nullable | pre-fills the form |
| prospect_email | string, nullable | pre-fills the form |
| business_name | string, nullable | pre-fills the form |
| created_by_user_id | fk → users | |
| status | string | `pending`, `opened`, `submitted`, `expired`, `revoked` |
| expires_at | datetime, nullable | default 30 days from creation |
| opened_at | datetime, nullable | first GET |
| last_seen_at | datetime, nullable | last GET / draft save |
| submitted_at | datetime, nullable | |
| draft_data | json, nullable | autosave payload |
| metadata | json, nullable | UA, IP, referer, last-step-reached |
| timestamps + soft deletes | | |

### `client_intakes`

| Column | Type | Notes |
|---|---|---|
| id | bigint pk | |
| invite_id | fk → client_intake_invites | unique (one submission per invite) |
| email | string, indexed | denormalized for searching |
| business_name | string, indexed | denormalized for searching |
| budget_range | string, nullable | denormalized for searching |
| data | json | full form payload |
| logo_path | string, nullable | upload path on default disk |
| brand_guidelines_path | string, nullable | upload path on default disk |
| pdf_path | string, nullable | rendered submission PDF |
| helpdesk_ticket_id | unsigned int, nullable | |
| helpdesk_ticket_number | string, nullable | |
| converted_project_id | fk → helpdesk_projects, nullable | populated by Convert action |
| submitted_at | datetime | |
| timestamps | | |

---

## Helpdesk integration

- A single helpdesk project — **Prospects** — receives all intake tickets. Its API key is read from `services.helpdesk.intake_api_key` (env: `HELPDESK_INTAKE_API_KEY`). Falls back to the existing `services.helpdesk.api_key` if the dedicated key isn't configured.
- Ticket `title`: `New website intake — {business_name}`.
- Ticket `content`: a markdown rendering of every answered field, grouped by section.
- Ticket `metadata`: structured JSON of all responses + `intake_id` + admin URL.
- Ticket `priority`: `medium`. Ticket `type`: `task`.
- The rendered PDF is attached to the ticket via the existing multipart `attachments[]` parameter on `POST /tickets`. Prospect-uploaded logo and brand guidelines are also attached.

---

## Convert intake → helpdesk project

Admin action on the submission detail page. Creates a `helpdesk_projects` row with:

- `name` ← business name
- `slug` ← auto from name
- `client_name` ← primary contact
- `client_email` ← submitter email
- `description` ← business description
- `ticket_prefix` ← auto-generated from name

After creation, the submission row is updated with `converted_project_id` and the action button becomes a link to the new project. Already-converted intakes show the link instead of the button.

---

## Cross-cutting behaviors

- **Code gate.** Invalid code → 404 (not 403, not redirect). This includes expired, revoked, and already-submitted codes — once a code is used, the link is dead.
- **Pre-fill.** If the admin entered name/email/business when creating the invite, those fields render filled on first paint.
- **Open tracking.** First GET stamps `opened_at` and writes UA/IP into `metadata`. Subsequent GETs update `last_seen_at`. Useful for sales: see who clicked but didn't finish.
- **Autosave + resume.** Every field-blur triggers a debounced `POST /intake/{code}/draft`. On load, the form rehydrates from `draft_data` (or localStorage if newer).
- **Confirmation emails.** On submit: prospect receives a thank-you email; sales receives the helpdesk ticket (which already triggers the project's existing watcher notifications).
- **Throttle + honeypot.** Submit endpoint rate-limited per IP. A hidden honeypot field; non-empty submissions are silently 422'd.
- **Conditional fields.** Brand-guidelines upload only when "Yes" selected. "Other" text input only when "Other" multi-select option chosen.

---

## Admin analytics (intake list)

The invite list shows per-row: status, sent date, opened date, submitted date, last-step-reached. Header shows aggregates: invites sent, invites opened, completion rate, average time-to-complete.

---

## Implementation Notes

- **Storage.** Uploads go to the default disk (`local` in dev, `s3` in prod), under `intake/{invite_id}/`.
- **Multi-step UX.** One section per step. A summary review step before final submit. Back button preserves data.
- **Validation.** Server-side validation enforces required fields and conditional requirements. Client mirrors it for UX, but server is authoritative.
- **Tests.** Feature tests for: code gate (404 paths), open tracking, draft save, full submission posting a helpdesk ticket, convert-to-project, throttle, honeypot.
