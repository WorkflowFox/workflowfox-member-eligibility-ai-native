"""Synthetic seed data for the persistent store (spec §18–§19).

Mirrors the Stage-1 in-memory seed (`app.store.in_memory_store`) so the same
Member IDs demonstrate the same scenarios whether the app is wired to
`InMemoryEligibilityStore` (kept for isolated tests) or the SQLAlchemy store.
"""
from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.db.models import CoverageModel, MemberModel, PlanModel

_SEED_RECORDS = [
    # Currently eligible: started in the past, terminates in the future.
    dict(
        member_id="WF10001",
        first_name="Jordan",
        last_name="Miller",
        plan_name="Gold PPO",
        plan_type="PPO",
        effective_date=date(2026, 1, 1),
        termination_date=date(2026, 12, 31),
    ),
    # Open-ended coverage: started in the past, no termination date.
    dict(
        member_id="WF10002",
        first_name="Alicia",
        last_name="Nakamura",
        plan_name="Core HMO",
        plan_type="HMO",
        effective_date=date(2024, 3, 15),
        termination_date=None,
    ),
    # Future coverage: effective date has not arrived yet.
    dict(
        member_id="WF10003",
        first_name="Devon",
        last_name="Alvarez",
        plan_name="Silver PPO",
        plan_type="PPO",
        effective_date=date(2026, 10, 1),
        termination_date=None,
    ),
    # Terminated coverage: termination date is in the past.
    dict(
        member_id="WF10004",
        first_name="Priya",
        last_name="Raman",
        plan_name="Bronze HMO",
        plan_type="HMO",
        effective_date=date(2025, 2, 1),
        termination_date=date(2026, 8, 31),
    ),
    # Inconsistent coverage: termination date precedes effective date.
    dict(
        member_id="WF10005",
        first_name="Marcus",
        last_name="Ellery",
        plan_name="Silver HMO",
        plan_type="HMO",
        effective_date=date(2026, 6, 1),
        termination_date=date(2026, 2, 28),
    ),
    # Incomplete coverage: required effective date missing.
    dict(
        member_id="WF10006",
        first_name="Renata",
        last_name="Cole",
        plan_name="Gold HMO",
        plan_type="HMO",
        effective_date=None,
        termination_date=None,
    ),
]


def seed_if_empty(session: Session) -> None:
    """Populate the synthetic dataset, but only on a fresh/empty database.

    Safe to call on every startup: a database that already has member rows is
    left untouched, so restarting the app never duplicates seed records.
    """
    if session.query(MemberModel).first() is not None:
        return

    plans: dict[tuple[str, str], PlanModel] = {}
    for record in _SEED_RECORDS:
        plan_key = (record["plan_name"], record["plan_type"])
        plan = plans.get(plan_key)
        if plan is None:
            plan = PlanModel(plan_name=record["plan_name"], plan_type=record["plan_type"])
            session.add(plan)
            plans[plan_key] = plan

        member = MemberModel(
            member_id=record["member_id"],
            first_name=record["first_name"],
            last_name=record["last_name"],
        )
        member.coverage = CoverageModel(
            plan=plan,
            effective_date=record["effective_date"],
            termination_date=record["termination_date"],
        )
        session.add(member)

    session.commit()
