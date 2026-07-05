from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.offer import Offer
from app.domain.enums.offer_type import OfferType
from app.domain.factories.offer_factory import OfferFactory
from app.domain.interfaces.repositories import OfferRepository
from app.infrastructure.database.models import OfferModel


class SQLAlchemyOfferRepository(OfferRepository):
    """SQLAlchemy-backed implementation of OfferRepository.

    Uses OfferFactory to reconstruct polymorphic Offer domain entities
    from persisted JSON parameters.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, offer: Offer) -> None:
        model = self._to_orm(offer)
        self._session.merge(model)

    def save_all(self, offers: list[Offer]) -> None:
        for offer in offers:
            self.save(offer)

    def get_by_id(self, offer_id: UUID) -> Optional[Offer]:
        model = self._session.get(OfferModel, offer_id)
        if model is None:
            return None
        return self._to_domain(model)

    def get_by_campaign_id(self, campaign_id: UUID) -> List[Offer]:
        models = (
            self._session.query(OfferModel)
            .filter(OfferModel.campaign_id == campaign_id)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def delete(self, offer_id: UUID) -> None:
        model = self._session.get(OfferModel, offer_id)
        if model is not None:
            self._session.delete(model)

    def delete_by_campaign_id(self, campaign_id: UUID) -> None:
        self._session.query(OfferModel).filter(
            OfferModel.campaign_id == campaign_id
        ).delete()

    # ------------------------------------------------------------------
    # Mapping helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_domain(model: OfferModel) -> Offer:
        return OfferFactory.create(
            campaign_id=model.campaign_id,
            offer_type=OfferType(model.type),
            parameters=model.parameters,
            id=model.id,
        )

    @staticmethod
    def _to_orm(offer: Offer) -> OfferModel:
        return OfferModel(
            id=offer.id,
            campaign_id=offer.campaign_id,
            type=offer.type.value,
            parameters=offer.parameters,
        )
