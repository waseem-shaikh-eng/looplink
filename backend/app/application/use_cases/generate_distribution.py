from __future__ import annotations

from uuid import UUID

from app.application.dto.responses import DistributionResponse
from app.application.interfaces import QRCodeService
from app.domain.exceptions import EntityNotFound
from app.domain.interfaces.unit_of_work import UnitOfWork


class GenerateDistributionUseCase:
    """Generates the public URL and QR code for a campaign."""

    def __init__(self, uow: UnitOfWork, qr_service: QRCodeService) -> None:
        self._uow = uow
        self._qr_service = qr_service

    def execute(self, campaign_id: UUID, base_url: str) -> DistributionResponse:
        campaign = self._uow.campaigns.get_by_id(campaign_id)
        if campaign is None:
            raise EntityNotFound(f"Campaign {campaign_id} not found")

        public_url = f"{base_url}/c/{campaign.public_token}"
        qr_code = self._qr_service.generate(public_url)

        return DistributionResponse(url=public_url, qr_code_base64=qr_code)
