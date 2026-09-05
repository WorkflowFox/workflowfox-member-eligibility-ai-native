"""Business-rule tests (BR-001 … BR-006, spec §8–§9).

Framework-free: no FastAPI, no TestClient. Exercises
`app.services.eligibility_rules.evaluate_eligibility` directly against
`CoverageRecord` values.
"""
from app.services.eligibility_rules import (
    ELIGIBLE,
    INELIGIBLE,
    NOT_YET_ELIGIBLE,
    UNABLE_TO_DETERMINE,
    evaluate_eligibility,
)
from app.store.records import CoverageRecord

OPEN_ENDED = CoverageRecord(
    plan_name="Core HMO",
    plan_type="HMO",
    effective_date="2024-03-15",
    termination_date=None,
)

TERMED = CoverageRecord(
    plan_name="Bronze HMO",
    plan_type="HMO",
    effective_date="2025-02-01",
    termination_date="2026-08-31",
)


def test_active_coverage_mid_period_is_eligible():
    decision = evaluate_eligibility(TERMED, "2026-05-15")
    assert decision.status == ELIGIBLE


def test_on_effective_date_boundary_is_eligible():
    decision = evaluate_eligibility(TERMED, "2025-02-01")
    assert decision.status == ELIGIBLE


def test_day_before_effective_date_is_not_yet_eligible():
    decision = evaluate_eligibility(TERMED, "2025-01-31")
    assert decision.status == NOT_YET_ELIGIBLE
    assert "February 1, 2025" in decision.reason


def test_future_effective_date_is_not_yet_eligible():
    future = CoverageRecord(
        plan_name="Silver PPO",
        plan_type="PPO",
        effective_date="2026-10-01",
        termination_date=None,
    )
    decision = evaluate_eligibility(future, "2026-09-03")
    assert decision.status == NOT_YET_ELIGIBLE


def test_on_termination_date_boundary_is_eligible():
    decision = evaluate_eligibility(TERMED, "2026-08-31")
    assert decision.status == ELIGIBLE


def test_day_after_termination_date_is_ineligible():
    decision = evaluate_eligibility(TERMED, "2026-09-01")
    assert decision.status == INELIGIBLE
    assert "August 31, 2026" in decision.reason


def test_open_ended_coverage_remains_eligible_far_after_effective_date():
    decision = evaluate_eligibility(OPEN_ENDED, "2030-01-01")
    assert decision.status == ELIGIBLE


def test_missing_coverage_record_is_unable_to_determine():
    decision = evaluate_eligibility(None, "2026-09-03")
    assert decision.status == UNABLE_TO_DETERMINE


def test_missing_effective_date_is_unable_to_determine():
    incomplete = CoverageRecord(
        plan_name="Gold HMO",
        plan_type="HMO",
        effective_date=None,
        termination_date=None,
    )
    decision = evaluate_eligibility(incomplete, "2026-09-03")
    assert decision.status == UNABLE_TO_DETERMINE


def test_termination_before_effective_date_is_unable_to_determine():
    inconsistent = CoverageRecord(
        plan_name="Silver HMO",
        plan_type="HMO",
        effective_date="2026-06-01",
        termination_date="2026-02-28",
    )
    decision = evaluate_eligibility(inconsistent, "2026-09-03")
    assert decision.status == UNABLE_TO_DETERMINE


def test_invalid_termination_date_format_is_unable_to_determine():
    malformed = CoverageRecord(
        plan_name="Gold HMO",
        plan_type="HMO",
        effective_date="2026-01-01",
        termination_date="not-a-date",
    )
    decision = evaluate_eligibility(malformed, "2026-09-03")
    assert decision.status == UNABLE_TO_DETERMINE


def test_missing_plan_name_is_unable_to_determine():
    no_plan = CoverageRecord(
        plan_name="",
        plan_type="HMO",
        effective_date="2026-01-01",
        termination_date=None,
    )
    decision = evaluate_eligibility(no_plan, "2026-09-03")
    assert decision.status == UNABLE_TO_DETERMINE


def test_same_inputs_produce_the_same_decision():
    first = evaluate_eligibility(TERMED, "2026-05-15")
    second = evaluate_eligibility(TERMED, "2026-05-15")
    assert first == second
