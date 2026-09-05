"""In-memory eligibility store, seeded with synthetic data (spec §18–§19).

This is the temporary Stage-1 store (spec §27). It exposes the minimal
lookup the service layer needs; a later SQLAlchemy-backed repository can
implement the same lookup without changing `EligibilityService` or the API
routes/models.

Member IDs intentionally mirror `frontend/src/services/eligibility/data.ts`
so the same identifiers demonstrate the same scenarios on both sides of the
stack.
"""
from __future__ import annotations

from app.store.records import CoverageRecord, MemberCoverage, MemberRecord


def _seed_synthetic_data() -> dict[str, MemberCoverage]:
    records = [
        # Currently eligible: started in the past, terminates in the future.
        MemberCoverage(
            member=MemberRecord(member_id="WF10001", first_name="Jordan", last_name="Miller"),
            coverage=CoverageRecord(
                plan_name="Gold PPO",
                plan_type="PPO",
                effective_date="2026-01-01",
                termination_date="2026-12-31",
            ),
        ),
        # Open-ended coverage: started in the past, no termination date.
        MemberCoverage(
            member=MemberRecord(member_id="WF10002", first_name="Alicia", last_name="Nakamura"),
            coverage=CoverageRecord(
                plan_name="Core HMO",
                plan_type="HMO",
                effective_date="2024-03-15",
                termination_date=None,
            ),
        ),
        # Future coverage: effective date has not arrived yet.
        MemberCoverage(
            member=MemberRecord(member_id="WF10003", first_name="Devon", last_name="Alvarez"),
            coverage=CoverageRecord(
                plan_name="Silver PPO",
                plan_type="PPO",
                effective_date="2026-10-01",
                termination_date=None,
            ),
        ),
        # Terminated coverage: termination date is in the past.
        MemberCoverage(
            member=MemberRecord(member_id="WF10004", first_name="Priya", last_name="Raman"),
            coverage=CoverageRecord(
                plan_name="Bronze HMO",
                plan_type="HMO",
                effective_date="2025-02-01",
                termination_date="2026-08-31",
            ),
        ),
        # Inconsistent coverage: termination date precedes effective date.
        MemberCoverage(
            member=MemberRecord(member_id="WF10005", first_name="Marcus", last_name="Ellery"),
            coverage=CoverageRecord(
                plan_name="Silver HMO",
                plan_type="HMO",
                effective_date="2026-06-01",
                termination_date="2026-02-28",
            ),
        ),
        # Incomplete coverage: required effective date missing.
        MemberCoverage(
            member=MemberRecord(member_id="WF10006", first_name="Renata", last_name="Cole"),
            coverage=CoverageRecord(
                plan_name="Gold HMO",
                plan_type="HMO",
                effective_date=None,
                termination_date=None,
            ),
        ),
    ]
    return {record.member.member_id: record for record in records}


class InMemoryEligibilityStore:
    """Synthetic member/coverage lookup keyed by exact Member ID (BR-002).

    Matching trims surrounding whitespace and is case-insensitive on the
    Member ID, mirroring the reference mock implementation
    (`frontend/src/services/eligibility/mockEligibilityService.ts`).
    """

    def __init__(self, records: dict[str, MemberCoverage] | None = None) -> None:
        self._records = records if records is not None else _seed_synthetic_data()

    def find_by_member_id(self, member_id: str) -> MemberCoverage | None:
        key = member_id.strip().upper()
        return self._records.get(key)
