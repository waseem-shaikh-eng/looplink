from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from app.domain.entities.campaign import Campaign
from app.domain.value_objects.campaign_token import CampaignToken


class CampaignFactory:
    """Factory for creating Campaign aggregates with safe defaults."""

    @staticmethod
    def create_draft(
        name: str,
        description: Optional[str] = None,
        starts_at: Optional[datetime] = None,
        ends_at: Optional[datetime] = None,
        id: Optional[UUID] = None,
    ) -> Campaign:
        return Campaign(
            name=name,
            description=description,
            starts_at=starts_at,
            ends_at=ends_at,
            id=id,
            public_token=str(CampaignToken.generate()),
        )
