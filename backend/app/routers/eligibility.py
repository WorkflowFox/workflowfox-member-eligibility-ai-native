"""`/api/eligibility/check` — the single read-only operation in this API.

HTTP concerns only. Request/response shape comes from
`app.models.eligibility`; the actual lookup and rule evaluation is
delegated to `EligibilityService`.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.dependencies import get_eligibility_service
from app.models.eligibility import EligibilityRequest, EligibilityResult
from app.models.errors import ApiError, ValidationError
from app.services.eligibility_service import EligibilityService

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])


@router.post(
    "/check",
    response_model=EligibilityResult,
    summary="Check member eligibility for a coverage date",
    responses={
        422: {"model": ValidationError},
        500: {"model": ApiError},
        503: {"model": ApiError},
    },
)
def check_eligibility(
    payload: EligibilityRequest,
    service: EligibilityService = Depends(get_eligibility_service),
) -> JSONResponse:
    result = service.check_eligibility(
        member_id=payload.member_id,
        coverage_date=payload.coverage_date.isoformat(),
    )
    return JSONResponse(content=result.to_api_dict())
