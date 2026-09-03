# CLAUDE.md

This file provides persistent guidance to Claude Code when working in this repository.

## Project

**WorkflowFox Member Eligibility AI-Native**

A read-only healthcare insurance showcase application that allows a service representative to enter a Member ID and a coverage date and determine whether the member has coverage on that date.

All member, plan, and coverage data used in this repository must be synthetic. Never introduce real PHI or PII.

The project follows a specification-driven, frontend-first development approach:

1. Product specification
2. Interactive frontend using a mocked service
3. OpenAPI frontend/backend contract
4. FastAPI backend using an in-memory store
5. Frontend/backend integration
6. SQLite + SQLAlchemy persistence
7. PostgreSQL, Docker, AWS, CI/CD in later phases

Do not skip ahead or introduce infrastructure that is not required by the current work unit.

---

## Source of Truth

The product specification is:

`docs/spec.md`

Treat the specification as the source of truth for:

- user flows
- business behavior
- eligibility rules
- statuses
- scope
- non-goals
- acceptance criteria

Do not invent product behavior that conflicts with the specification.

If implementation and specification disagree, call out the mismatch before changing business behavior.

---

## Repository Direction

The repository should evolve toward:

```text
/
├── CLAUDE.md
├── docs/
│   └── spec.md
├── frontend/
├── backend/          # added in a later phase
└── openapi.yaml      # added after the frontend service contract is reviewed
```

Do not move files or restructure the repository unless the current task requires it.

---

# Current Project State

The frontend prototype exists in:

`frontend/`

It is a React + TypeScript application created with Vite.

The frontend currently runs entirely against a mocked eligibility service. There is no real backend yet.

Do not create a backend, database, Docker configuration, AWS infrastructure, authentication, or unrelated features unless explicitly requested by the current task.

---

# Frontend Stack

Current frontend technologies:

- React
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Vitest
- React Testing Library

Use `npm` for frontend dependency management because the project already contains `package-lock.json`.

Do not switch to yarn, pnpm, Bun, Next.js, or another frontend framework unless explicitly requested.

---

# Frontend Commands

Run commands from `frontend/`.

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run TypeScript checks:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

Before considering a frontend change complete, run:

```bash
npm test
npm run typecheck
npm run build
```

Fix failures caused by the change before reporting completion.

---

# Frontend Architecture

Maintain the existing separation of responsibilities:

```text
React UI
   ↓
App orchestration
   ↓
TanStack Query
   ↓
EligibilityService interface
   ↓
Service implementation
```

The important frontend/backend boundary is:

`frontend/src/services/eligibility/`

Key files currently include:

```text
frontend/src/
├── App.tsx
├── components/
├── lib/
└── services/
    └── eligibility/
        ├── types.ts
        ├── index.ts
        ├── mockEligibilityService.ts
        ├── data.ts
        └── rules.ts
```

### Responsibilities

`App.tsx`
- coordinates the eligibility inquiry workflow
- manages form-level state
- invokes the eligibility service through TanStack Query
- selects loading, error, and result UI states

`components/`
- presentation and user interaction
- should not contain eligibility business logic
- should not directly access synthetic data
- should not directly implement backend HTTP calls

`services/eligibility/types.ts`
- defines the typed frontend service contract
- contains request/result/status types
- should remain the primary frontend/backend boundary

`services/eligibility/mockEligibilityService.ts`
- current mock implementation of the service
- simulates backend behavior
- should be replaceable later by a real API implementation

`services/eligibility/data.ts`
- synthetic test/demo records only

`services/eligibility/rules.ts`
- deterministic eligibility business rules used by the mock implementation
- keep rules separate from React components

---

# Service-Layer Rule

Every current or future backend interaction must go through the centralized eligibility service abstraction.

React components must not directly call backend endpoints.

React components must not directly access mock member or coverage data.

Conceptually:

```text
React Components
       ↓
EligibilityService
       ↓
MockEligibilityService       # current
```

Later:

```text
React Components
       ↓
EligibilityService
       ↓
ApiEligibilityService
       ↓
FastAPI
```

The frontend components should require little or no change when the mock service is replaced with the real API service.

---

# Eligibility Business Outcomes

The application supports these business statuses:

- `ELIGIBLE`
- `NOT_YET_ELIGIBLE`
- `INELIGIBLE`
- `MEMBER_NOT_FOUND`
- `UNABLE_TO_DETERMINE`

These are business outcomes, not technical failures.

A technical/service failure must be handled separately from the statuses above.

Do not add new eligibility statuses without a specification change.

---

# Core Eligibility Rules

Preserve the business rules defined in `docs/spec.md`.

At a high level:

