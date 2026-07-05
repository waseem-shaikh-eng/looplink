from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, TypeDecorator
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, relationship


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class UUID(TypeDecorator):
    """Portable UUID column type for SQLAlchemy.

    Stores UUIDs as 36-character strings for maximum DB compatibility.
    """

    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value: object | None, dialect: object) -> str | None:
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value: str | None, dialect: object) -> uuid.UUID | None:
        if value is None:
            return None
        return uuid.UUID(value)


class CampaignModel(Base):
    __tablename__ = "campaigns"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    public_token = Column(String(36), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(String(20), nullable=False, default="draft")
    version = Column(Integer, nullable=False, default=1)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=_utcnow, onupdate=_utcnow
    )

    offers = relationship("OfferModel", back_populates="campaign", cascade="all, delete-orphan")
    enrollments = relationship(
        "EnrollmentModel", back_populates="campaign", cascade="all, delete-orphan"
    )


class OfferModel(Base):
    __tablename__ = "offers"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        UUID, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(String(50), nullable=False)
    parameters = Column(JSON, nullable=False)

    campaign = relationship("CampaignModel", back_populates="offers")


class EnrollmentModel(Base):
    __tablename__ = "enrollments"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        UUID, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False
    )
    identity = Column(String(255), nullable=False)
    normalized_identity = Column(String(255), nullable=False)
    identity_type = Column(String(20), nullable=False)
    enrolled_at = Column(DateTime, nullable=False, default=_utcnow)

    campaign = relationship("CampaignModel", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint(
            "campaign_id", "normalized_identity", name="uq_enrollment_campaign_identity"
        ),
    )
