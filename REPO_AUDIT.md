# Repository Audit & Improvements — CoreLink

**Date:** 2025-12-30
**Author:** GitHub Copilot (audit)

## Summary
A focused audit of the CoreLink repo (Laravel 12, Vue 3 + Inertia, Tailwind, Laravel Reverb for WebSockets) identified several high-impact improvements across security, infra, testing, observability, and DX.

This document contains prioritized recommendations, quick wins, and next steps to increase reliability, security, and developer velocity.

---

## High-Level Findings (concise)
- Production is configured and running (nginx, systemd, Reverb) but some server configs are not tracked in the repo.
- Minimal automated tests exist (default example tests only). No CI pipelines were found.
- Contact form sends mail synchronously and lacked robust spam protections before fix; now success messaging is fixed in the UI.
- GTM was added directly in template (hard-coded ID) — it should be configurable via `env`/`config`.
- No central monitoring or error tracking is configured; Reverb health needs monitoring.

---

## Prioritized Recommendations

### Immediate / High Priority (low effort, high value)
- Make GTM ID configurable via `config/services.php` / `.env` (avoid hard-coded ID in templates).
- Add spam protection and rate-limiting to contact form (throttle middleware, honeypot, or reCAPTCHA).
- Queue outbound email (use Laravel queued mail) to avoid blocking web requests and improve reliability.
- Add a simple healthcheck for Reverb and ensure systemd has sensible restart policies; add a probe or cron-run healthcheck.

### Near Term
- Add CI (GitHub Actions) to run tests, linters, and build assets. Enable Dependabot/renovate for dependency updates.
- Add error monitoring (Sentry) and connect both app and Reverb logs to it.
- Harden cookies & session config for production (secure, httpOnly, sameSite).

### Medium Term
- Create unit & feature tests for critical flows (contact form, invite creation/resend, admin auth, plan generation).
- Add E2E tests (Cypress or Playwright) for discovery flow and public pages.
- Add static analysis (PHPStan/Psalm) and JS linting (ESLint), run in CI.

### Long Term
- Move server config samples (nginx, systemd) into `deploy/` and automate deployments (GitHub Actions or container pipeline).
- Centralize logs (CloudWatch/ELK) and add metrics for Reverb, queues, and job failure rates.
- Use managed secrets (AWS Secrets Manager/Parameter Store) for production credentials.
- Serve static assets via CDN and apply caching headers.

---

## Quick Wins (less than 1 day each)
- Add `GTM` env var and toggle in template.
- Throttle contact endpoint and add basic honeypot.
- Convert synchronous Mail::send to queued mail jobs.
- Add a small healthcheck route for Reverb.
- Add a README section that describes production deployment steps and locations for nginx/systemd configs.

---

## Tests & CI
- Current tests: only Laravel default examples; expand to cover API and UI behavior.
- CI: add `phpunit` + `vite build` and basic linting steps on PRs.

---

## Observability & Runbook
- Add Sentry (or equivalent) integration and set up basic alerts for exceptions and Reverb service failures.
- Add a short runbook with steps: check Reverb service status, restart systemd service, test websocket connectivity, check nginx logs, and fallback rollback steps.

---

## Next Steps (recommended immediate plan)
1. Configure GTM env var and make template load only when configured (0.5 day).
2. Queue contact emails and add rate-limiting (0.5–1 day).
3. Add GH Actions to run tests and build assets on PRs (1 day).
4. Add Sentry and a Reverb healthcheck (1 day).
5. Draft `deploy/` folder with sample nginx and systemd configs (0.5–1 day).

---

## Notes & Room for Discussion
- If you plan to scale the real-time component, we can plan for horizontal Reverb workers and a more robust WebSocket infra.
- I can prepare PRs for the immediate/quick wins (CI, GTM env, queued mail) if you'd like — tell me which item to prioritize and I’ll draft the changes.

---

*End of audit.*
