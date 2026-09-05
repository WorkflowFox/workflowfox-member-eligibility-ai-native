"""Pydantic request/response models mirroring `openapi.yaml` exactly.

These map directly to the `EligibilityRequest` / `EligibilityResult` /
`Member` / `Coverage` / `EligibilityStatus` schemas in the contract, and to
the frontend `EligibilityRequest` / `EligibilityResult` TypeScript
interfaces they were derived from.
"""
from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    NOT_YET_ELIGIBLE = "NOT_YET_ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    MEMBER_NOT_FOUND = "MEMBER_NOT_FOUND"
    UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"


class EligibilityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    member_id: str = Field(
        alias="memberId",
        min_length=1,
        max_length=64,
        pattern=r"\S",
    )
    coverage_date: date = Field(alias="coverageDate")


class Member(BaseModel):
    model_config = ConfigDict(extra="forbid")

    member_id: str = Field(alias="memberId")
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")


class Coverage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_name: str = Field(alias="planName")
    plan_type: str = Field(alias="planType")
    effective_date: date | None = Field(alias="effectiveDate")
    termination_date: date | None = Field(alias="terminationDate")


class EligibilityResult(BaseModel):
    """The outcome of an eligibility check.

    `member` and `coverage` must be *omitted* (not present as `null`) when
    there is no corresponding record, per the OpenAPI contract — neither
    field is nullable in the schema, only optional. `to_api_dict()` performs
    that selective omission; nested nullable fields such as
    `coverage.terminationDate` are still serialized as explicit `null`.
    """

    model_config = ConfigDict(extra="forbid")

    status: EligibilityStatus
    reason: str
    check_coverage_on: date = Field(alias="checkCoverageOn")
    member: Member | None = None
    coverage: Coverage | None = None

    def to_api_dict(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "status": self.status.value,
            "reason": self.reason,
            "checkCoverageOn": self.check_coverage_on.isoformat(),
        }
        if self.member is not None:
            data["member"] = self.member.model_dump(mode="json", by_alias=True)
        if self.coverage is not None:
            data["coverage"] = self.coverage.model_dump(mode="json", by_alias=True)
        return data
