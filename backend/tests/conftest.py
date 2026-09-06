"""Test-session-wide isolation from the developer's local SQLite database.

Sets `DATABASE_URL` to a private temp file before any test module imports
`app.main` / `app.db.database` (module-level code here runs at conftest
collection time, ahead of every test file import), so automated tests never
read or write `member_eligibility.db` (CLAUDE.md Step 11).
"""
from __future__ import annotations

import os
import tempfile

_fd, _TEST_DB_PATH = tempfile.mkstemp(suffix=".db", prefix="test_member_eligibility_")
os.close(_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"


def pytest_sessionfinish(session, exitstatus) -> None:  # noqa: ARG001
    try:
        os.remove(_TEST_DB_PATH)
    except OSError:
        pass
