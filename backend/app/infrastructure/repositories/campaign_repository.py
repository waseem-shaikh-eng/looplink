from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.campaign import Campaign
from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import EntityNotFound, OptimisticLockError
from app.domain.interfaces.repositories import CampaignRepository
from app.infrastructure.database.models import CampaignModel


class SQLAlchemyCampaignRepository(CampaignRepository):
    """SQLAlchemy-backed implementation of CampaignRepository.

    Maps between CampaignModel (ORM) and Campaign (domain entity).
    Handles optimistic locking via the version field.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, campaign: Campaign) -> None:
        existing = self._session.get(CampaignModel, campaign.id)
        if existing is None:
            model = CampaignModel(
                id=campaign.id,
                public_token=campaign.public_token,
                name=campaign.name,
                description=campaign.description,
                status=campaign.status.value,
                version=campaign.version,
                starts_at=campaign.starts_at,
                ends_at=campaign.ends_at,
                created_at=campaign.created_at,
                updated_at=campaign.updated_at,
            )
            self._session.add(model)
        else:
            if existing.version != campaign.version:
                raise OptimisticLockError(
                    f"Campaign {campaign.id} has been modified by another user. "
                    f"Expected version {existing.version}, got {campaign.version}."
                )
            campaign.increment_version()
            existing.name = campaign.name
            existing.description = campaign.description
            existing.status = campaign.status.value
            existing.version = campaign.version
            existing.starts_at = campaign.starts_at
            existing.ends_at = campaign.ends_at
            existing.updated_at = campaign.updated_at

    def get_by_id(self, campaign_id: UUID) -> Optional[Campaign]:
        model = self._session.get(CampaignModel, campaign_id)
        if model is None:
            return None
        return self._to_domain(model)

    def get_by_public_token(self, token: str) -> Optional[Campaign]:
        model = (
            self._session.query(CampaignModel)
            .filter(CampaignModel.public_token == token)
            .first()
        )
        if model is None:
            return None
        return self._to_domain(model)

    def list_all(self) -> List[Campaign]:
        models = self._session.query(CampaignModel).order_by(CampaignModel.created_at.desc()).all()
        return [self._to_domain(m) for m in models]

    def delete(self, campaign_id: UUID) -> None:
        model = self._session.get(CampaignModel, campaign_id)
        if model is None:
            raise EntityNotFound(f"Campaign {campaign_id} not found")
        self._session.delete(model)

    # ------------------------------------------------------------------
    # Mapping helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_domain(model: CampaignModel) -> Campaign:
        return Campaign(
            id=model.id,
            public_token=model.public_token,
            name=model.name,
            description=model.description,
            status=CampaignStatus(model.status),
            version=model.version,
            starts_at=model.starts_at,
            ends_at=model.ends_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_orm(campaign: Campaign) -> CampaignModel:
        return CampaignModel(
            id=campaign.id,
            public_token=campaign.public_token,
            name=campaign.name,
            description=campaign.description,
            status=campaign.status.value,
            version=campaign.version,
            starts_at=campaign.starts_at,
            ends_at=campaign.ends_at,
            created_at=campaign.created_at,
            updated_at=campaign.updated_at,
        )
