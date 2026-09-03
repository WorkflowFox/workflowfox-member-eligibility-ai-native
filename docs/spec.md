# WorkflowFox Member Eligibility AI-Native

## Product and Technical Specification — MVP v1.0

**Status:** Draft  
**Date:** September 3, 2026  
**Audience:** Product, design, engineering, QA  
**Project:** WorkflowFox Member Eligibility AI-Native  
**Repository:** `workflowfox-member-eligibility-ai-native`

---

# 1. Product Summary

WorkflowFox Member Eligibility AI-Native is a browser-based application for health-insurance service representatives to determine whether a member has active coverage on a specified date.

A service representative enters a Member ID and selects a **Check Coverage On** date. The date defaults to today.

The application looks up the member and their coverage information, applies deterministic eligibility rules, and displays:

- Member information
- Plan information
- Coverage effective and termination dates
- Eligibility status
- A concise, plain-language explanation of the result

The MVP uses only fictional, synthetic data.

The application is read-only. It does not modify members, plans, coverage, or any other data.

The application demonstrates a modern, specification-driven, AI-assisted full-stack development approach.

---

# 2. Primary Goal

Allow a service representative to answer the question:

> **Is this member covered on this date?**

The answer should be easy to obtain, easy to understand, and supported by enough coverage information for the representative to explain the result.

---

# 3. MVP Goals

The MVP must:

1. Allow a service representative to enter a Member ID.
2. Allow the representative to select a coverage-check date.
3. Default the coverage-check date to the current date.
4. Validate the entered information before submitting.
5. Find the member using an exact Member ID.
6. Retrieve the member's coverage information.
7. Evaluate eligibility using deterministic business rules.
8. Return a clear eligibility status.
9. Display the reason for that eligibility decision.
10. Display relevant member, plan, and coverage information.
11. Handle missing members and invalid data gracefully.
12. Provide useful error messages without exposing technical details.
13. Allow the representative to perform another eligibility inquiry.
14. Work initially with a mocked backend so the frontend can be developed and validated independently.
15. Later work end-to-end with a real API and persistent database without changing the core user experience.

---

# 4. Non-Goals for MVP

The following are intentionally excluded:

- Real member or patient data
- PHI or PII
- Salesforce integration
- Claims information
- Provider information
- Benefit accumulation information
- Deductibles
- Copays or coinsurance
- Prior authorization
- Enrollment changes
- Member updates
- Coverage updates
- Plan updates
- User administration
- Role-based access control
- Production identity-provider integration
- Multiple enterprise tenants
- Member search by name
- Fuzzy Member ID search
- Bulk eligibility checking
- File upload
- AI-generated eligibility decisions
- Chatbot functionality
- Agent functionality
- Predictive eligibility
- External payer integrations

These capabilities may be considered in later versions but must not be introduced into the MVP unless the specification is explicitly changed.

---

# 5. Users

## 5.1 Service Representative

The MVP has one primary user: a health-insurance service representative.

The representative needs to answer coverage questions quickly while assisting a member, provider, broker, employer, or another authorized party.

The representative can:

- Enter a Member ID
- Select a coverage-check date
- Submit an eligibility inquiry
- Review the result
- Review member and plan details
- Start another inquiry

The representative cannot:

- Create members
- Update members
- Create or update coverage
- Change eligibility
- Override business rules
- Modify plan information

---

# 6. Core User Flow

## 6.1 Start an Eligibility Inquiry

1. The representative opens the Member Eligibility application.
2. The application displays an eligibility inquiry form.
3. The **Check Coverage On** date defaults to today's date.
4. The representative enters a Member ID.
5. The representative may change the coverage-check date.
6. The representative selects **Check Eligibility**.

---

## 6.2 Validate the Inquiry

Before submitting:

1. Member ID must not be empty.
2. Check Coverage On must contain a valid date.
3. Validation errors must be shown near the relevant field.
4. The application must not send an invalid inquiry to the backend.

Example validation messages:

