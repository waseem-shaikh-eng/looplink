from __future__ import annotations

import uuid
from dataclasses import dataclass


@dataclass(frozen=True)
class CampaignToken:
    """Immutable value object representing a campaign's public token."""

    value: str

    @classmethod
    def generate(cls) -> CampaignToken:
        return cls(value=str(uuid.uuid4()))

    def __str__(self) -> str:
        return self.value
