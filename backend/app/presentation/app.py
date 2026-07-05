"""FastAPI application factory.

Wires middleware, routes, and lifecycle hooks.
This is the composition root of the dependency graph.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database.session import init_db
from app.presentation.api import api_router
from app.presentation.middleware.error_handler import add_exception_handlers


def create_app() -> FastAPI:
    app = FastAPI(
        title="Campaign Builder API",
        version="0.1.0",
        docs_url="/docs",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")

    add_exception_handlers(app)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    return app
