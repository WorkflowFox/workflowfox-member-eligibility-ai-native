"""FastAPI application entry point.

Wires the eligibility router and translates technical failures — request
validation errors and unexpected server faults — into the `ValidationError`
/ `ApiError` response shapes defined in `openapi.yaml`. Business outcomes
(ELIGIBLE, MEMBER_NOT_FOUND, etc.) are never routed through here; they are
ordinary `200 OK` responses from the eligibility route (spec §14).
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.routers.eligibility import router as eligibility_router

app = FastAPI(
    title="WorkflowFox Member Eligibility API",
    version="1.0.0",
    description=(
        "Read-only eligibility API for the WorkflowFox Member Eligibility "
        "AI-Native application."
    ),
)

app.include_router(eligibility_router)

# User-safe messages for the two fields this API accepts, matching the
# `openapi.yaml` `ValidationError` examples exactly.
_FRIENDLY_FIELD_MESSAGES = {
    "memberId": "Enter a Member ID.",
    "coverageDate": "Enter a valid coverage date.",
}
_DEFAULT_FIELD_MESSAGE = "This field is invalid."


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    details = []
    seen_fields: set[str] = set()
    for error in exc.errors():
        loc = error.get("loc", ())
        field = str(loc[-1]) if loc else "request"
        if field in seen_fields:
            continue
        seen_fields.add(field)
        details.append(
            {
                "field": field,
                "message": _FRIENDLY_FIELD_MESSAGES.get(field, _DEFAULT_FIELD_MESSAGE),
            }
        )
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "The request is invalid.",
            "details": details,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "We couldn't complete the eligibility check right now.",
        },
    )
