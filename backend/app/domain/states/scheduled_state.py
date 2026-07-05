from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import InvalidStateTransition
from app.domain.states.campaign_state import CampaignState

if TYPE_CHECKING:
    from app.domain.entities.campaign import Campaign


class ScheduledState(CampaignState):
    """A campaign scheduled for future launch. Can be launched but not edited."""

    def schedule(self, campaign: Campaign, starts_at: datetime) -> None:
        raise InvalidStateTransition("Campaign is already scheduled.")

    def launch(self, campaign: Campaign) -> None:
        campaign.validate_window(require_future_starts=False)
        campaign.validate_has_offers()

        from app.domain.states.live_state import LiveState

        campaign.status = CampaignStatus.LIVE
        campaign._state = LiveState()

    def end(self, campaign: Campaign) -> None:
        raise InvalidStateTransition(
            "Cannot end a scheduled campaign. Launch it first."
        )

    def can_edit(self) -> bool:
        return False

    def allowed_actions(self) -> List[str]:
        return ["launch"]
