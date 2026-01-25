# Agent Orchestration System

This document describes how the agent system works together to build features efficiently.

## Agent Architecture

The system uses **5 specialized agents** that orchestrate together:

```
User Request
    ↓
┌─────────────────┐
│   Planner       │ ← Requirements gathering & codebase analysis
├─────────────────┤
│ • Clarify needs │
│ • Search code   │
│ • Create plan   │
└────────┬────────┘
         ↓ (with approval)
    ┌────────────────────────┐
    │                        │
    ↓                        ↓
┌──────────────┐      ┌──────────────┐
│   Backend    │      │   Frontend   │
│   Builder    │      │   Builder    │
├──────────────┤      ├──────────────┤
│ • Models     │      │ • Pages      │
│ • Migrations │      │ • Components │
│ • Services   │      │ • API calls  │
│ • Controllers│      │ • Styling    │
└────┬─────────┘      └────┬─────────┘
     │                     │
     └────────┬────────────┘
              ↓
         ┌──────────┐
         │ Auditor  │ ← Standards compliance check
         ├──────────┤
         │ • Review │
         │ • Report │
         └────┬─────┘
              ↓
         ┌──────────┐
         │ Tester   │ ← Write & run PHPUnit tests
         ├──────────┤
         │ • Create │
         │ • Run    │
         │ • Fix    │
         └──────────┘
```

## Typical Feature Flow

### 1. **Planner Phase** (start here)
**Goal**: Get a detailed, approved plan before any coding

```
User: "I need a feature to manage support tickets"
  ↓
Planner Agent:
  • Asks clarifying questions
  • Searches existing code for patterns
  • Analyzes what can be reused
  • Creates technical plan
  • Gets user approval
```

**Planner hands off to:**
- Backend Builder (to implement backend)
- Frontend Builder (to implement frontend)

### 2. **Backend Builder Phase**
**Goal**: Implement all backend code following Laravel patterns

```
Input: Plan from Planner
  ↓
Backend Builder:
  • Creates models & migrations
  • Builds services (business logic)
  • Creates controllers (thin wrappers)
  • Adds form requests (validation)
  • Uses Eloquent relationships
  • Runs vendor/bin/pint --dirty
```

**Backend Builder hands off to:**
- Auditor (to check standards)
- Tester (to write tests)

### 3. **Frontend Builder Phase**
**Goal**: Implement all frontend code following React patterns

```
Input: Plan from Planner
  ↓
Frontend Builder:
  • Creates pages in resources/js/Pages/
  • Builds/reuses components
  • Integrates with backend API
  • Uses Tailwind dark theme
  • Uses Lucide React icons
```

**Frontend Builder hands off to:**
- Auditor (to check standards)
- Tester (to write tests)

### 4. **Auditor Phase**
**Goal**: Verify code meets project standards

```
Input: Backend & Frontend code
  ↓
Auditor Agent:
  • Checks Laravel conventions
  • Validates React patterns
  • Reviews Tailwind usage
  • Checks type declarations
  • Generates compliance report
```

**Auditor hands off to:**
- Backend Builder (to fix issues)
- Frontend Builder (to fix issues)
- Tester (to write tests)

### 5. **Tester Phase**
**Goal**: Write comprehensive PHPUnit tests

```
Input: Complete feature code
  ↓
Tester Agent:
  • Creates feature tests
  • Tests happy paths
  • Tests error paths
  • Tests edge cases
  • Runs php artisan test
```

## Handoff Points

Each agent has defined handoff points that are **optional suggestions**:

### Backend Builder Handoffs
```yaml
- Frontend Builder: "Now implement the frontend"
- Auditor: "Review for standards compliance"
- Tester: "Create PHPUnit tests"
```

### Frontend Builder Handoffs
```yaml
- Auditor: "Review for standards compliance"
- Tester: "Create tests for the feature"
```

### Auditor Handoffs
```yaml
- Self: "Fix the issues identified"
- Tester: "Write tests for code that was audited"
```

### Tester Handoffs
```yaml
- Self: "Fix failing tests"
- Auditor: "Audit the code that was tested"
```

### Planner Handoffs
```yaml
- Backend Builder: "Implement the backend portion"
- Frontend Builder: "Implement the frontend portion"
```

## How to Use

### Start a Feature
```
1. Go to GitHub Copilot Chat
2. Mention @Planner: "Build a feature for [description]"
3. Answer clarifying questions
4. Review and approve the plan
5. Use handoff buttons to start building
```

### Build Only Backend
```
1. Go to GitHub Copilot Chat
2. Mention @Backend Builder with a clear plan
3. Implementation begins immediately
```

### Build Only Frontend
```
1. Go to GitHub Copilot Chat
2. Mention @Frontend Builder with a clear plan
3. Implementation begins immediately
```

### Audit Existing Code
```
1. Go to GitHub Copilot Chat
2. Mention @Auditor: "Review [file path] for standards"
3. Get compliance report
```

### Write Tests for Code
```
1. Go to GitHub Copilot Chat
2. Mention @Tester with the code/feature to test
3. Tests are created and run
```

## Agent Specifications

Each agent is defined in `.github/agents/`:

| Agent | File | Model | Purpose |
|-------|------|-------|---------|
| Planner | `planner.agent.md` | Claude Sonnet 4 | Requirements & planning |
| Backend Builder | `backend.agent.md` | Claude Sonnet 4 | Laravel code |
| Frontend Builder | `frontend.agent.md` | Claude Sonnet 4 | React code |
| Auditor | `auditor.agent.md` | Claude Sonnet 4 | Standards compliance |
| Tester | `tester.agent.md` | Claude Sonnet 4 | PHPUnit tests |

## Key Design Principles

1. **Separation of Concerns**: Each agent does one job well
2. **Reusable Code First**: Planner finds existing code before building
3. **Standards Enforcement**: Auditor catches issues early
4. **Test Coverage**: Tests verify all code works
5. **Optional Handoffs**: You choose when to hand off or continue
6. **Approval Gate**: Plans need approval before building

## Standards Reference

Each agent enforces standards from:
- `.github/copilot-instructions.md` - PHP/Laravel conventions
- `CLAUDE.md` - Project-specific guidelines
- `phpunit.xml` - Testing configuration
- `tailwind.config.js` - Styling conventions

---

**To get started:** Mention `@Planner` in Copilot Chat with a feature idea!
