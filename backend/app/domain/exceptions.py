class DomainError(Exception):
    """Base exception for all domain errors."""


class BusinessRuleViolation(DomainError):
    """Raised when a business rule is violated."""


class InvalidStateTransition(BusinessRuleViolation):
    """Raised when an invalid campaign state transition is attempted."""


class EntityNotFound(DomainError):
    """Raised when a requested entity does not exist."""


class DuplicateEnrollment(DomainError):
    """Raised when a duplicate enrollment is detected."""


class OptimisticLockError(DomainError):
    """Raised when a version conflict is detected during update."""
