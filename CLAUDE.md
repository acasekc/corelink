# CoreLink Project Context

This file provides context for AI assistants working on this project.

**Primary Instructions:** See `.github/copilot-instructions.md` for detailed coding standards and feature development workflow.

## Quick Reference

## Tech Stack
- **Language:** PHP 8.4
- **Framework:** Laravel 12
- **ORM:** Eloquent
- **Testing:** PHPUnit 11
- **Code Style:** Laravel Pint

### Frontend
- **Language:** JavaScript (JSX)
- **Framework:** React 19 with React Router 7
- **Styling:** Tailwind CSS 4 with Typography plugin
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Build:** Vite 7

### Infrastructure
- **Real-time:** Laravel Reverb, Laravel Echo
- **PDF:** DomPDF
- **Mail:** Mailjet
- **MCP:** Laravel MCP
- **Payments:** Laravel Cashier (Stripe)

## Key Commands
```bash
# Development
composer run dev          # Start all services (server, queue, logs, vite)
npm run dev               # Frontend only
php artisan serve         # Backend only

# Testing
composer run test         # Run all tests
php artisan test          # Run all tests
php artisan test --filter=FeatureName  # Run specific tests

# Code Style
vendor/bin/pint           # Fix all PHP files
vendor/bin/pint --dirty   # Fix only changed files
```

## Key Paths
- **Backend Controllers:** `app/Http/Controllers/`
- **Backend Models:** `app/Models/`
- **Backend Services:** `app/Services/`
- **Frontend Pages:** `resources/js/Pages/`
- **Frontend Components:** `resources/js/components/`
- **Tests:** `tests/Feature/`, `tests/Unit/`
- **Routes:** `routes/web.php`, `routes/api/`

## Key Principles
- Reuse existing code before building new
- Follow established patterns from existing code
- Comprehensive testing required (PHPUnit feature tests)
- No scope creep - stick to the plan
- Run `vendor/bin/pint --dirty` before completing any backend work
