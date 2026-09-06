"""The store interface `EligibilityService` depends on.

Kept as a structural `Protocol` (not an ABC) so both `InMemoryEligibilityStore`
and `SqlAlchemyEligibilityStore` satisfy it without inheritance — the service
layer only ever needs to know it can look a member up by exact Member ID.
"""
from __future__ import annotations

from typing import Protocol

from app.store.records import MemberCoverage


class EligibilityStore(Protocol):
    def find_by_member_id(self, member_id: str) -> MemberCoverage | None: ...
