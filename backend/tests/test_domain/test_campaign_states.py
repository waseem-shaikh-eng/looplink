"""Tests for the Campaign state machine (State Pattern).

Verifies all allowed and disallowed transitions,
business rules (requires offers + window), and state accessors.
"""

from datetime import datetime, timedelta, timezone

import pytest

from app.domain.entities.campaign import Campaign
from app.domain.entities.offer import ProductPercentDiscountOffer
from app.domain.enums.campaign_status import CampaignStatus
from app.domain.exceptions import BusinessRuleViolation, InvalidStateTransition


@pytest.fixture
def draft_campaign():
    return Campaign(name="Test Campaign", description="A test")


@pytest.fixture
def future_date():
    return datetime.now(timezone.utc) + timedelta(days=7)


@pytest.fixture
def past_date():
    return datetime.now(timezone.utc) - timedelta(days=1)


@pytest.fixture
def future_range():
    now = datetime.now(timezone.utc)
    return now + timedelta(days=7), now + timedelta(days=14)


@pytest.fixture
def offer():
    return ProductPercentDiscountOffer(
        campaign_id=__import__("uuid").uuid4(),
        parameters={"percent": 20, "applies_to": "Summer Collection"},
    )


class TestDraftState:
    def test_can_edit(self, draft_campaign):
        assert draft_campaign.can_edit() is True

    def test_allowed_actions(self, draft_campaign):
        assert draft_campaign.allowed_actions() == ["edit", "schedule", "launch"]

    def test_schedule_refuses_no_offers(self, draft_campaign, future_date):
        with pytest.raises(BusinessRuleViolation, match="at least one offer"):
            draft_campaign.schedule(future_date)

    def test_schedule_refuses_past_date(self, draft_campaign, offer):
        draft_campaign.add_offer(offer)
        past = datetime.now(timezone.utc) - timedelta(days=1)
        with pytest.raises(BusinessRuleViolation, match="must be in the future"):
            draft_campaign.schedule(past)

    def test_schedule_transition(self, draft_campaign, offer, future_date):
        draft_campaign.add_offer(offer)
        draft_campaign.schedule(future_date)
        assert draft_campaign.status == CampaignStatus.SCHEDULED

    def test_schedule_sets_starts_at(self, draft_campaign, offer, future_date):
        draft_campaign.add_offer(offer)
        draft_campaign.schedule(future_date)
        assert draft_campaign.starts_at == future_date

    def test_launch_refuses_no_offers(self, draft_campaign):
        with pytest.raises(BusinessRuleViolation, match="at least one offer"):
            draft_campaign.launch()

    def test_launch_succeeds_from_draft(self, draft_campaign, offer):
        draft_campaign.add_offer(offer)
        draft_campaign.launch()
        assert draft_campaign.status == CampaignStatus.LIVE

    def test_launch_ignores_future_starts_at(self, draft_campaign, offer, future_date):
        draft_campaign.add_offer(offer)
        draft_campaign.starts_at = future_date
        draft_campaign.launch()
        assert draft_campaign.status == CampaignStatus.LIVE

    def test_launch_rejects_past_ends_at(self, draft_campaign, offer, past_date):
        draft_campaign.add_offer(offer)
        draft_campaign.starts_at = datetime.now(timezone.utc)
        draft_campaign.ends_at = datetime.now(timezone.utc) - timedelta(days=1)
        with pytest.raises(BusinessRuleViolation, match="ends_at must be in the future"):
            draft_campaign.launch()

    def test_launch_rejects_invalid_window(self, draft_campaign, offer, future_date):
        draft_campaign.add_offer(offer)
        draft_campaign.starts_at = future_date
        draft_campaign.ends_at = future_date - timedelta(days=1)
        with pytest.raises(BusinessRuleViolation, match="ends_at must be after starts_at"):
            draft_campaign.launch()

    def test_end_raises_error(self, draft_campaign):
        with pytest.raises(InvalidStateTransition, match="Cannot end a draft"):
            draft_campaign.end()


class TestScheduledState:
    @pytest.fixture
    def scheduled_campaign(self, draft_campaign, future_date, offer):
        draft_campaign.add_offer(offer)
        draft_campaign.schedule(future_date)
        return draft_campaign

    def test_cannot_edit(self, scheduled_campaign):
        assert scheduled_campaign.can_edit() is False

    def test_allowed_actions(self, scheduled_campaign):
        assert scheduled_campaign.allowed_actions() == ["launch"]

    def test_schedule_raises_error(self, scheduled_campaign, future_date):
        with pytest.raises(InvalidStateTransition, match="already scheduled"):
            scheduled_campaign.schedule(future_date)

    def test_launch_without_offers_raises_error(self, scheduled_campaign):
        scheduled_campaign._offers = []
        with pytest.raises(BusinessRuleViolation, match="at least one offer"):
            scheduled_campaign.launch()

    def test_launch_with_offers_succeeds(self, scheduled_campaign, offer):
        scheduled_campaign.add_offer(offer)
        scheduled_campaign.launch()
        assert scheduled_campaign.status == CampaignStatus.LIVE

    def test_end_raises_error(self, scheduled_campaign):
        with pytest.raises(InvalidStateTransition, match="Launch it first"):
            scheduled_campaign.end()


