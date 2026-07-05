from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.value_objects.identity import Identity, NormalizedIdentity


class QRCodeService(ABC):
    """Abstract QR code generator — implemented in infrastructure."""

    @abstractmethod
    def generate(self, url: str) -> str:
        ...


class IdentityNormalizerService(ABC):
    """Abstract identity normalizer — implemented in infrastructure."""

    @abstractmethod
    def normalize(self, identity: Identity) -> NormalizedIdentity:
        ...
