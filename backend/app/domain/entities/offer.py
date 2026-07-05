from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional
from uuid import UUID, uuid4

from app.domain.enums.offer_type import OfferType


class Offer(ABC):
    """Abstract base entity for all offer types.

    Each concrete subclass knows how to validate, serialize,
    and present itself (polymorphism over conditionals).
    """

    def __init__(
        self,
        campaign_id: UUID,
        offer_type: OfferType,
        parameters: dict[str, Any],
        id: Optional[UUID] = None,
    ) -> None:
        self.id: UUID = id or uuid4()
        self.campaign_id: UUID = campaign_id
        self.type: OfferType = offer_type
        self.parameters: dict[str, Any] = parameters
        self.validate()

    @abstractmethod
    def validate(self) -> None:
        """Validate that parameters satisfy business rules for this offer type."""

    @abstractmethod
    def to_dict(self) -> dict[str, Any]:
        """Serialize to a plain dictionary for persistence / API responses."""

    @abstractmethod
    def display_data(self) -> dict[str, Any]:
        """Return a consumer-friendly representation for the frontend."""


class ProductPercentDiscountOffer(Offer):
    """Percentage discount on a specific product."""

    def __init__(
        self,
        campaign_id: UUID,
        parameters: dict[str, Any],
        id: Optional[UUID] = None,
    ) -> None:
        super().__init__(campaign_id, OfferType.PRODUCT_PERCENT_DISCOUNT, parameters, id)

    def validate(self) -> None:
        if "percent" not in self.parameters:
            raise ValueError("percent is required for product percent discount")
        percent = self.parameters["percent"]
        if not isinstance(percent, (int, float)) or percent <= 0 or percent > 100:
            raise ValueError("percent must be between 1 and 100")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "type": self.type.value,
            "parameters": self.parameters,
        }

    def display_data(self) -> dict[str, Any]:
        applies_to = self.parameters.get("applies_to", "")
        return {
            "title": f"{self.parameters['percent']}% off select products",
            "description": f"Save {self.parameters['percent']}%{f' on {applies_to}' if applies_to else ''}",
        }


class CartFixedDiscountOffer(Offer):
    """Fixed-amount discount on the entire cart."""

    def __init__(
        self,
        campaign_id: UUID,
        parameters: dict[str, Any],
        id: Optional[UUID] = None,
    ) -> None:
        super().__init__(campaign_id, OfferType.CART_FIXED_DISCOUNT, parameters, id)

    def validate(self) -> None:
        if "amount_off" not in self.parameters:
            raise ValueError("amount_off is required for cart fixed discount")
        amount_off = self.parameters["amount_off"]
        if not isinstance(amount_off, (int, float)) or amount_off <= 0:
            raise ValueError("amount_off must be a positive number")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "type": self.type.value,
            "parameters": self.parameters,
        }

    def display_data(self) -> dict[str, Any]:
        min_basket = self.parameters.get("min_basket", 0)
        desc = f"${self.parameters['amount_off']} off your cart"
        if min_basket:
            desc += f" (min. ${min_basket} basket)"
        return {
            "title": f"${self.parameters['amount_off']} off",
            "description": desc,
        }


class StickerEarnOffer(Offer):
    """Earn stickers / loyalty points with purchase."""

    def __init__(
        self,
        campaign_id: UUID,
        parameters: dict[str, Any],
        id: Optional[UUID] = None,
    ) -> None:
        super().__init__(campaign_id, OfferType.STICKER_EARN, parameters, id)

    def validate(self) -> None:
        if "stickers" not in self.parameters:
            raise ValueError("stickers is required for sticker earn offer")
        stickers = self.parameters["stickers"]
        if not isinstance(stickers, int) or stickers <= 0:
            raise ValueError("stickers must be a positive integer")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "type": self.type.value,
            "parameters": self.parameters,
        }

    def display_data(self) -> dict[str, Any]:
        per_amount = self.parameters.get("per_amount", "")
        desc = f"Earn {self.parameters['stickers']} stickers"
        if per_amount:
            desc += f" per ${per_amount} spent"
        return {
            "title": f"Earn {self.parameters['stickers']} stickers",
            "description": desc,
        }
