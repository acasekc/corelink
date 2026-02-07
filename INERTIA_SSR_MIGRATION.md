# Inertia + SSR Migration Plan

## Overview
Convert **public-facing pages only** to use Inertia.js with Server-Side Rendering (SSR) for improved SEO, faster initial page loads, and proper meta tag rendering. Admin and helpdesk routes remain as a React Router SPA — unchanged.

## Architecture: Hybrid Inertia + SPA

| Concern | Public Pages | Admin / Helpdesk |
|---------|-------------|-----------------|
| **Framework** | Inertia.js + React | React Router DOM (SPA) |
| **SSR** | ✅ Yes (Node.js) | ❌ No |
| **Blade Template** | `inertia.blade.php` | `app.blade.php` (unchanged) |
| **JS Entry** | `inertia-app.jsx` | `main.jsx` (unchanged) |
| **Routing** | Laravel controllers → `Inertia::render()` | Client-side React Router |
| **Data Fetching** | Server-side via Inertia props | Client-side fetch to `/api/*` |

---

## Public Pages to Convert

| Route | Component | Data Source | Complexity |
|-------|-----------|-------------|------------|
| `/` | `Index` | Static | Simple |
| `/about` | `About` | Static | Simple |
| `/projects` | `Projects` | `/api/projects` → Inertia props | Medium |
| `/process` | `Process` | Static | Simple |
| `/contact` | `Contact` | Form POST | Medium |
| `/case-studies` | `CaseStudies` | `/api/case-studies` → Inertia props | Medium |
| `/case-studies/:slug` | `CaseStudyDetail` | `/api/case-studies/:slug` → Inertia props | Medium |
| `/terms` | `Terms` | Static | Simple |
| `/privacy` | `Privacy` | Static | Simple |
| `/blog` | `Blog/Index` | `/api/blog/` → Inertia props | Medium |
| `/blog/category/:slug` | `Blog/Category` | `/api/blog/category/:slug` → Inertia props | Medium |
| `/blog/:slug` | `Blog/Show` | `/api/blog/article/:slug` → Inertia props | Medium |
| `/discovery` | `Discovery/Chat` | WebSocket + API | Complex |
| `/discovery/:id/summary` | `Discovery/Summary` | `/api/discovery/:id/summary` → Inertia props | Medium |

---

## Implementation Checklist

### Phase 1: Infrastructure Setup

- [x] **1.1** Create this tracking document
- [x] **1.2** Install `inertiajs/inertia-laravel` via Composer
- [x] **1.3** Install `@inertiajs/react` via npm
- [x] **1.4** Publish `HandleInertiaRequests` middleware (`php artisan inertia:middleware`)
- [x] **1.5** Configure middleware in `bootstrap/app.php` (append to `web` group)
- [x] **1.6** Create `resources/views/inertia.blade.php` (Inertia root template with OG meta, schema.org, GTM, fonts)

### Phase 2: Frontend Entry Points

- [x] **2.1** Create `resources/js/inertia-app.jsx` (client-side Inertia entry with code splitting)
- [x] **2.2** Create `resources/js/ssr.jsx` (SSR entry with eager loading)
- [x] **2.3** Update `vite.config.js` (add Inertia input + SSR entry)
- [x] **2.4** Update `package.json` build script (`vite build && vite build --ssr`)

### Phase 3: Convert Shared Components