class TestLiveState:
    @pytest.fixture
    def live_campaign(self, draft_campaign, future_date, offer):
        draft_campaign.add_offer(offer)
        draft_campaign.schedule(future_date)
        draft_campaign.launch()
        return draft_campaign

    def test_cannot_edit(self, live_campaign):
        assert live_campaign.can_edit() is False

    def test_allowed_actions(self, live_campaign):
        assert live_campaign.allowed_actions() == ["end"]

    def test_schedule_raises_error(self, live_campaign, future_date):
        with pytest.raises(InvalidStateTransition, match="already live"):
            live_campaign.schedule(future_date)

    def test_launch_raises_error(self, live_campaign):
        with pytest.raises(InvalidStateTransition, match="already live"):
            live_campaign.launch()

    def test_end_succeeds(self, live_campaign):
        live_campaign.end()
        assert live_campaign.status == CampaignStatus.ENDED
        assert live_campaign.ends_at is not None

    def test_end_sets_ends_at(self, live_campaign):
        before = datetime.now(timezone.utc)
        live_campaign.end()
        assert live_campaign.ends_at >= before


class TestEndedState:
    @pytest.fixture
    def ended_campaign(self, draft_campaign, future_date, offer):
        draft_campaign.add_offer(offer)
        draft_campaign.schedule(future_date)
        draft_campaign.launch()
        draft_campaign.end()
        return draft_campaign

    def test_cannot_edit(self, ended_campaign):
        assert ended_campaign.can_edit() is False

    def test_allowed_actions_empty(self, ended_campaign):
        assert ended_campaign.allowed_actions() == []

    def test_schedule_raises_error(self, ended_campaign, future_date):
        with pytest.raises(InvalidStateTransition, match="has ended"):
            ended_campaign.schedule(future_date)

    def test_launch_raises_error(self, ended_campaign):
        with pytest.raises(InvalidStateTransition, match="has ended"):
            ended_campaign.launch()

    def test_end_raises_error(self, ended_campaign):
        with pytest.raises(InvalidStateTransition, match="has already ended"):
            ended_campaign.end()


class TestWindowValidation:
    def test_invalid_window_ends_before_starts(self, draft_campaign, offer, future_date):
        campaign = Campaign(name="Test", starts_at=future_date, ends_at=future_date - timedelta(days=1))
        campaign.add_offer(offer)
        with pytest.raises(BusinessRuleViolation, match="ends_at must be after starts_at"):
            campaign.launch()

    def test_valid_window_allows_launch(self, draft_campaign, offer, future_range):
        s, e = future_range
        campaign = Campaign(name="Test", starts_at=s, ends_at=e)
        campaign.add_offer(offer)
        campaign.launch()
        assert campaign.status == CampaignStatus.LIVE

    def test_schedule_validates_window(self, draft_campaign, offer, future_date):
        draft_campaign.add_offer(offer)
        draft_campaign.ends_at = future_date - timedelta(days=1)
        with pytest.raises(BusinessRuleViolation, match="ends_at must be after starts_at"):
            draft_campaign.schedule(future_date)


class TestFullLifecycle:
    """End-to-end happy path through the entire state machine."""

    def test_happy_path_schedule_first(self, future_date, offer):
        campaign = Campaign(name="Full Lifecycle")

        # Start: Draft
        assert campaign.status == CampaignStatus.DRAFT
        assert campaign.can_edit() is True

        campaign.add_offer(offer)

        # Schedule
        campaign.schedule(future_date)
        assert campaign.status == CampaignStatus.SCHEDULED
        assert campaign.can_edit() is False

        # Launch
        campaign.launch()
        assert campaign.status == CampaignStatus.LIVE

        # End
        campaign.end()
        assert campaign.status == CampaignStatus.ENDED

    def test_happy_path_direct_launch(self, offer):
        campaign = Campaign(name="Direct Launch")
        campaign.add_offer(offer)
        campaign.launch()
        assert campaign.status == CampaignStatus.LIVE
        campaign.end()
        assert campaign.status == CampaignStatus.ENDED

    def test_forward_only(self, future_date, offer):
        """Verify transitions can never go backward."""
        campaign = Campaign(name="Forward Only")
        campaign.add_offer(offer)

        campaign.schedule(future_date)
        campaign.launch()
        campaign.end()

        with pytest.raises(InvalidStateTransition):
            campaign.schedule(future_date)
        with pytest.raises(InvalidStateTransition):
            campaign.launch()
