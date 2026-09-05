"""Domain-level records held by the store.

Framework-free: no Pydantic, no FastAPI. These describe what the store holds,
independent of how the API represents an eligibility result (see
`app.models.eligibility` for the API-facing shapes).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MemberRecord:
    member_id: str
    first_name: str
    last_name: str


@dataclass(frozen=True)
class CoverageRecord:
    plan_name: str
    plan_type: str
    # ISO YYYY-MM-DD strings, or None when not on record (spec §7.5, BR-006).
    effective_date: str | None
    termination_date: str | None


@dataclass(frozen=True)
class MemberCoverage:
    member: MemberRecord
    # None when the member exists but has no coverage record on file.
    coverage: CoverageRecord | None
