from enum import Enum


class OfferType(str, Enum):
    PRODUCT_PERCENT_DISCOUNT = "product_percent_discount"
    CART_FIXED_DISCOUNT = "cart_fixed_discount"
    STICKER_EARN = "sticker_earn"
