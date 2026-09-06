"""SQLAlchemy engine/session wiring, centralized (CLAUDE.md Step 6).

The connection is configured entirely through `DATABASE_URL` so the same
application code can later point at PostgreSQL without changes outside this
module (spec §27, Stage 3). SQLite-only knobs (`check_same_thread`,
`StaticPool` for `:memory:`) are isolated here rather than leaking into
business logic.
"""
from __future__ import annotations

import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base
from app.db.seed import seed_if_empty

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./member_eligibility.db")

_connect_args: dict[str, object] = {}
_engine_kwargs: dict[str, object] = {}
if DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL:
        _engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, connect_args=_connect_args, **_engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    """Create tables if absent and seed synthetic data if the store is empty.

    Safe to call on every startup (CLAUDE.md Step 8) — table creation is a
    no-op when tables already exist, and `seed_if_empty` only inserts when
    the member table is empty.
    """
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_if_empty(session)


def get_db_session() -> Generator[Session, None, None]:
    """Per-request session, closed reliably once the request completes."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
