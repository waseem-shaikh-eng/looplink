from __future__ import annotations

import re

from app.application.interfaces import IdentityNormalizerService
from app.domain.enums.identity_type import IdentityType
from app.domain.value_objects.identity import Identity, NormalizedIdentity


class IdentityNormalizer(IdentityNormalizerService):
    """Normalizes raw identity values for duplicate detection.

    Email:  trim + lowercase
    Phone:  strip spaces, parentheses, dashes, plus signs
    """

    @staticmethod
    def normalize_email(raw: str) -> str:
        return raw.strip().lower()

    @staticmethod
    def normalize_phone(raw: str) -> str:
        return re.sub(r"[\s\(\)\-\+]+", "", raw)

    def normalize(self, identity: Identity) -> NormalizedIdentity:
        if identity.type == IdentityType.EMAIL:
            return NormalizedIdentity(
                value=self.normalize_email(identity.value),
                type=IdentityType.EMAIL,
            )
        return NormalizedIdentity(
            value=self.normalize_phone(identity.value),
            type=IdentityType.PHONE,
        )