- `Enter a Member ID.`
- `Enter a valid coverage date.`

---

## 6.3 Check Eligibility

For a valid inquiry:

1. The application looks up the member using the exact Member ID.
2. If the member does not exist, return `MEMBER_NOT_FOUND`.
3. If the member exists, retrieve applicable coverage information.
4. Evaluate the selected coverage-check date against the coverage record.
5. Return an eligibility decision and explanation.
6. Display the result to the representative.

---

## 6.4 Review the Result

The representative sees:

- Member ID
- Member name
- Plan name
- Coverage effective date
- Coverage termination date, when present
- Check Coverage On date
- Eligibility status
- Eligibility reason

---

## 6.5 Perform Another Inquiry

After reviewing the result, the representative can:

- Enter another Member ID
- Change the coverage-check date
- Submit another inquiry

A full browser reload must not be required.

---

# 7. Eligibility Statuses

The application supports the following business outcomes.

## 7.1 `ELIGIBLE`

The member has coverage on the requested date.

Example:

- Coverage effective date: January 1, 2026
- Coverage termination date: December 31, 2026
- Check Coverage On: September 3, 2026

Result:

**Eligible**

Reason:

`The member has active coverage on September 3, 2026.`

---

## 7.2 `NOT_YET_ELIGIBLE`

The requested date occurs before coverage begins.

Example:

- Coverage effective date: October 1, 2026
- Check Coverage On: September 3, 2026

Result:

**Not Yet Eligible**

Reason:

`Coverage begins on October 1, 2026.`

---

## 7.3 `INELIGIBLE`

The requested date occurs after coverage ended or the coverage record otherwise indicates that coverage is no longer active.

Example:

- Coverage termination date: August 31, 2026
- Check Coverage On: September 3, 2026

Result:

**Ineligible**

Reason:

`Coverage ended on August 31, 2026.`

---

## 7.4 `MEMBER_NOT_FOUND`

No member exists for the exact Member ID.

Result:

**Member Not Found**

Reason:

`No member was found for the entered Member ID.`

This is a normal business outcome, not a technical system error.

---

## 7.5 `UNABLE_TO_DETERMINE`

The member exists, but the application cannot safely determine eligibility because required coverage information is missing, invalid, or inconsistent.

Examples:

- Missing effective date
- Invalid coverage dates
- Termination date earlier than effective date
- Required plan or coverage relationship missing

Result:

**Unable to Determine**

The application must not guess eligibility when data is insufficient.

---

# 8. Eligibility Business Rules

## BR-001 — Member ID Required

A Member ID is required to perform an eligibility inquiry.

Blank or whitespace-only Member IDs are invalid.

---

## BR-002 — Exact Member Lookup

Member lookup must use the entered Member ID as an exact identifier.

The MVP does not perform fuzzy search, partial search, or name-based search.

If no member matches:

`MEMBER_NOT_FOUND`

---

## BR-003 — Effective Date

If:

`Check Coverage On < Coverage Effective Date`

then:

`NOT_YET_ELIGIBLE`

---

## BR-004 — Termination Date

If a termination date exists and:

`Check Coverage On > Coverage Termination Date`

then:

`INELIGIBLE`

---

## BR-005 — Active Coverage Period

If:

`Check Coverage On >= Coverage Effective Date`

and either:

`Coverage Termination Date is empty`

or:

`Check Coverage On <= Coverage Termination Date`

then the coverage period includes the requested date.

Provided the coverage record is otherwise valid, return:

`ELIGIBLE`

A missing termination date means coverage remains active after the effective date.

---

## BR-006 — Insufficient or Inconsistent Data

If eligibility cannot safely be determined because required coverage data is missing, invalid, or contradictory, return:

`UNABLE_TO_DETERMINE`

The system must never manufacture or infer missing coverage information simply to produce an eligibility decision.

---

# 9. Eligibility Boundary Behavior

Effective and termination dates are inclusive.

Therefore:

### On Effective Date

If:

