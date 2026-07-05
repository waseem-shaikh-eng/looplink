from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import BusinessRuleViolation, InvalidStateTransition
from app.domain.states.campaign_state import CampaignState

if TYPE_CHECKING:
    from app.domain.entities.campaign import Campaign


class DraftState(CampaignState):
    """A newly created campaign that can be edited, scheduled, or launched."""

    def schedule(self, campaign: Campaign, starts_at: datetime) -> None:
        if starts_at <= datetime.now(timezone.utc):
            raise BusinessRuleViolation("starts_at must be in the future")

        campaign.starts_at = starts_at
        campaign.validate_window(require_future_starts=True)
        campaign.validate_has_offers()

        from app.domain.states.scheduled_state import ScheduledState

        campaign.status = CampaignStatus.SCHEDULED
        campaign._state = ScheduledState()

    def launch(self, campaign: Campaign) -> None:
        campaign.validate_window(require_future_starts=False)
        campaign.validate_has_offers()

        from app.domain.states.live_state import LiveState

        campaign.status = CampaignStatus.LIVE
        campaign._state = LiveState()

    def end(self, campaign: Campaign) -> None:
        raise InvalidStateTransition("Cannot end a draft campaign.")

    def can_edit(self) -> bool:
        return True

    def allowed_actions(self) -> List[str]:
        return ["edit", "schedule", "launch"]
