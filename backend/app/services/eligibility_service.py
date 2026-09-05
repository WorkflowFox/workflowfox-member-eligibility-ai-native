"""Eligibility service — orchestrates member lookup and business rules.

This is the stable boundary the route depends on. The store implementation
behind it (currently `InMemoryEligibilityStore`) can later be replaced by a
SQLAlchemy-backed repository without changing this class's interface, the
route, or the response models (spec §27, CLAUDE.md Step 8).
"""
from __future__ import annotations

from app.models.eligibility import Coverage, EligibilityResult, EligibilityStatus, Member
from app.services.eligibility_rules import evaluate_eligibility
from app.store.in_memory_store import InMemoryEligibilityStore


class EligibilityService:
    def __init__(self, store: InMemoryEligibilityStore) -> None:
        self._store = store

    def check_eligibility(self, member_id: str, coverage_date: str) -> EligibilityResult:
        record = self._store.find_by_member_id(member_id)

        # BR-002 — a miss is a normal business outcome, not an error.
        if record is None:
            return EligibilityResult(
                status=EligibilityStatus.MEMBER_NOT_FOUND,
                reason="No member was found for the entered Member ID.",
                checkCoverageOn=coverage_date,
            )

        decision = evaluate_eligibility(record.coverage, coverage_date)

        coverage = None
        if record.coverage is not None:
            coverage = Coverage(
                planName=record.coverage.plan_name,
                planType=record.coverage.plan_type,
                effectiveDate=record.coverage.effective_date,
                terminationDate=record.coverage.termination_date,
            )

        return EligibilityResult(
            status=EligibilityStatus(decision.status),
            reason=decision.reason,
            checkCoverageOn=coverage_date,
            member=Member(
                memberId=record.member.member_id,
                firstName=record.member.first_name,
                lastName=record.member.last_name,
            ),
            coverage=coverage,
        )
