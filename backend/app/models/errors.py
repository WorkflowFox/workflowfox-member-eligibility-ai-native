"""Technical-error response models mirroring `openapi.yaml`.

Distinct from `EligibilityResult` business outcomes (spec §14) — these are
only used for malformed requests (422) and unexpected server faults
(500/503). Never include stack traces, framework exceptions, database
messages, server paths, or internal hostnames.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ApiError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    message: str


class ValidationErrorDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: str
    message: str


class ValidationError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = "VALIDATION_ERROR"
    message: str = "The request is invalid."
    details: list[ValidationErrorDetail] = []
