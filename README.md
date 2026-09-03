# WorkflowFox Member Eligibility AI-Native

Browser application for health-insurance service representatives to answer one
question: **is this member covered on this date?** Read-only, synthetic data only.

See [`docs/spec.md`](docs/spec.md) for the full product and technical specification.

## Status — Phase 2 (frontend prototype)

The frontend is implemented and runs entirely against a mock eligibility
service; no backend is required. It realises the
`Member Eligibility.dc.html` design from the Claude Design project, styled with
the vendored **Industry** design system.

| Phase | Artifact | State |
| --- | --- | --- |
| 1 | `docs/spec.md` | ✅ done |
| 2 | `frontend/` — React + TS prototype, mock service, tests | ✅ this change |
| 3 | `openapi.yaml` — frontend/backend contract | ⏳ next |
| 4 | `backend/` — FastAPI + in-memory store | ⏳ |
| 5 | frontend/backend integration | ⏳ |
| 6 | persistence (SQLite → PostgreSQL) | ⏳ |

## Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + React Testing Library
npm run build      # typecheck + production build
```

### Stack

React 19 · TypeScript · Vite · Tailwind CSS · TanStack Query · Vitest +
React Testing Library. `shadcn/ui` was intentionally not used — the Industry
design system's "blueprint" component classes cover the surface and pulling in
Radix primitives would fight that aesthetic.

### How it is put together

- **Service layer** — `src/services/eligibility/` is the single boundary
  between UI and backend. Components depend on the `EligibilityService`
  interface and `getEligibilityService()`; they never know whether the data
  comes from the mock or a real API. `MockEligibilityService` carries the
  synthetic dataset and runs the deterministic business rules
  (`rules.ts`, BR-001…BR-006). Swapping in an `ApiEligibilityService` later is
  a one-line change in `src/services/eligibility/index.ts`.
- **Business rules** are framework-free and independently tested
  (`rules.test.ts`) — no React, no HTTP.
- **Design fidelity** — `src/styles/industry.css` is vendored verbatim from the
  Claude Design "Industry" project; component markup, icons and the OKLCH
  status colouring are ported from `Member Eligibility.dc.html`.
- **Prototype bar** — a dev-only strip (hidden in production builds) with
  one-click synthetic members so every eligibility outcome, including the
  simulated technical failure, is demoable. The design file's desktop/tablet/
  mobile viewport switcher was dropped; the real app is responsive to the
  browser.

### Synthetic members

| Member ID | Scenario | Expected |
| --- | --- | --- |
| `WF10001` | Active, future termination date | Eligible |
| `WF10002` | Open-ended coverage (no termination) | Eligible |
| `WF10003` | Coverage begins in the future | Not Yet Eligible |
| `WF10004` | Coverage already terminated | Ineligible |
| `WF10005` | Termination precedes effective date | Unable to Determine |
| `WF99999` | No such member | Member Not Found |
| `WF10099` | Simulated service outage | Technical error |

### Configuration

- `VITE_MOCK_LATENCY_MS` — simulated service latency in ms (default `900`).
