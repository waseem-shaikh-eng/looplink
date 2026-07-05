from fastapi import APIRouter

from app.presentation.api.campaign_routes import router as campaign_router
from app.presentation.api.public_routes import router as public_router

api_router = APIRouter()
api_router.include_router(campaign_router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(public_router, prefix="/c", tags=["public"])

__all__ = ["api_router"]
