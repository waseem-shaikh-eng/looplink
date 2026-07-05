from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from app.domain.exceptions import InvalidStateTransition
from app.domain.states.campaign_state import CampaignState

if TYPE_CHECKING:
    from app.domain.entities.campaign import Campaign


class EndedState(CampaignState):
    """A terminal state. No further transitions are allowed."""

    def schedule(self, campaign: Campaign, starts_at: datetime) -> None:
        raise InvalidStateTransition("Cannot schedule a campaign that has ended.")

    def launch(self, campaign: Campaign) -> None:
        raise InvalidStateTransition("Cannot launch a campaign that has ended.")

    def end(self, campaign: Campaign) -> None:
        raise InvalidStateTransition("Campaign has already ended.")

    def can_edit(self) -> bool:
        return False

    def allowed_actions(self) -> List[str]:
        return []
