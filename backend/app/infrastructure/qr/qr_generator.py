from __future__ import annotations

import base64
from io import BytesIO

import qrcode

from app.application.interfaces import QRCodeService


class QRCodeGenerator(QRCodeService):
    """Generates QR codes as base64-encoded PNG images."""

    def generate(self, url: str) -> str:
        qr = qrcode.make(url)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
