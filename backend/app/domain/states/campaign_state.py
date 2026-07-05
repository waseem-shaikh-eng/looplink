from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.domain.entities.campaign import Campaign


class CampaignState(ABC):
    """Interface for campaign lifecycle states (State Pattern).

    Each concrete state encapsulates the behavior allowed
    for a given CampaignStatus. Transitions are forward-only.
    """

    @abstractmethod
    def schedule(self, campaign: Campaign, starts_at: datetime) -> None:
        """Transition to Scheduled state."""

    @abstractmethod
    def launch(self, campaign: Campaign) -> None:
        """Transition to Live state."""

    @abstractmethod
    def end(self, campaign: Campaign) -> None:
        """Transition to Ended state."""

    @abstractmethod
    def can_edit(self) -> bool:
        """Whether the campaign's basic fields may be edited."""

    @abstractmethod
    def allowed_actions(self) -> List[str]:
        """List of UI actions available in this state."""
