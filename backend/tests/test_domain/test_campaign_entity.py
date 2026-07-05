"""Tests for the Campaign entity itself (non-state behavior)."""

from uuid import UUID, uuid4

from app.domain.entities.campaign import Campaign
from app.domain.entities.offer import ProductPercentDiscountOffer
from app.domain.enums.campaign_status import CampaignStatus


def test_creates_with_default_status():
    campaign = Campaign(name="Test")
    assert campaign.status == CampaignStatus.DRAFT


def test_creates_with_generated_id():
    campaign = Campaign(name="Test")
    assert isinstance(campaign.id, UUID)


def test_creates_with_generated_public_token():
    campaign = Campaign(name="Test")
    assert campaign.public_token is not None
    assert len(campaign.public_token) > 0


def test_version_starts_at_one():
    campaign = Campaign(name="Test")
    assert campaign.version == 1


def test_increment_version():
    campaign = Campaign(name="Test")
    assert campaign.version == 1
    campaign.increment_version()
    assert campaign.version == 2


def test_accepts_provided_id():
    cid = uuid4()
    campaign = Campaign(name="Test", id=cid)
    assert campaign.id == cid


def test_accepts_provided_status():
    campaign = Campaign(name="Test", status=CampaignStatus.LIVE)
    assert campaign.status == CampaignStatus.LIVE


def test_accepts_window():
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    campaign = Campaign(
        name="Test",
        starts_at=now + timedelta(days=7),
        ends_at=now + timedelta(days=14),
    )
    assert campaign.starts_at is not None
    assert campaign.ends_at is not None


def test_offer_management():
    campaign = Campaign(name="Test")
    assert len(campaign.offers) == 0

    offer = ProductPercentDiscountOffer(
        campaign_id=campaign.id,
        parameters={"percent": 10, "applies_to": "Clearance"},
    )
    campaign.add_offer(offer)
    assert len(campaign.offers) == 1

    campaign.remove_offer(offer.id)
    assert len(campaign.offers) == 0


def test_offers_returns_copy():
    campaign = Campaign(name="Test")
    offers = campaign.offers
    offers.append("should not affect internal state")
    assert len(campaign.offers) == 0


def test_offers_setter():
    campaign = Campaign(name="Test")
    offer = ProductPercentDiscountOffer(
        campaign_id=campaign.id,
        parameters={"percent": 10, "applies_to": "Clearance"},
    )
    campaign.offers = [offer]
    assert len(campaign.offers) == 1
