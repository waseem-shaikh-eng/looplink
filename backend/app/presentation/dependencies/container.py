"""Dependency Injection container wiring.

Clean Architecture dictates that outer layers wire inner layers.
FastAPI's Depends() is the composition root — it resolves the full
dependency graph at request time without service locator antipattern.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.create_campaign import CreateCampaignUseCase
from app.application.use_cases.end_campaign import EndCampaignUseCase
from app.application.use_cases.enroll_shopper import EnrollShopperUseCase
from app.application.use_cases.generate_distribution import GenerateDistributionUseCase
from app.application.use_cases.launch_campaign import LaunchCampaignUseCase
from app.application.use_cases.manage_offers import SetOffersUseCase
from app.application.use_cases.schedule_campaign import ScheduleCampaignUseCase
from app.application.use_cases.update_campaign import UpdateCampaignUseCase
from app.infrastructure.database.session import get_session
from app.infrastructure.normalization.identity_normalizer import IdentityNormalizer
from app.infrastructure.qr.qr_generator import QRCodeGenerator
from app.infrastructure.repositories.unit_of_work import SQLAlchemyUnitOfWork


def get_uow(session: Session = Depends(get_session)) -> SQLAlchemyUnitOfWork:
    return SQLAlchemyUnitOfWork(session)


def get_qr_service() -> QRCodeGenerator:
    return QRCodeGenerator()


def get_identity_normalizer() -> IdentityNormalizer:
    return IdentityNormalizer()


def get_create_campaign_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> CreateCampaignUseCase:
    return CreateCampaignUseCase(uow)


def get_update_campaign_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> UpdateCampaignUseCase:
    return UpdateCampaignUseCase(uow)


def get_schedule_campaign_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> ScheduleCampaignUseCase:
    return ScheduleCampaignUseCase(uow)


def get_launch_campaign_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> LaunchCampaignUseCase:
    return LaunchCampaignUseCase(uow)


def get_end_campaign_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> EndCampaignUseCase:
    return EndCampaignUseCase(uow)


def get_set_offers_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
) -> SetOffersUseCase:
    return SetOffersUseCase(uow)


def get_generate_distribution_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
    qr: QRCodeGenerator = Depends(get_qr_service),
) -> GenerateDistributionUseCase:
    return GenerateDistributionUseCase(uow, qr)


def get_enroll_shopper_use_case(
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
    normalizer: IdentityNormalizer = Depends(get_identity_normalizer),
) -> EnrollShopperUseCase:
    return EnrollShopperUseCase(uow, normalizer)
