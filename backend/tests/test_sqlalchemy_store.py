"""SQLAlchemy repository/database behavior tests (CLAUDE.md Step 11).

Runs against the isolated test database configured in `conftest.py`, never
the developer's local `member_eligibility.db`.
"""
from app.db.database import SessionLocal, init_db
from app.db.models import MemberModel
from app.db.seed import seed_if_empty
from app.store.sqlalchemy_store import SqlAlchemyEligibilityStore


def setup_module() -> None:
    init_db()


def test_known_member_can_be_retrieved():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        record = store.find_by_member_id("WF10001")
        assert record is not None
        assert record.member.member_id == "WF10001"
        assert record.member.first_name == "Jordan"
        assert record.member.last_name == "Miller"


def test_unknown_member_returns_no_record():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        assert store.find_by_member_id("WF99999") is None


def test_lookup_trims_and_is_case_insensitive():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        assert store.find_by_member_id("  wf10001  ") is not None


def test_coverage_relationship_loads_correctly():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        record = store.find_by_member_id("WF10001")
        assert record.coverage is not None
        assert record.coverage.effective_date == "2026-01-01"
        assert record.coverage.termination_date == "2026-12-31"


def test_plan_relationship_loads_correctly():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        record = store.find_by_member_id("WF10001")
        assert record.coverage.plan_name == "Gold PPO"
        assert record.coverage.plan_type == "PPO"


def test_open_ended_termination_date_is_none():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        record = store.find_by_member_id("WF10002")
        assert record.coverage is not None
        assert record.coverage.termination_date is None


def test_missing_effective_date_is_none_not_manufactured():
    with SessionLocal() as session:
        store = SqlAlchemyEligibilityStore(session)
        record = store.find_by_member_id("WF10006")
        assert record.coverage is not None
        assert record.coverage.effective_date is None


def test_seed_initialization_does_not_create_duplicates():
    with SessionLocal() as session:
        before = session.query(MemberModel).count()
        seed_if_empty(session)
        seed_if_empty(session)
        after = session.query(MemberModel).count()
        assert after == before
