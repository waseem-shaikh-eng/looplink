from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import InvalidStateTransition
from app.domain.states.campaign_state import CampaignState

if TYPE_CHECKING:
    from app.domain.entities.campaign import Campaign


class LiveState(CampaignState):
    """A live campaign accepting enrollments. Can be ended."""

    def schedule(self, campaign: Campaign, starts_at: datetime) -> None:
        raise InvalidStateTransition("Cannot schedule a campaign that is already live.")

    def launch(self, campaign: Campaign) -> None:
        raise InvalidStateTransition("Campaign is already live.")

    def end(self, campaign: Campaign) -> None:
        from app.domain.states.ended_state import EndedState

        campaign.status = CampaignStatus.ENDED
        campaign.ends_at = datetime.now(timezone.utc)
        campaign._state = EndedState()

    def can_edit(self) -> bool:
        return False

    def allowed_actions(self) -> List[str]:
        return ["end"]
