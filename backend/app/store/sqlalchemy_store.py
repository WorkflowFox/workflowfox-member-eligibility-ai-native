"""SQLAlchemy-backed eligibility store (Stage 2, spec §27).

Replaces `InMemoryEligibilityStore` as the store the running application
wires up. It implements the same `find_by_member_id` lookup and returns the
same framework-free `app.store.records` dataclasses, so `EligibilityService`
and everything above it (routes, response models, business rules) are
unchanged. SQL lives only here — the service layer never sees a session or a
query.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import MemberModel
from app.store.records import CoverageRecord, MemberCoverage, MemberRecord


class SqlAlchemyEligibilityStore:
    """Synthetic member/coverage lookup keyed by exact Member ID (BR-002)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def find_by_member_id(self, member_id: str) -> MemberCoverage | None:
        key = member_id.strip().upper()
        member = self._session.execute(
            select(MemberModel).where(MemberModel.member_id == key)
        ).scalar_one_or_none()
        if member is None:
            return None

        coverage = None
        if member.coverage is not None:
            plan = member.coverage.plan
            coverage = CoverageRecord(
                plan_name=plan.plan_name,
                plan_type=plan.plan_type,
                effective_date=(
                    member.coverage.effective_date.isoformat()
                    if member.coverage.effective_date
                    else None
                ),
                termination_date=(
                    member.coverage.termination_date.isoformat()
                    if member.coverage.termination_date
                    else None
                ),
            )

        return MemberCoverage(
            member=MemberRecord(
                member_id=member.member_id,
                first_name=member.first_name,
                last_name=member.last_name,
            ),
            coverage=coverage,
        )
