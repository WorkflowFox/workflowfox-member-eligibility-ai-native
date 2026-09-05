"""Store/service behavior tests — member lookup independent of HTTP."""
from app.models.eligibility import EligibilityStatus
from app.services.eligibility_service import EligibilityService
from app.store.in_memory_store import InMemoryEligibilityStore
from app.store.records import MemberCoverage, MemberRecord


def test_known_member_lookup_returns_the_record():
    store = InMemoryEligibilityStore()
    record = store.find_by_member_id("WF10001")
    assert record is not None
    assert record.member.first_name == "Jordan"


def test_unknown_member_lookup_returns_none():
    store = InMemoryEligibilityStore()
    assert store.find_by_member_id("WF99999") is None


def test_lookup_trims_and_is_case_insensitive():
    store = InMemoryEligibilityStore()
    assert store.find_by_member_id("  wf10001  ") is not None


def test_service_returns_member_not_found_for_unknown_id():
    store = InMemoryEligibilityStore()
    service = EligibilityService(store)
    result = service.check_eligibility("WF99999", "2026-09-03")
    assert result.status == EligibilityStatus.MEMBER_NOT_FOUND
    assert result.member is None
    assert result.coverage is None


def test_service_returns_eligible_for_active_coverage():
    store = InMemoryEligibilityStore()
    service = EligibilityService(store)
    result = service.check_eligibility("WF10001", "2026-09-03")
    assert result.status == EligibilityStatus.ELIGIBLE
    assert result.member is not None
    assert result.member.member_id == "WF10001"
    assert result.coverage is not None
    assert result.coverage.plan_name == "Gold PPO"


def test_service_returns_unable_to_determine_when_member_has_no_coverage_record():
    store = InMemoryEligibilityStore(
        records={
            "WF20000": MemberCoverage(
                member=MemberRecord(member_id="WF20000", first_name="No", last_name="Coverage"),
                coverage=None,
            )
        }
    )
    service = EligibilityService(store)
    result = service.check_eligibility("WF20000", "2026-09-03")
    assert result.status == EligibilityStatus.UNABLE_TO_DETERMINE
    assert result.member is not None
    assert result.coverage is None


def test_service_echoes_the_requested_coverage_date():
    store = InMemoryEligibilityStore()
    service = EligibilityService(store)
    result = service.check_eligibility("WF10001", "2026-06-01")
    assert result.check_coverage_on.isoformat() == "2026-06-01"


def test_open_ended_coverage_carries_null_termination_date():
    store = InMemoryEligibilityStore()
    service = EligibilityService(store)
    result = service.check_eligibility("WF10002", "2026-09-03")
    assert result.status == EligibilityStatus.ELIGIBLE
    assert result.coverage is not None
    assert result.coverage.termination_date is None


def test_inconsistent_coverage_dates_yield_unable_to_determine():
    store = InMemoryEligibilityStore()
    service = EligibilityService(store)
    result = service.check_eligibility("WF10005", "2026-09-03")
    assert result.status == EligibilityStatus.UNABLE_TO_DETERMINE
    # The record is still surfaced so the representative has context.
    assert result.coverage is not None