`Check Coverage On = Effective Date`

the member can be:

`ELIGIBLE`

---

### On Termination Date

If:

`Check Coverage On = Termination Date`

the member can be:

`ELIGIBLE`

---

### Day Before Effective Date

Return:

`NOT_YET_ELIGIBLE`

---

### Day After Termination Date

Return:

`INELIGIBLE`

---

# 10. Inquiry Form Requirements

The primary screen must contain:

## Member ID

- Text input
- Required
- Clearly labeled `Member ID`
- Leading and trailing whitespace should not affect lookup
- Submit must not proceed with an empty value

## Check Coverage On

- Date input
- Required
- Defaults to today's local date
- May be changed by the representative
- Past, present, and future dates are allowed

## Primary Action

Button label:

**Check Eligibility**

The button should clearly appear as the primary action.

---

# 11. Loading Behavior

After the representative selects **Check Eligibility**:

- Indicate that the inquiry is being processed.
- Prevent accidental repeated submissions while the current request is pending.
- Do not clear the form.
- Do not display stale results as though they belong to the new inquiry.

A simple loading state is sufficient.

Example:

`Checking eligibility…`

---

# 12. Eligibility Result

Successful inquiries should display a clearly identifiable result area.

The most important information is the eligibility status.

The result must display:

### Eligibility

- Eligibility status
- Eligibility reason
- Check Coverage On date

### Member

- Member ID
- Member name

### Coverage

- Plan name
- Coverage effective date
- Coverage termination date, when applicable

---

# 13. Result Presentation

Eligibility statuses must be understandable without relying exclusively on color.

Recommended visible labels:

- `Eligible`
- `Not Yet Eligible`
- `Ineligible`
- `Member Not Found`
- `Unable to Determine`

The eligibility reason should appear directly with the status.

The UI should answer these questions in this order:

1. Is the member eligible?
2. Why?
3. Which member was checked?
4. Which plan or coverage applies?
5. What dates support the decision?

---

# 14. Error Handling

Business outcomes and technical failures must be treated differently.

## 14.1 Business Outcomes

These are valid application responses:

- Eligible
- Not Yet Eligible
- Ineligible
- Member Not Found
- Unable to Determine

They must not be shown as unexpected system errors.

---

## 14.2 Technical Failure

If the eligibility service cannot be reached or an unexpected error occurs, display a friendly message.

Example:

`We couldn't complete the eligibility check right now. Please try again.`

Do not display:

- Stack traces
- Database messages
- Framework exceptions
- Server paths
- Internal hostnames
- Raw HTTP errors
- Python exceptions

The representative should be able to retry the inquiry.

---

# 15. UX Layout

The MVP should use a clean single-page layout.

Recommended structure:

```text
--------------------------------------------------
WorkflowFox
Member Eligibility
--------------------------------------------------

Check Member Coverage

Member ID
[________________________]

Check Coverage On
[ 09/03/2026 ]

[ Check Eligibility ]

--------------------------------------------------

Eligibility Result

ELIGIBLE

The member has active coverage on September 3, 2026.

Member
Member ID: WF10001
Name: Jordan Miller

Coverage
Plan: Gold PPO
Effective: January 1, 2026
Termination: December 31, 2026

--------------------------------------------------
```

The actual visual design may differ, but the information hierarchy should remain.

---

# 16. Responsive Design

The application should work on:

- Desktop
- Laptop
- Tablet
- Modern mobile browser

Desktop is the primary target.

The content should remain readable without horizontal scrolling at normal supported viewport sizes.

---

# 17. Accessibility

The MVP should target accessible web-interface practices.

At minimum:

- Inputs have visible labels.
- Buttons have meaningful accessible names.
- Keyboard navigation works.
- Keyboard focus is visible.
- Validation messages are associated with their fields.
- Eligibility status is not communicated through color alone.
- Text has sufficient contrast.
- Loading and result changes should be understandable to assistive technology.

Target WCAG 2.2 AA where practical for the MVP.

---

