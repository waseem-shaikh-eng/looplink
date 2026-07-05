from __future__ import annotations

from datetime import datetime

from app.domain.exceptions import BusinessRuleViolation


class CampaignValidator:
    """Cross-field validation rules that don't belong to a single entity.

    These validators supplement domain-level invariants with
    broader checks involving multiple fields or entities.
    """

    @staticmethod
    def validate_schedule_window(starts_at: datetime, ends_at: datetime | None) -> None:
        if ends_at is not None and starts_at >= ends_at:
            raise BusinessRuleViolation(
                "Campaign start date must be before end date."
            )
