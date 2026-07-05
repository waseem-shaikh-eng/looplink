from __future__ import annotations

from sqlalchemy.orm import Session

from app.domain.interfaces.repositories import (
    CampaignRepository,
    EnrollmentRepository,
    OfferRepository,
)
from app.domain.interfaces.unit_of_work import UnitOfWork
from app.infrastructure.repositories.campaign_repository import (
    SQLAlchemyCampaignRepository,
)
from app.infrastructure.repositories.enrollment_repository import (
    SQLAlchemyEnrollmentRepository,
)
from app.infrastructure.repositories.offer_repository import SQLAlchemyOfferRepository


class SQLAlchemyUnitOfWork(UnitOfWork):
    """SQLAlchemy-backed Unit of Work.

    Manages a single database session per unit of work boundary.
    All repository operations within the same UoW share one transaction.
    """

    def __init__(self, session: Session) -> None:
        self._session = session
        self._campaign_repo: SQLAlchemyCampaignRepository | None = None
        self._offer_repo: SQLAlchemyOfferRepository | None = None
        self._enrollment_repo: SQLAlchemyEnrollmentRepository | None = None

    def __enter__(self) -> UnitOfWork:
        return self

    def __exit__(self, *args: object) -> None:
        if args[0] is not None:
            self.rollback()
        self._session.close()

    @property
    def campaigns(self) -> CampaignRepository:
        if self._campaign_repo is None:
            self._campaign_repo = SQLAlchemyCampaignRepository(self._session)
        return self._campaign_repo

    @property
    def offers(self) -> OfferRepository:
        if self._offer_repo is None:
            self._offer_repo = SQLAlchemyOfferRepository(self._session)
        return self._offer_repo

    @property
    def enrollments(self) -> EnrollmentRepository:
        if self._enrollment_repo is None:
            self._enrollment_repo = SQLAlchemyEnrollmentRepository(self._session)
        return self._enrollment_repo

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()