# 18. Data

All data must be synthetic.

No real:

- Member information
- Customer information
- Patient information
- Protected health information
- Personally identifiable information

may be included.

The synthetic dataset should contain enough scenarios to demonstrate every eligibility outcome.

---

# 19. Minimum Synthetic Dataset

Seed data should include at least these scenarios.

## Member 1 — Currently Eligible

Coverage started in the past and has a future termination date.

Expected status for today:

`ELIGIBLE`

---

## Member 2 — Open-Ended Coverage

Coverage started in the past and has no termination date.

Expected status for today:

`ELIGIBLE`

---

## Member 3 — Future Coverage

Coverage begins in the future.

Expected status for today:

`NOT_YET_ELIGIBLE`

---

## Member 4 — Terminated Coverage

Coverage terminated before today.

Expected status for today:

`INELIGIBLE`

---

## Member 5 — Invalid or Incomplete Coverage

Member exists but required eligibility information is missing or inconsistent.

Expected status:

`UNABLE_TO_DETERMINE`

---

## Unknown Member ID

Expected status:

`MEMBER_NOT_FOUND`

---

# 20. Conceptual Data Model

The application requires three primary business entities.

## Member

Suggested fields:

- `id`
- `member_id`
- `first_name`
- `last_name`

---

## Plan

Suggested fields:

- `id`
- `plan_name`
- `plan_type`

---

## Coverage

Suggested fields:

- `id`
- `member_id`
- `plan_id`
- `effective_date`
- `termination_date`
- `status`

The exact physical database model may evolve during implementation.

The business concepts should remain stable.

---

# 21. Application Architecture

The intended full application architecture is:

```text
Browser
   |
   v
React + TypeScript Frontend
   |
   | HTTPS / REST
   |
   v
OpenAPI Contract
   |
   v
FastAPI Backend
   |
   v
Eligibility Business Rules
   |
   v
SQLAlchemy
   |
   v
Database
```

The architecture must keep the user interface, API contract, business logic, and persistence responsibilities separated.

---

# 22. Frontend Technology

The target frontend stack is:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui where useful
- TanStack Query for server-state/API interaction
- Vitest
- React Testing Library

The UI should favor standard, maintainable components rather than elaborate custom visual effects.

This is an enterprise application, not a landing page.

---

# 23. Frontend Service Layer

Every backend interaction must be centralized behind a frontend service layer.

UI components must not directly contain raw backend HTTP logic.

Conceptually:

```text
React Components
      |
      v
Eligibility Service Interface
      |
      +------------------------+
      |                        |
      v                        v
Mock Eligibility Service   API Eligibility Service
```

The UI must depend on the service interface rather than knowing whether the data comes from a mock or a real backend.

---

# 24. Initial Mock Implementation

The first implementation must run without a real backend.

Create a mock implementation of the eligibility service.

It must support:

- Eligible member
- Not-yet-eligible member
- Ineligible member
- Member not found
- Unable to determine
- Simulated technical failure if useful for testing

The mock should return realistic synthetic information.

This makes the frontend fully interactive before backend development begins.

---

# 25. Backend Technology

When the backend is introduced, the target stack is:

- Python
- FastAPI
- Pydantic
- pytest
- uv for Python dependency management

The backend must expose a REST API that implements the agreed OpenAPI contract.

Business logic should be separated from HTTP routing.

---

# 26. API Direction

The exact API contract will be defined in `openapi.yaml` after the frontend service layer is implemented.

Conceptually, the application requires an eligibility-check operation similar to:

```text
POST /api/eligibility/check
```

Conceptual request:

```json
{
  "memberId": "WF10001",
  "coverageDate": "2026-09-03"
}
```

Conceptual response:

```json
{
  "status": "ELIGIBLE",
  "reason": "The member has active coverage on September 3, 2026.",
  "checkCoverageOn": "2026-09-03",
  "member": {
    "memberId": "WF10001",
    "firstName": "Jordan",
    "lastName": "Miller"
  },
  "coverage": {
    "planName": "Gold PPO",
    "effectiveDate": "2026-01-01",
    "terminationDate": "2026-12-31"
  }
}
```

