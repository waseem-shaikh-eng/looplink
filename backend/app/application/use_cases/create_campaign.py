from __future__ import annotations

from app.application.dto.requests import CreateCampaignRequest
from app.application.dto.responses import CampaignResponse
from app.domain.factories.campaign_factory import CampaignFactory
from app.domain.interfaces.unit_of_work import UnitOfWork


class CreateCampaignUseCase:
    """Creates a new campaign in Draft status."""

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def execute(self, request: CreateCampaignRequest) -> CampaignResponse:
        campaign = CampaignFactory.create_draft(
            name=request.name,
            description=request.description,
            starts_at=request.starts_at,
            ends_at=request.ends_at,
        )
        self._uow.campaigns.save(campaign)
        self._uow.commit()
        return CampaignResponse.from_domain(campaign)
