"""Public API — campaign landing page and shopper enrollment.

These endpoints use public tokens instead of database IDs.
Never expose internal identifiers to external consumers.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.application.dto.requests import EnrollRequest
from app.application.dto.responses import EnrollmentResponse, PublicCampaignResponse
from app.application.use_cases.enroll_shopper import EnrollShopperUseCase
from app.domain.exceptions import EntityNotFound
from app.presentation.dependencies import get_enroll_shopper_use_case, get_uow
from app.infrastructure.repositories.unit_of_work import SQLAlchemyUnitOfWork

router = APIRouter()


@router.get("/{token}", response_model=PublicCampaignResponse)
def get_public_campaign(
    token: str,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> PublicCampaignResponse:
    """Return campaign data for the public landing page."""
    campaign = uow.campaigns.get_by_public_token(token)
    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found. The link may be invalid.",
        )
    offers = uow.offers.get_by_campaign_id(campaign.id)
    return PublicCampaignResponse.from_domain(campaign, offers)


@router.post("/{token}/enroll", response_model=EnrollmentResponse)
def enroll(
    token: str,
    body: EnrollRequest,
    use_case: EnrollShopperUseCase = Depends(get_enroll_shopper_use_case),
) -> EnrollmentResponse:
    """Enroll a shopper in a campaign using its public token."""
    return use_case.execute(token, body)
