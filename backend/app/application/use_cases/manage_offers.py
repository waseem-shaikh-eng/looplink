from __future__ import annotations

from typing import List
from uuid import UUID

from app.application.dto.requests import CreateOfferRequest
from app.application.dto.responses import CampaignResponse
from app.domain.enums.offer_type import OfferType
from app.domain.exceptions import BusinessRuleViolation, EntityNotFound
from app.domain.factories.offer_factory import OfferFactory
from app.domain.interfaces.unit_of_work import UnitOfWork


class SetOffersUseCase:
    """Replaces all offers on a campaign atomically.

    Only allowed on draft campaigns.
    """

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def execute(
        self, campaign_id: UUID, offer_requests: List[CreateOfferRequest], version: int
    ) -> CampaignResponse:
        campaign = self._uow.campaigns.get_by_id(campaign_id)
        if campaign is None:
            raise EntityNotFound(f"Campaign {campaign_id} not found")

        if campaign.version != version:
            raise BusinessRuleViolation(
                f"Campaign {campaign_id} has been modified. "
                f"Expected version {version}, current version {campaign.version}."
            )

        if not campaign.can_edit():
            raise BusinessRuleViolation(
                "Cannot modify offers on a non-draft campaign."
            )

        # Delete existing offers and create new ones
        self._uow.offers.delete_by_campaign_id(campaign_id)

        offers = []
        for req in offer_requests:
            offer = OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType(req.type),
                parameters=req.parameters,
            )
            self._uow.offers.save(offer)
            offers.append(offer)

        self._uow.commit()

        return CampaignResponse.from_domain(campaign, offers)
