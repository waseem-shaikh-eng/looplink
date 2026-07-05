from __future__ import annotations

from dataclasses import dataclass

from app.domain.enums.identity_type import IdentityType


@dataclass(frozen=True)
class Identity:
    """Raw identity value provided during enrollment."""

    value: str
    type: IdentityType


@dataclass(frozen=True)
class NormalizedIdentity:
    """Normalized identity used for duplicate detection."""

    value: str
    type: IdentityType
