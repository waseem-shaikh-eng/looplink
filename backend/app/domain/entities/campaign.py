from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import BusinessRuleViolation
from app.domain.value_objects.campaign_token import CampaignToken

if TYPE_CHECKING:
    from app.domain.entities.offer import Offer
    from app.domain.states.campaign_state import CampaignState


class Campaign:
    """Core domain entity representing a marketing campaign.

    Delegates lifecycle behavior to a State object (State Pattern).
    Carries a version field for optimistic locking.
    """

    def __init__(
        self,
        name: str,
        description: Optional[str] = None,
        starts_at: Optional[datetime] = None,
        ends_at: Optional[datetime] = None,
        id: Optional[UUID] = None,
        public_token: Optional[str] = None,
        status: CampaignStatus = CampaignStatus.DRAFT,
        version: int = 1,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        self.id: UUID = id or uuid4()
        self.public_token: str = public_token or str(CampaignToken.generate())
        self.name: str = name
        self.description: Optional[str] = description
        self.status: CampaignStatus = status
        self.version: int = version
        self.starts_at: Optional[datetime] = starts_at
        self.ends_at: Optional[datetime] = ends_at
        self.created_at: datetime = created_at or datetime.now(timezone.utc)
        self.updated_at: datetime = updated_at or datetime.now(timezone.utc)
        self._offers: List[Offer] = []
        self._state: CampaignState = self._resolve_state()

    # ------------------------------------------------------------------
    # Offer management
    # ------------------------------------------------------------------

    @property
    def offers(self) -> List[Offer]:
        return list(self._offers)

    @offers.setter
    def offers(self, value: List[Offer]) -> None:
        self._offers = list(value)

    def add_offer(self, offer: Offer) -> None:
        self._offers.append(offer)

    def remove_offer(self, offer_id: UUID) -> None:
        self._offers = [o for o in self._offers if o.id != offer_id]

    # ------------------------------------------------------------------
    # Window validation
    # ------------------------------------------------------------------

    def validate_window(self, require_future_starts: bool = True) -> None:
        now = datetime.now(timezone.utc)
        if self.starts_at and self.ends_at:
            if self.ends_at <= self.starts_at:
                raise BusinessRuleViolation(
                    "ends_at must be after starts_at"
                )
        if require_future_starts and self.starts_at:
            if self.starts_at <= now:
                raise BusinessRuleViolation(
                    "starts_at must be in the future"
                )

    def validate_has_offers(self) -> None:
        if not self._offers:
            raise BusinessRuleViolation(
                "Campaign must have at least one offer"
            )

    # ------------------------------------------------------------------
    # State resolution
    # ------------------------------------------------------------------

    def _resolve_state(self) -> CampaignState:
        from app.domain.states import DraftState, EndedState, LiveState, ScheduledState

        mapping = {
            CampaignStatus.DRAFT: DraftState,
            CampaignStatus.SCHEDULED: ScheduledState,
            CampaignStatus.LIVE: LiveState,
            CampaignStatus.ENDED: EndedState,
        }
        return mapping[self.status]()

    # ------------------------------------------------------------------
    # Lifecycle transitions — delegated to current state
    # ------------------------------------------------------------------

    def schedule(self, starts_at: datetime) -> None:
        self._state.schedule(self, starts_at)

    def launch(self) -> None:
        self._state.launch(self)

    def end(self) -> None:
        self._state.end(self)

    def can_edit(self) -> bool:
        return self._state.can_edit()

    def allowed_actions(self) -> List[str]:
        return self._state.allowed_actions()

    def increment_version(self) -> None:
        self.version += 1
