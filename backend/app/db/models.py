"""SQLAlchemy ORM models for the persistent eligibility store.

Mirrors the conceptual data model in `docs/spec.md` §20 (Member / Plan /
Coverage). These are persistence-only models — the public API contract is
still defined by `app.models.eligibility`, and framework-free lookups still
flow through `app.store.records` so business rules never see the ORM layer.
"""
from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class MemberModel(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    coverage: Mapped["CoverageModel | None"] = relationship(
        back_populates="member", uselist=False, cascade="all, delete-orphan"
    )


class PlanModel(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    plan_type: Mapped[str] = mapped_column(String(50), nullable=False)

    coverages: Mapped[list["CoverageModel"]] = relationship(back_populates="plan")


class CoverageModel(Base):
    __tablename__ = "coverages"

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), unique=True, nullable=False)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    # Nullable: a missing effective date is an incomplete record that drives
    # UNABLE_TO_DETERMINE (BR-006), not a database constraint violation.
    effective_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Nullable: no termination date means open-ended active coverage (BR-005).
    termination_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    member: Mapped["MemberModel"] = relationship(back_populates="coverage")
    plan: Mapped["PlanModel"] = relationship(back_populates="coverages")
