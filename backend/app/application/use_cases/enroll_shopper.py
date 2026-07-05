from __future__ import annotations

from app.application.dto.requests import EnrollRequest
from app.application.dto.responses import EnrollmentResponse
from app.application.interfaces import IdentityNormalizerService
from app.domain.entities.enrollment import Enrollment
from app.domain.enums.campaign_status import CampaignStatus
from app.domain.enums.identity_type import IdentityType
from app.domain.exceptions import BusinessRuleViolation, EntityNotFound
from app.domain.interfaces.unit_of_work import UnitOfWork
from app.domain.value_objects.identity import Identity


class EnrollShopperUseCase:
    """Enrolls a shopper in a campaign by public token.

    Handles duplicate detection: if the same normalized identity
    already exists for this campaign, returns the existing enrollment.
    """

    def __init__(self, uow: UnitOfWork, normalizer: IdentityNormalizerService) -> None:
        self._uow = uow
        self._normalizer = normalizer

    def execute(self, token: str, request: EnrollRequest) -> EnrollmentResponse:
        campaign = self._uow.campaigns.get_by_public_token(token)
        if campaign is None:
            raise EntityNotFound(f"Campaign with token {token} not found")

        if campaign.status != CampaignStatus.LIVE:
            raise BusinessRuleViolation(
                f"Cannot enroll in a {campaign.status.value} campaign. "
                "Only live campaigns accept enrollments."
            )

        identity = Identity(
            value=request.identity,
            type=IdentityType(request.identity_type),
        )
        normalized = self._normalizer.normalize(identity)

        existing = self._uow.enrollments.get_by_campaign_and_identity(
            campaign_id=campaign.id,
            normalized_identity=normalized,
        )
        if existing is not None:
            return EnrollmentResponse(
                id=str(existing.id),
                enrolled_at=existing.enrolled_at,
                already_enrolled=True,
            )

        enrollment = Enrollment(
            campaign_id=campaign.id,
            identity=identity.value,
            identity_type=identity.type,
            normalized_identity=normalized.value,
        )

        self._uow.enrollments.save(enrollment)
        self._uow.commit()

        return EnrollmentResponse(
            id=str(enrollment.id),
            enrolled_at=enrollment.enrolled_at,
        )
