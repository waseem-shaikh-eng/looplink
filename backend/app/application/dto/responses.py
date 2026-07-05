from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel

from app.domain.entities.campaign import Campaign
from app.domain.entities.offer import Offer


# ------------------------------------------------------------------
# Internal (Builder) Responses — includes internal IDs, version, etc.
# ------------------------------------------------------------------


class OfferDisplayData(BaseModel):
    title: str
    description: str


class OfferResponse(BaseModel):
    id: str
    type: str
    parameters: dict[str, Any]
    display_data: OfferDisplayData

    @classmethod
    def from_domain(cls, offer: Offer) -> OfferResponse:
        return cls(
            id=str(offer.id),
            type=offer.type.value,
            parameters=offer.parameters,
            display_data=OfferDisplayData(**offer.display_data()),
        )


class CampaignResponse(BaseModel):
    id: str
    public_token: str
    name: str
    description: Optional[str]
    status: str
    version: int
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    offers: List[OfferResponse] = []
    can_edit: bool = False
    allowed_actions: List[str] = []

    @classmethod
    def from_domain(
        cls,
        campaign: Campaign,
        offers: Optional[List[Offer]] = None,
    ) -> CampaignResponse:
        return cls(
            id=str(campaign.id),
            public_token=campaign.public_token,
            name=campaign.name,
            description=campaign.description,
            status=campaign.status.value,
            version=campaign.version,
            starts_at=campaign.starts_at,
            ends_at=campaign.ends_at,
            created_at=campaign.created_at,
            updated_at=campaign.updated_at,
            offers=[OfferResponse.from_domain(o) for o in (offers or [])],
            can_edit=campaign.can_edit(),
            allowed_actions=campaign.allowed_actions(),
        )


class CampaignListResponse(BaseModel):
    campaigns: List[CampaignResponse]


# ------------------------------------------------------------------
# Public Responses — exposed on the landing page
# ------------------------------------------------------------------


class PublicOfferResponse(BaseModel):
    type: str
    display_data: OfferDisplayData

    @classmethod
    def from_domain(cls, offer: Offer) -> PublicOfferResponse:
        return cls(
            type=offer.type.value,
            display_data=OfferDisplayData(**offer.display_data()),
        )


class PublicCampaignResponse(BaseModel):
    """Safe for external consumers — no internal IDs, no version."""

    name: str
    description: Optional[str]
    status: str
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    offers: List[PublicOfferResponse] = []

    @classmethod
    def from_domain(
        cls,
        campaign: Campaign,
        offers: Optional[List[Offer]] = None,
    ) -> PublicCampaignResponse:
        return cls(
            name=campaign.name,
            description=campaign.description,
            status=campaign.status.value,
            starts_at=campaign.starts_at,
            ends_at=campaign.ends_at,
            offers=[PublicOfferResponse.from_domain(o) for o in (offers or [])],
        )


# ------------------------------------------------------------------
# Distribution
# ------------------------------------------------------------------


class DistributionResponse(BaseModel):
    url: str
    qr_code_base64: str


# ------------------------------------------------------------------
# Enrollment
# ------------------------------------------------------------------


class EnrollmentResponse(BaseModel):
    id: str
    enrolled_at: datetime
    already_enrolled: bool = False
