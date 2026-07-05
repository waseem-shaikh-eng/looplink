from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.interfaces.repositories import (
    CampaignRepository,
    EnrollmentRepository,
    OfferRepository,
)


class UnitOfWork(ABC):
    """Unit of Work interface for transactional consistency.

    Combines multiple repository operations into a single transaction.
    The concrete implementation (SQLAlchemy) lives in infrastructure.
    """

    @abstractmethod
    def __enter__(self) -> UnitOfWork:
        ...

    @abstractmethod
    def __exit__(self, *args: object) -> None:
        ...

    @property
    @abstractmethod
    def campaigns(self) -> CampaignRepository:
        ...

    @property
    @abstractmethod
    def offers(self) -> OfferRepository:
        ...

    @property
    @abstractmethod
    def enrollments(self) -> EnrollmentRepository:
        ...

    @abstractmethod
    def commit(self) -> None:
        ...

    @abstractmethod
    def rollback(self) -> None:
        ...
