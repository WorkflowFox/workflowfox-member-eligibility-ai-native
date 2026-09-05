"""FastAPI dependency wiring for the eligibility store/service singletons.

Kept separate from the router so tests can override `get_store` (via
`app.dependency_overrides`) with a fixture-controlled store without needing
HTTP-level mocking.
"""
from __future__ import annotations

from functools import lru_cache

from fastapi import Depends

from app.services.eligibility_service import EligibilityService
from app.store.in_memory_store import InMemoryEligibilityStore


@lru_cache
def get_store() -> InMemoryEligibilityStore:
    return InMemoryEligibilityStore()


def get_eligibility_service(
    store: InMemoryEligibilityStore = Depends(get_store),
) -> EligibilityService:
    return EligibilityService(store)
