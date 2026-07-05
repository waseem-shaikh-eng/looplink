"""Maps domain exceptions to HTTP responses.

This is the outermost layer — it translates domain-language errors
into HTTP responses without leaking exception internals to clients.
"""

from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    BusinessRuleViolation,
    DomainError,
    EntityNotFound,
    InvalidStateTransition,
    OptimisticLockError,
)


def _handler(status_code: int):
    """Factory that creates an exception handler returning a fixed status."""

    async def handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(status_code=status_code, content={"detail": str(exc)})

    return handler


def add_exception_handlers(app: FastAPI) -> None:
    """Register all domain exception → HTTP mappings on the FastAPI app."""
    app.add_exception_handler(EntityNotFound, _handler(404))
    app.add_exception_handler(OptimisticLockError, _handler(409))
    app.add_exception_handler(BusinessRuleViolation, _handler(422))
    app.add_exception_handler(InvalidStateTransition, _handler(422))
    app.add_exception_handler(ValueError, _handler(422))
