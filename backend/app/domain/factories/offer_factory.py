from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from app.domain.entities.offer import (
    CartFixedDiscountOffer,
    Offer,
    ProductPercentDiscountOffer,
    StickerEarnOffer,
)
from app.domain.enums.offer_type import OfferType


class OfferFactory:
    """Factory that creates the correct Offer subclass based on OfferType.

    Adding a new offer type requires exactly:
    1. A new Offer subclass (Open/Closed Principle — extension without modification)
    2. Registering it in the _registry dict below.
    """

    _registry: dict[OfferType, type[Offer]] = {
        OfferType.PRODUCT_PERCENT_DISCOUNT: ProductPercentDiscountOffer,
        OfferType.CART_FIXED_DISCOUNT: CartFixedDiscountOffer,
        OfferType.STICKER_EARN: StickerEarnOffer,
    }

    @classmethod
    def create(
        cls,
        campaign_id: UUID,
        offer_type: OfferType,
        parameters: dict[str, Any],
        id: Optional[UUID] = None,
    ) -> Offer:
        offer_cls = cls._registry.get(offer_type)
        if offer_cls is None:
            raise ValueError(f"Unknown offer type: {offer_type}")
        return offer_cls(campaign_id=campaign_id, parameters=parameters, id=id)

    @classmethod
    def register_type(cls, offer_type: OfferType, offer_cls: type[Offer]) -> None:
        """Allow runtime registration of new offer types (plugin pattern)."""
        cls._registry[offer_type] = offer_cls
