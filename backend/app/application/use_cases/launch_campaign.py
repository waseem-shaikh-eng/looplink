from __future__ import annotations

from uuid import UUID

from app.application.dto.responses import CampaignResponse
from app.domain.exceptions import EntityNotFound, OptimisticLockError
from app.domain.interfaces.unit_of_work import UnitOfWork


class LaunchCampaignUseCase:
    """Transitions a campaign from Scheduled to Live.

    Domain invariants enforced by ScheduledState.launch():
    - Requires at least one offer
    """

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def execute(self, campaign_id: UUID, version: int) -> CampaignResponse:
        campaign = self._uow.campaigns.get_by_id(campaign_id)
        if campaign is None:
            raise EntityNotFound(f"Campaign {campaign_id} not found")

        if campaign.version != version:
            raise OptimisticLockError(
                f"Campaign {campaign_id} has been modified. "
                f"Expected version {version}, current version {campaign.version}."
            )

        offers = self._uow.offers.get_by_campaign_id(campaign_id)
        campaign.offers = offers

        campaign.launch()

        self._uow.campaigns.save(campaign)
        self._uow.commit()

        return CampaignResponse.from_domain(campaign, offers)
