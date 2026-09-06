"""FastAPI dependency wiring for the eligibility store/service.

Kept separate from the router so tests can override `get_store` (via
`app.dependency_overrides`) with a fixture-controlled store without needing
HTTP-level mocking. The running app resolves a per-request SQLAlchemy session
(`get_db_session`) into a `SqlAlchemyEligibilityStore`; nothing above this
layer knows persistence changed (spec §27, CLAUDE.md Step 5).
"""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db_session
from app.services.eligibility_service import EligibilityService
from app.store.sqlalchemy_store import SqlAlchemyEligibilityStore


def get_store(
    session: Session = Depends(get_db_session),
) -> SqlAlchemyEligibilityStore:
    return SqlAlchemyEligibilityStore(session)


def get_eligibility_service(
    store: SqlAlchemyEligibilityStore = Depends(get_store),
) -> EligibilityService:
    return EligibilityService(store)
