from __future__ import annotations

from collections.abc import Generator
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.infrastructure.database.models import Base

DATABASE_URL = "sqlite:///./data/campaigns.db"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create all tables. Idempotent — safe to call on startup."""
    Path("data").mkdir(exist_ok=True)
    Base.metadata.create_all(bind=engine)


def get_session() -> Generator[Session, Any, None]:
    """FastAPI-compatible dependency that yields a session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
