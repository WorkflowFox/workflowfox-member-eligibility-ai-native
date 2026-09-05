"""API contract tests against `openapi.yaml` via FastAPI's `TestClient`.

Covers request validation, response structure/status codes, and that every
business outcome is a `200 OK` (spec §14; MEMBER_NOT_FOUND is not a 404).
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

ENDPOINT = "/api/eligibility/check"


def test_eligible_member_returns_200_with_full_result():
    response = client.post(ENDPOINT, json={"memberId": "WF10001", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ELIGIBLE"
    assert body["checkCoverageOn"] == "2026-09-03"
    assert body["member"] == {"memberId": "WF10001", "firstName": "Jordan", "lastName": "Miller"}
    assert body["coverage"]["planName"] == "Gold PPO"
    assert body["coverage"]["effectiveDate"] == "2026-01-01"
    assert body["coverage"]["terminationDate"] == "2026-12-31"
    assert "reason" in body and isinstance(body["reason"], str) and body["reason"]


def test_open_ended_coverage_returns_explicit_null_termination_date():
    response = client.post(ENDPOINT, json={"memberId": "WF10002", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ELIGIBLE"
    assert "terminationDate" in body["coverage"]
    assert body["coverage"]["terminationDate"] is None


def test_future_coverage_returns_not_yet_eligible():
    response = client.post(ENDPOINT, json={"memberId": "WF10003", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    assert response.json()["status"] == "NOT_YET_ELIGIBLE"


def test_terminated_coverage_returns_ineligible():
    response = client.post(ENDPOINT, json={"memberId": "WF10004", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    assert response.json()["status"] == "INELIGIBLE"


def test_inconsistent_coverage_returns_unable_to_determine():
    response = client.post(ENDPOINT, json={"memberId": "WF10005", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    assert response.json()["status"] == "UNABLE_TO_DETERMINE"


def test_unknown_member_returns_200_member_not_found_not_404():
    response = client.post(ENDPOINT, json={"memberId": "WF99999", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "MEMBER_NOT_FOUND"
    assert "member" not in body
    assert "coverage" not in body


def test_blank_member_id_returns_422_validation_error_shape():
    response = client.post(ENDPOINT, json={"memberId": "   ", "coverageDate": "2026-09-03"})
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert any(d["field"] == "memberId" for d in body["details"])


def test_missing_member_id_returns_422():
    response = client.post(ENDPOINT, json={"coverageDate": "2026-09-03"})
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert any(d["field"] == "memberId" for d in body["details"])


def test_invalid_coverage_date_returns_422():
    response = client.post(ENDPOINT, json={"memberId": "WF10001", "coverageDate": "not-a-date"})
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert any(d["field"] == "coverageDate" for d in body["details"])


def test_missing_coverage_date_returns_422():
    response = client.post(ENDPOINT, json={"memberId": "WF10001"})
    assert response.status_code == 422


def test_whitespace_around_member_id_is_trimmed_before_lookup():
    response = client.post(ENDPOINT, json={"memberId": "  WF10001  ", "coverageDate": "2026-09-03"})
    assert response.status_code == 200
    assert response.json()["status"] == "ELIGIBLE"