This section is illustrative.

The formal API contract must be created later from the requirements of the implemented frontend service layer.

---

# 27. Persistence Strategy

Backend development should occur in stages.

## Stage 1

Use an in-memory data store.

Purpose:

Validate frontend-to-backend integration without introducing database complexity.

## Stage 2

Replace the in-memory store with:

- SQLite
- SQLAlchemy

Purpose:

Add persistence while remaining lightweight for local development.

## Stage 3

Support PostgreSQL without changing application business logic.

Database connectivity must be configurable through environment variables.

Avoid SQLite-specific application logic that would prevent switching to PostgreSQL.

---

# 28. Read-Only Constraint

The Member Eligibility application is read-only.

There are no MVP APIs for:

- Creating members
- Updating members
- Deleting members
- Creating coverage
- Updating coverage
- Deleting coverage
- Creating plans
- Updating plans

Eligibility evaluation reads existing synthetic records and returns a decision.

---

# 29. Security and Privacy

Although the MVP contains only synthetic data, the design should model sensible enterprise practices.

Requirements:

- Do not commit secrets to source control.
- Configuration values should use environment variables where appropriate.
- Do not expose internal exception details to the browser.
- Validate all API input.
- Do not log sensitive payloads unnecessarily.
- Production deployment must use HTTPS.
- CORS must be explicitly configured rather than allowing arbitrary origins in production.
- Real PHI/PII must never be introduced into this showcase repository.

Authentication is intentionally outside MVP scope.

---

# 30. Testing Requirements

## Frontend

Tests should cover:

- Form renders correctly
- Today's date is populated by default
- Member ID is required
- Valid inquiry can be submitted
- Loading state appears
- Eligible result renders
- Not Yet Eligible result renders
- Ineligible result renders
- Member Not Found renders
- Unable to Determine renders
- Technical service error renders
- Another inquiry can be performed

---

## Backend

Tests should cover:

- Member lookup
- Unknown member
- Effective-date boundary
- Future effective date
- Termination-date boundary
- Date after termination
- Missing termination date
- Invalid coverage data
- Request validation
- Response structure

Business-rule tests should not depend on the UI.

---

# 31. Non-Functional Requirements

For normal MVP usage:

- Eligibility responses should generally appear within 2 seconds in the deployed application under normal conditions.
- The UI should remain responsive while an inquiry is running.
- Business-rule results must be deterministic.
- The same member data and coverage date must produce the same result.
- Application failures must not produce an incorrect eligibility decision.
- Maintainability and clarity are more important than premature optimization.

---

# 32. Observability Direction

Production-oriented versions should provide:

- Structured application logs
- Request correlation IDs
- API latency metrics
- API error counts
- Eligibility inquiry success/failure counts
- Health endpoint
- Readiness/liveness information where appropriate

Logs must not expose real PHI or PII.

Detailed observability implementation is outside the initial frontend phase.

---

# 33. MVP Acceptance Criteria

The MVP is accepted when all of the following are true:

1. The representative can open the application and see an eligibility inquiry form.
2. Check Coverage On defaults to today.
3. Empty Member ID cannot be submitted.
4. The representative can enter a Member ID and coverage date.
5. A known member with valid active coverage returns `ELIGIBLE`.
6. A date before coverage begins returns `NOT_YET_ELIGIBLE`.
7. A date after coverage terminates returns `INELIGIBLE`.
8. A member with no termination date can remain eligible after the effective date.
9. An unknown Member ID returns `MEMBER_NOT_FOUND`.
10. Invalid or insufficient coverage data returns `UNABLE_TO_DETERMINE`.
11. The result shows the eligibility status and plain-language reason.
12. The result shows the relevant member and coverage details.
13. Technical failures display a user-friendly error.
14. The representative can perform another inquiry without reloading the application.
15. The application uses synthetic data only.
16. No application operation modifies member or coverage information.
17. The frontend can run entirely against the mock service.
18. Frontend tests pass.
19. After backend implementation, backend tests pass.
20. After integration, frontend behavior remains materially unchanged when switching from the mock service to the real API.

