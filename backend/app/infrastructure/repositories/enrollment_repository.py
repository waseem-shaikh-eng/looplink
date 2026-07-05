from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.enrollment import Enrollment
from app.domain.interfaces.repositories import EnrollmentRepository
from app.domain.value_objects.identity import NormalizedIdentity
from app.infrastructure.database.models import EnrollmentModel


class SQLAlchemyEnrollmentRepository(EnrollmentRepository):
    """SQLAlchemy-backed implementation of EnrollmentRepository."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, enrollment: Enrollment) -> None:
        model = self._to_orm(enrollment)
        self._session.add(model)

    def get_by_id(self, enrollment_id: UUID) -> Optional[Enrollment]:
        model = self._session.get(EnrollmentModel, enrollment_id)
        if model is None:
            return None
        return self._to_domain(model)

    def get_by_campaign_and_identity(
        self, campaign_id: UUID, normalized_identity: NormalizedIdentity
    ) -> Optional[Enrollment]:
        model = (
            self._session.query(EnrollmentModel)
            .filter(
                EnrollmentModel.campaign_id == campaign_id,
                EnrollmentModel.normalized_identity == normalized_identity.value,
            )
            .first()
        )
        if model is None:
            return None
        return self._to_domain(model)

    def get_by_campaign_id(self, campaign_id: UUID) -> List[Enrollment]:
        models = (
            self._session.query(EnrollmentModel)
            .filter(EnrollmentModel.campaign_id == campaign_id)
            .all()
        )
        return [self._to_domain(m) for m in models]

    # ------------------------------------------------------------------
    # Mapping helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_domain(model: EnrollmentModel) -> Enrollment:
        from app.domain.enums.identity_type import IdentityType

        return Enrollment(
            id=model.id,
            campaign_id=model.campaign_id,
            identity=model.identity,
            identity_type=IdentityType(model.identity_type),
            normalized_identity=model.normalized_identity,
            enrolled_at=model.enrolled_at,
        )

    @staticmethod
    def _to_orm(enrollment: Enrollment) -> EnrollmentModel:
        return EnrollmentModel(
            id=enrollment.id,
            campaign_id=enrollment.campaign_id,
            identity=enrollment.identity,
            identity_type=enrollment.identity_type.value,
            normalized_identity=enrollment.normalized_identity,
            enrolled_at=enrollment.enrolled_at,
        )
