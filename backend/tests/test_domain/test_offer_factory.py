"""Tests for the Offer Factory and concrete offer validation."""

from uuid import uuid4

import pytest

from app.domain.enums.offer_type import OfferType
from app.domain.factories.offer_factory import OfferFactory


@pytest.fixture
def campaign_id():
    return uuid4()


class TestOfferFactory:
    def test_create_product_percent_discount(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
            parameters={"percent": 20, "applies_to": "Summer Collection"},
        )
        assert offer.type == OfferType.PRODUCT_PERCENT_DISCOUNT
        assert offer.campaign_id == campaign_id
        assert offer.parameters == {"percent": 20, "applies_to": "Summer Collection"}

    def test_create_cart_fixed_discount(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.CART_FIXED_DISCOUNT,
            parameters={"amount_off": 15, "min_basket": 50},
        )
        assert offer.type == OfferType.CART_FIXED_DISCOUNT
        assert offer.parameters == {"amount_off": 15, "min_basket": 50}

    def test_create_sticker_earn(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.STICKER_EARN,
            parameters={"stickers": 5, "per_amount": 25},
        )
        assert offer.type == OfferType.STICKER_EARN
        assert offer.parameters == {"stickers": 5, "per_amount": 25}

    def test_invalid_type_raises_error(self, campaign_id):
        with pytest.raises(ValueError, match="Unknown offer type"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type="fake_type",  # type: ignore
                parameters={},
            )


class TestProductPercentValidation:
    def test_missing_percent(self, campaign_id):
        with pytest.raises(ValueError, match="percent"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
                parameters={"applies_to": "Summer Collection"},
            )

    def test_percent_out_of_range(self, campaign_id):
        with pytest.raises(ValueError, match="percent"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
                parameters={"percent": 150, "applies_to": "Summer Collection"},
            )

    def test_applies_to_is_optional(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
            parameters={"percent": 20},
        )
        assert offer.type == OfferType.PRODUCT_PERCENT_DISCOUNT

    def test_display_data(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
            parameters={"percent": 20, "applies_to": "Summer Collection"},
        )
        data = offer.display_data()
        assert "20%" in data["title"]
        assert "Summer Collection" in data["description"]

    def test_display_data_without_applies_to(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.PRODUCT_PERCENT_DISCOUNT,
            parameters={"percent": 15},
        )
        data = offer.display_data()
        assert "15%" in data["title"]


class TestCartFixedValidation:
    def test_missing_amount_off(self, campaign_id):
        with pytest.raises(ValueError, match="amount_off"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.CART_FIXED_DISCOUNT,
                parameters={"min_basket": 50},
            )

    def test_negative_amount_off(self, campaign_id):
        with pytest.raises(ValueError, match="amount_off"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.CART_FIXED_DISCOUNT,
                parameters={"amount_off": -5, "min_basket": 50},
            )

    def test_min_basket_is_optional(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.CART_FIXED_DISCOUNT,
            parameters={"amount_off": 15},
        )
        assert offer.type == OfferType.CART_FIXED_DISCOUNT

    def test_display_data_with_min_basket(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.CART_FIXED_DISCOUNT,
            parameters={"amount_off": 15, "min_basket": 50},
        )
        data = offer.display_data()
        assert "$15" in data["title"]
        assert "min" in data["description"]

    def test_display_data_without_min_basket(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.CART_FIXED_DISCOUNT,
            parameters={"amount_off": 10},
        )
        data = offer.display_data()
        assert "$10" in data["title"]


class TestStickerEarnValidation:
    def test_missing_stickers(self, campaign_id):
        with pytest.raises(ValueError, match="stickers"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.STICKER_EARN,
                parameters={"per_amount": 25},
            )

    def test_non_integer_stickers(self, campaign_id):
        with pytest.raises(ValueError, match="stickers"):
            OfferFactory.create(
                campaign_id=campaign_id,
                offer_type=OfferType.STICKER_EARN,
                parameters={"stickers": 1.5, "per_amount": 25},
            )

    def test_per_amount_is_optional(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.STICKER_EARN,
            parameters={"stickers": 5},
        )
        assert offer.type == OfferType.STICKER_EARN

    def test_display_data_with_per_amount(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.STICKER_EARN,
            parameters={"stickers": 5, "per_amount": 25},
        )
        data = offer.display_data()
        assert "5" in data["title"]
        assert "per" in data["description"]

    def test_display_data_without_per_amount(self, campaign_id):
        offer = OfferFactory.create(
            campaign_id=campaign_id,
            offer_type=OfferType.STICKER_EARN,
            parameters={"stickers": 3},
        )
        data = offer.display_data()
        assert "3" in data["title"]