---

# 34. Delivery Sequence

Development should intentionally occur in the following order.

## Phase 1 — Specification

Create and approve:

`docs/spec.md`

No application code is required yet.

---

## Phase 2 — Frontend Prototype

Build the React frontend from this specification.

Requirements:

- Implement the complete user experience.
- Centralize all backend calls in one service layer.
- Implement a mock version of that service.
- Use realistic synthetic data.
- Make all eligibility outcomes demonstrable.
- Add frontend tests.

At the end of this phase, the application must be usable without a backend.

---

## Phase 3 — API Contract

Read the frontend service layer and create:

`openapi.yaml`

Define:

- Endpoints
- HTTP methods
- Request bodies
- Response bodies
- Validation errors
- Business-result representations
- Technical errors

The OpenAPI document becomes the explicit frontend/backend contract.

---

## Phase 4 — FastAPI Backend

Build the backend from `openapi.yaml`.

Initially use an in-memory store containing synthetic member and coverage data.

Implement:

- API routing
- Request/response models
- Member lookup
- Eligibility business rules
- Error handling
- Tests

---

## Phase 5 — Frontend/Backend Integration

Replace the frontend mock-service implementation with the real API implementation.

The frontend components should require little or no modification because they depend on the shared service interface.

Resolve:

- CORS
- API base URL configuration
- Contract mismatches
- Error handling

Run frontend and backend tests.

---

## Phase 6 — Persistence

Replace the backend in-memory store with:

- SQLite
- SQLAlchemy

Database connection must be configurable.

The change must not alter the API contract or eligibility business behavior.

---

## Phase 7 — Deployment Preparation

Deployment is a later phase.

Expected future work includes:

- Dockerizing frontend
- Dockerizing backend
- PostgreSQL
- Docker Compose
- Database migrations
- End-to-end testing with Playwright
- CI
- CD
- AWS deployment
- Infrastructure as Code
- Observability

These items must not complicate the initial frontend prototype.

---

# 35. Repository Direction

The eventual repository structure should evolve toward:

```text
workflowfox-member-eligibility-ai-native/
│
├── docs/
│   └── spec.md
│
├── frontend/
│
├── backend/
│
├── openapi.yaml
│
├── AGENTS.md
│
└── README.md
```

Do not create backend or OpenAPI implementation artifacts prematurely if the current development phase does not require them.

---

# 36. Engineering Principles

The project should follow these principles.

## Specification First

Implementation should follow this specification rather than allowing the coding agent to invent product behavior.

## Frontend First

Validate the user experience before investing in backend implementation.

## Stable Interfaces

Use interfaces between layers so temporary implementations can be replaced without rewriting unrelated parts of the application.

## Mock Before Infrastructure

Use mock services and in-memory stores to validate application behavior before introducing persistence or cloud infrastructure.

## Contract Before Backend

Define the frontend/backend contract explicitly with OpenAPI before implementing the production backend.

## Business Logic Separate From Infrastructure

Eligibility rules must not depend on:

- React
- HTTP
- FastAPI routing
- SQLAlchemy
- SQLite
- PostgreSQL

They should remain independently testable.

## Incremental Validation

At the end of every phase, the application should have something concrete that can be run or tested.

## No Speculative Complexity

Do not add architecture, frameworks, services, abstractions, integrations, or features simply because they might be useful later.

Build the MVP described here.

---

# 37. Recommended Next Artifact

The next artifact is the **working frontend prototype**.

Use this specification to generate a React + TypeScript application.

The frontend must centralize all backend interactions behind an eligibility-service interface and initially use a mocked implementation so that the entire application works without a real backend.

The frontend should include tests and demonstrate all specified eligibility outcomes using synthetic data.