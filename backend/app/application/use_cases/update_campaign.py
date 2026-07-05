from __future__ import annotations

from uuid import UUID

from app.application.dto.requests import UpdateCampaignRequest
from app.application.dto.responses import CampaignResponse
from app.domain.exceptions import BusinessRuleViolation, EntityNotFound, OptimisticLockError
from app.domain.interfaces.unit_of_work import UnitOfWork


class UpdateCampaignUseCase:
    """Updates a draft campaign's basic fields.

    Validates that the client-provided version matches the current
    entity version to prevent lost updates (optimistic locking).
    """

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def execute(
        self, campaign_id: UUID, request: UpdateCampaignRequest
    ) -> CampaignResponse:
        campaign = self._uow.campaigns.get_by_id(campaign_id)
        if campaign is None:
            raise EntityNotFound(f"Campaign {campaign_id} not found")

        if campaign.version != request.version:
            raise OptimisticLockError(
                f"Campaign {campaign_id} has been modified. "
                f"Expected version {request.version}, current version {campaign.version}."
            )

        if not campaign.can_edit():
            raise BusinessRuleViolation(
                "Only draft campaigns can be edited. "
                f"Current status: {campaign.status.value}"
            )

        if request.name is not None:
            campaign.name = request.name
        if request.description is not None:
            campaign.description = request.description
        if request.starts_at is not None:
            campaign.starts_at = request.starts_at
        if request.ends_at is not None:
            campaign.ends_at = request.ends_at

        self._uow.campaigns.save(campaign)
        self._uow.commit()

        offers = self._uow.offers.get_by_campaign_id(campaign_id)
        return CampaignResponse.from_domain(campaign, offers)
