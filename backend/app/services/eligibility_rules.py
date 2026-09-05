"""Eligibility business rules (BR-001 … BR-006, spec §8–§9).

Framework-free and deterministic: no FastAPI, no Pydantic, no store access.
The same coverage record and coverage date always produce the same decision
(spec §31). `MEMBER_NOT_FOUND` (BR-002) is a lookup outcome decided by the
service layer before this module is reached — these rules only decide among
ELIGIBLE / NOT_YET_ELIGIBLE / INELIGIBLE / UNABLE_TO_DETERMINE.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date

from app.store.records import CoverageRecord

ELIGIBLE = "ELIGIBLE"
NOT_YET_ELIGIBLE = "NOT_YET_ELIGIBLE"
INELIGIBLE = "INELIGIBLE"
UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"

_ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def is_iso_date(value: str | None) -> bool:
    """True for a well-formed, real ISO `YYYY-MM-DD` calendar date."""
    if not value or not _ISO_DATE_RE.match(value):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def format_long_date(iso: str | None) -> str:
    """Render an ISO date as e.g. "September 3, 2026" (spec §13)."""
    if not is_iso_date(iso):
        return "—"
    parsed = date.fromisoformat(iso)
    return f"{parsed.strftime('%B')} {parsed.day}, {parsed.year}"


@dataclass(frozen=True)
class RuleDecision:
    status: str
    reason: str


def evaluate_eligibility(coverage: CoverageRecord | None, coverage_date: str) -> RuleDecision:
    """Evaluate a member's coverage record against the requested date.

    Never manufactures missing coverage information to force a decision —
    insufficient or contradictory data yields UNABLE_TO_DETERMINE (BR-006).
    ISO date strings compare correctly with plain `<`/`>` (BR-003/BR-004).
    """
    # BR-006 — required coverage data missing or unusable.
    if coverage is None or not is_iso_date(coverage.effective_date) or not coverage.plan_name:
        return RuleDecision(
            UNABLE_TO_DETERMINE,
            "Coverage information for this member is missing or incomplete, "
            "so eligibility cannot be determined.",
        )
    if coverage.termination_date is not None and not is_iso_date(coverage.termination_date):
        return RuleDecision(
            UNABLE_TO_DETERMINE,
            "The coverage termination date on this record is not valid, so "
            "eligibility cannot be determined.",
        )
    if coverage.termination_date and coverage.termination_date < coverage.effective_date:
        return RuleDecision(
            UNABLE_TO_DETERMINE,
            "The coverage termination date precedes the effective date, so "
            "eligibility cannot be determined.",
        )

    # BR-003 — before coverage begins.
    if coverage_date < coverage.effective_date:
        return RuleDecision(
            NOT_YET_ELIGIBLE,
            f"Coverage begins on {format_long_date(coverage.effective_date)}.",
        )

    # BR-004 — after coverage ends (a missing termination date means coverage
    # stays active after the effective date — BR-005).
    if coverage.termination_date and coverage_date > coverage.termination_date:
        return RuleDecision(
            INELIGIBLE,
            f"Coverage ended on {format_long_date(coverage.termination_date)}.",
        )

    # BR-005 — the requested date falls inside the active coverage period.
    return RuleDecision(
        ELIGIBLE,
        f"The member has active coverage on {format_long_date(coverage_date)}.",
    )
