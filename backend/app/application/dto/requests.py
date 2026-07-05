from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


def _not_past(v: Optional[datetime]) -> Optional[datetime]:
    if v is None:
        return v
    if v < datetime.now(timezone.utc):
        raise ValueError("Date must be today or later")
    return v


class CreateCampaignRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

    _validate_starts = field_validator("starts_at", "ends_at")(_not_past)


class UpdateCampaignRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    version: int = Field(..., ge=1)


class ScheduleCampaignRequest(BaseModel):
    starts_at: datetime
    version: int = Field(..., ge=1)

    _validate_starts = field_validator("starts_at")(_not_past)


class LifecycleRequest(BaseModel):
    version: int = Field(..., ge=1)


class CreateOfferRequest(BaseModel):
    type: str
    parameters: dict[str, Any]


class SetOffersRequest(BaseModel):
    offers: list[CreateOfferRequest]
    version: int = Field(..., ge=1)


class EnrollRequest(BaseModel):
    identity: str = Field(..., min_length=1)
    identity_type: str = Field(..., pattern=r"^(phone|email)$")