- Member ID is required.
- Member lookup uses the exact Member ID.
- If the coverage-check date is before the effective date, return `NOT_YET_ELIGIBLE`.
- If a termination date exists and the coverage-check date is after it, return `INELIGIBLE`.
- Effective and termination dates are inclusive.
- A missing termination date can represent open-ended active coverage.
- Missing, invalid, or contradictory coverage data returns `UNABLE_TO_DETERMINE`.
- Never guess eligibility when the available data is insufficient.

Business-rule logic must remain independently testable and must not depend on React rendering.

---

# Frontend State Handling

Maintain explicit UX handling for:

- empty/default form
- validation errors
- loading
- eligible
- not yet eligible
- ineligible
- member not found
- unable to determine
- technical error

The user must be able to perform another inquiry without reloading the browser.

Do not display stale eligibility results while a new request is pending.

---

# Prototype-Only UI

The current frontend contains development/prototype helpers such as the synthetic-member prototype bar.

Development-only controls must not become part of the production user experience.

Do not make prototype tooling a production dependency.

Visual-only blueprint corner decorations are not business requirements and may be removed during UI refinement without changing product behavior.

---

# Styling Guidance

Favor standard, maintainable enterprise UI.

The application should feel:

- professional
- restrained
- accessible
- healthcare/insurance appropriate
- efficient for a service representative

Avoid unnecessary:

- animations
- decorative effects
- gradients
- glassmorphism
- dashboard widgets
- custom visual complexity

Do not redesign the application unless the task is specifically about visual design.

Preserve accessibility, visible labels, keyboard usability, focus states, and status communication that does not rely on color alone.

---

# Testing Guidance

Maintain three distinct testing concerns where applicable:

1. Business-rule tests
   - test deterministic eligibility behavior

2. Service tests
   - test service behavior and mock scenarios

3. React behavior tests
   - test what the user can enter, submit, and see

Prefer user-visible behavior over tests coupled to internal React implementation details.

Never remove or weaken tests simply to make a failing build pass.

---

# OpenAPI Phase

When asked to create the API contract:

1. Read the frontend eligibility service types and service calls.
2. Read `docs/spec.md`.
3. Create `openapi.yaml` at the repository root.
4. Define the backend the frontend actually needs.
5. Include every required:
   - endpoint
   - HTTP method
   - path
   - request body
   - response body
   - business outcome
   - validation response
   - technical error response
   - authentication requirement, if any
6. Do not create speculative endpoints.
7. Do not implement the backend in the same work unit unless explicitly requested.

The OpenAPI contract becomes the explicit agreement between frontend and backend.

---

# Backend Phase

When explicitly asked to implement the backend:

Use:

- Python
- FastAPI
- Pydantic
- pytest
- `uv` for Python dependency management

Useful `uv` commands:

```bash
uv sync
uv add <PACKAGE-NAME>
uv run python <PYTHON-FILE>
```

Initially use an in-memory store.

Keep backend responsibilities separated into sensible modules such as:

- routes/routers
- request and response models
- business/service logic
- repository/store layer
- configuration

Do not introduce persistence until the frontend/backend contract and integration are working.

---

# Persistence Phase

When explicitly asked to add persistence:

1. Replace the in-memory backend store with SQLite.
2. Use SQLAlchemy.
3. Configure the database connection using environment variables.
4. Keep data-access code database-agnostic.
5. Avoid SQLite-specific application logic so PostgreSQL can be introduced later.
6. Do not change the public API contract merely because persistence changes.

---

# Security and Privacy

- Synthetic data only.
- Never commit secrets.
- Do not introduce real PHI or PII.
- Validate external input.
- Do not expose stack traces or internal exception details to users.
- Do not log sensitive payloads unnecessarily.
- Keep production-specific secrets in environment/configuration mechanisms, not source files.

---

# Engineering Principles

Follow these principles throughout the repository:

## Specification first
Do not let implementation invent requirements.

## Stable boundaries
Keep interfaces stable while replacing temporary implementations.

## Incremental development
Each work unit should leave something runnable and testable.

## Separation of concerns
Keep UI, API contract, business logic, data access, and infrastructure distinct.

## Minimal scope
Do not add functionality because it may be useful someday.

## Validate before expanding
Run relevant tests and builds before moving to the next architectural layer.

## Understand before changing
Inspect existing code and conventions before introducing new patterns or dependencies.

---

# Git Discipline

Make focused changes.

Do not mix unrelated refactoring with feature work.

Use clear commit messages describing the completed work unit.

Never commit:

- `node_modules/`
- generated build output unless intentionally required
- secrets
- local environment credentials
- editor/OS junk files

Do not rewrite Git history or perform destructive Git operations unless explicitly requested.

---

# Current Next Step

The frontend prototype is already implemented with a centralized mocked service.

Unless the user gives a different task, the next architectural step is:

```text
frontend service contract
        ↓
openapi.yaml
```

Do not skip directly to FastAPI or database implementation before the API contract is reviewed.