- [x] **3.1** Create `resources/js/Layouts/InertiaPublicLayout.jsx` (uses Inertia's `Head`, `Link`, `usePage`)
- [x] **3.2** Create `resources/js/components/InertiaHeader.jsx` (uses Inertia `Link`)
- [x] **3.3** Create `resources/js/components/InertiaFooter.jsx` (uses Inertia `Link`)

### Phase 4: Convert Controllers

- [x] **4.1** Update `PageController` — public methods return `Inertia::render()`
- [x] **4.2** Update `BlogController` — view methods (`index`, `category`, `show`) return `Inertia::render()` with data props
- [x] **4.3** Update `DiscoveryController` — `chat()` and `summary()` return `Inertia::render()` with data props
- [x] **4.4** Update `ContactController` — handle Inertia form submissions
- [x] **4.5** Update `routes/web.php` — ensure public routes hit updated controllers

### Phase 5: Convert Page Components

- [x] **5.1** Static pages (`Index`, `About`, `Process`, `Terms`, `Privacy`) — wrap with `InertiaPublicLayout`, add `<Head>`, remove React Router imports
- [x] **5.2** `Projects` — receive `projects` as Inertia prop, remove client-side fetch
- [x] **5.3** `CaseStudies` — receive `caseStudies` as Inertia prop, remove client-side fetch
- [x] **5.4** `CaseStudyDetail` — receive `caseStudy` as Inertia prop, remove client-side fetch
- [x] **5.5** `Contact` — converted form to use Inertia's `useForm()` with flash messages
- [x] **5.6** `Blog/Index` — receive `articles`, `categories`, `featuredArticles` as props
- [x] **5.7** `Blog/Category` — receive `category`, `articles`, `categories` as props
- [x] **5.8** `Blog/Show` — receive `article`, `recentArticles`, `relatedArticles`, `categories` as props
- [x] **5.9** `Discovery/Chat` — receive initial data as props, keep WebSocket logic
- [x] **5.10** `Discovery/Summary` — receive `summary` data as props

### Phase 6: Cleanup React Router SPA

- [x] **6.1** Remove public routes from `resources/js/app.jsx` (keep only admin + helpdesk)
- [x] **6.2** Remove unused public page imports from SPA entry
- [ ] **6.3** Verify admin/helpdesk SPA still works correctly (manual test needed)

### Phase 7: Build & Test

- [x] **7.1** Run `npm run build` — verify both client bundles build ✅
- [x] **7.2** Run `vite build --ssr` — verify SSR bundle builds ✅
- [ ] **7.3** Test all public pages render correctly with SSR (needs running SSR server)
- [ ] **7.4** Test OG meta tags in page source (view-source:)
- [ ] **7.5** Test admin panel still works (React Router SPA)
- [ ] **7.6** Test helpdesk portal still works (React Router SPA)
- [x] **7.7** Run `php artisan test` — all 150 tests pass ✅
- [ ] **7.8** Test with JavaScript disabled (SSR should render content)

### Phase 8: Server Configuration

- [x] **8.1** Document Node.js requirement for SSR
- [x] **8.2** Create Supervisor config for `php artisan inertia:start-ssr` (`supervisor/inertia-ssr.conf`)
- [x] **8.3** Update deploy script to build SSR bundle and restart SSR server
- [x] **8.4** Document SSR server management commands

---

## Server Configuration (Production)

### Prerequisites
- Node.js 18+ installed on the server
- Supervisor or systemd for process management

### SSR Process (Supervisor)

```ini
[program:inertia-ssr]
command=php artisan inertia:start-ssr
directory=/path/to/corelink
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/inertia-ssr.log
```

### Deploy Script Additions

```bash
# Build frontend assets (client + SSR)
npm run build

# Restart SSR server
php artisan inertia:stop-ssr
php artisan inertia:start-ssr &
```

### SSR Management Commands

```bash
php artisan inertia:start-ssr   # Start SSR server
php artisan inertia:stop-ssr    # Stop SSR server
php artisan inertia:check-ssr   # Check if SSR is running
```

---

## Key Decisions

1. **Hybrid architecture** — Two separate JS entry points keeps admin/helpdesk untouched
2. **Separate Blade templates** — `inertia.blade.php` for Inertia, `app.blade.php` for SPA
3. **Separate components** — `InertiaHeader`/`InertiaFooter`/`InertiaPublicLayout` to avoid touching SPA components
4. **API endpoints preserved** — Keep existing `/api/*` endpoints for admin/helpdesk SPA, add Inertia props for public pages
5. **Code splitting** — Client-side Inertia entry uses lazy loading; SSR entry uses eager loading for public pages only
