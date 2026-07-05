"""Internal Builder API — campaign CRUD, lifecycle, offers, distribution.

Every handler is a thin adapter: parse request → call use case → return response.
No business logic here — that belongs in domain and application layers.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.application.dto.requests import (
    CreateCampaignRequest,
    LifecycleRequest,
    ScheduleCampaignRequest,
    SetOffersRequest,
    UpdateCampaignRequest,
)
from app.application.dto.responses import (
    CampaignListResponse,
    CampaignResponse,
    DistributionResponse,
)
from app.application.use_cases import (
    CreateCampaignUseCase,
    EndCampaignUseCase,
    GenerateDistributionUseCase,
    LaunchCampaignUseCase,
    ScheduleCampaignUseCase,
    SetOffersUseCase,
    UpdateCampaignUseCase,
)
from app.domain.exceptions import EntityNotFound
from app.presentation.dependencies import (
    get_create_campaign_use_case,
    get_end_campaign_use_case,
    get_generate_distribution_use_case,
    get_launch_campaign_use_case,
    get_schedule_campaign_use_case,
    get_set_offers_use_case,
    get_update_campaign_use_case,
    get_uow,
)
from app.infrastructure.repositories.unit_of_work import SQLAlchemyUnitOfWork

router = APIRouter()


# ------------------------------------------------------------------
# CRUD
# ------------------------------------------------------------------


@router.get("", response_model=CampaignListResponse)
def list_campaigns(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> CampaignListResponse:
    campaigns = uow.campaigns.list_all()
    results = []
    for c in campaigns:
        offers = uow.offers.get_by_campaign_id(c.id)
        results.append(CampaignResponse.from_domain(c, offers))
    return CampaignListResponse(campaigns=results)


@router.post("", response_model=CampaignResponse, status_code=201)
def create_campaign(
    body: CreateCampaignRequest,
    use_case: CreateCampaignUseCase = Depends(get_create_campaign_use_case),
) -> CampaignResponse:
    return use_case.execute(body)


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: UUID,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> CampaignResponse:
    campaign = uow.campaigns.get_by_id(campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail=f"Campaign {campaign_id} not found")
    offers = uow.offers.get_by_campaign_id(campaign_id)
    return CampaignResponse.from_domain(campaign, offers)


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: UUID,
    body: UpdateCampaignRequest,
    use_case: UpdateCampaignUseCase = Depends(get_update_campaign_use_case),
) -> CampaignResponse:
    return use_case.execute(campaign_id, body)


@router.delete("/{campaign_id}", status_code=204)
def delete_campaign(
    campaign_id: UUID,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> None:
    try:
        uow.campaigns.delete(campaign_id)
        uow.commit()
    except EntityNotFound:
        raise HTTPException(status_code=404, detail=f"Campaign {campaign_id} not found")


# ------------------------------------------------------------------
# Lifecycle transitions — each is a POST with version for optimistic locking
# ------------------------------------------------------------------


@router.post("/{campaign_id}/schedule", response_model=CampaignResponse)
def schedule_campaign(
    campaign_id: UUID,
    body: ScheduleCampaignRequest,
    use_case: ScheduleCampaignUseCase = Depends(get_schedule_campaign_use_case),
) -> CampaignResponse:
    return use_case.execute(campaign_id, body)


@router.post("/{campaign_id}/launch", response_model=CampaignResponse)
def launch_campaign(
    campaign_id: UUID,
    body: LifecycleRequest,
    use_case: LaunchCampaignUseCase = Depends(get_launch_campaign_use_case),
) -> CampaignResponse:
    return use_case.execute(campaign_id, body.version)


@router.post("/{campaign_id}/end", response_model=CampaignResponse)
def end_campaign(
    campaign_id: UUID,
    body: LifecycleRequest,
    use_case: EndCampaignUseCase = Depends(get_end_campaign_use_case),
) -> CampaignResponse:
    return use_case.execute(campaign_id, body.version)


# ------------------------------------------------------------------
# Offers
# ------------------------------------------------------------------


@router.put("/{campaign_id}/offers", response_model=CampaignResponse)
def set_offers(
    campaign_id: UUID,
    body: SetOffersRequest,
    use_case: SetOffersUseCase = Depends(get_set_offers_use_case),
) -> CampaignResponse:
    return use_case.execute(campaign_id, body.offers, body.version)


# ------------------------------------------------------------------
# Distribution
# ------------------------------------------------------------------


@router.get("/{campaign_id}/distribution", response_model=DistributionResponse)
def get_distribution(
    campaign_id: UUID,
    base_url: str = Query("http://localhost:3000", description="Frontend base URL for building the shareable link"),
    use_case: GenerateDistributionUseCase = Depends(get_generate_distribution_use_case),
) -> DistributionResponse:
    return use_case.execute(campaign_id, base_url)
