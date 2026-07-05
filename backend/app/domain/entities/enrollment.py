from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from app.domain.enums.identity_type import IdentityType


class Enrollment:
    """Domain entity representing a shopper's enrollment in a campaign."""

    def __init__(
        self,
        campaign_id: UUID,
        identity: str,
        identity_type: IdentityType,
        normalized_identity: str,
        id: Optional[UUID] = None,
        enrolled_at: Optional[datetime] = None,
    ) -> None:
        self.id: UUID = id or uuid4()
        self.campaign_id: UUID = campaign_id
        self.identity: str = identity
        self.identity_type: IdentityType = identity_type
        self.normalized_identity: str = normalized_identity
        self.enrolled_at: datetime = enrolled_at or datetime.now(timezone.utc)
