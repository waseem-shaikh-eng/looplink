from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.campaign import Campaign
from app.domain.entities.enrollment import Enrollment
from app.domain.entities.offer import Offer
from app.domain.value_objects.identity import NormalizedIdentity


class CampaignRepository(ABC):
    """Interface for Campaign persistence.

    Defined in the domain layer so that application / infrastructure
    depend on this abstraction, not the other way around (DIP).
    """

    @abstractmethod
    def save(self, campaign: Campaign) -> None:
        ...

    @abstractmethod
    def get_by_id(self, campaign_id: UUID) -> Optional[Campaign]:
        ...

    @abstractmethod
    def get_by_public_token(self, token: str) -> Optional[Campaign]:
        ...

    @abstractmethod
    def list_all(self) -> List[Campaign]:
        ...

    @abstractmethod
    def delete(self, campaign_id: UUID) -> None:
        ...


class OfferRepository(ABC):
    @abstractmethod
    def save(self, offer: Offer) -> None:
        ...

    @abstractmethod
    def save_all(self, offers: list[Offer]) -> None:
        ...

    @abstractmethod
    def get_by_id(self, offer_id: UUID) -> Optional[Offer]:
        ...

    @abstractmethod
    def get_by_campaign_id(self, campaign_id: UUID) -> List[Offer]:
        ...

    @abstractmethod
    def delete(self, offer_id: UUID) -> None:
        ...

    @abstractmethod
    def delete_by_campaign_id(self, campaign_id: UUID) -> None:
        ...


class EnrollmentRepository(ABC):
    @abstractmethod
    def save(self, enrollment: Enrollment) -> None:
        ...

    @abstractmethod
    def get_by_id(self, enrollment_id: UUID) -> Optional[Enrollment]:
        ...

    @abstractmethod
    def get_by_campaign_and_identity(
        self, campaign_id: UUID, normalized_identity: NormalizedIdentity
    ) -> Optional[Enrollment]:
        ...

    @abstractmethod
    def get_by_campaign_id(self, campaign_id: UUID) -> List[Enrollment]:
        ...
