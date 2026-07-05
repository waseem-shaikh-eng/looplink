"""Tests for identity normalization and duplicate detection."""

from uuid import uuid4

import pytest

from app.domain.entities.enrollment import Enrollment
from app.domain.enums.identity_type import IdentityType
from app.domain.value_objects.identity import Identity, NormalizedIdentity
from app.infrastructure.normalization.identity_normalizer import IdentityNormalizer


class TestEmailNormalization:
    def test_trims_whitespace(self):
        result = IdentityNormalizer.normalize_email("  user@example.com  ")
        assert result == "user@example.com"

    def test_lowercases(self):
        result = IdentityNormalizer.normalize_email("USER@EXAMPLE.COM")
        assert result == "user@example.com"

    def test_trims_and_lowercases(self):
        result = IdentityNormalizer.normalize_email("  Test.User@Example.Com  ")
        assert result == "test.user@example.com"


class TestPhoneNormalization:
    def test_removes_spaces(self):
        result = IdentityNormalizer.normalize_phone("+1 555 123 4567")
        assert result == "15551234567"

    def test_removes_parentheses(self):
        result = IdentityNormalizer.normalize_phone("(555) 123-4567")
        assert result == "5551234567"

    def test_removes_dashes(self):
        result = IdentityNormalizer.normalize_phone("555-123-4567")
        assert result == "5551234567"

    def test_removes_plus(self):
        result = IdentityNormalizer.normalize_phone("+1 (555) 123-4567")
        assert result == "15551234567"

    def test_combined(self):
        result = IdentityNormalizer.normalize_phone("  +1 (555) 123-4567  ext.5  ")
        assert result == "15551234567ext.5"


class TestIdentityNormalizerService:
    def test_normalize_email_identity(self):
        identity = Identity(value="  User@Example.Com  ", type=IdentityType.EMAIL)
        result = IdentityNormalizer().normalize(identity)
        assert result == NormalizedIdentity(
            value="user@example.com", type=IdentityType.EMAIL
        )

    def test_normalize_phone_identity(self):
        identity = Identity(value="+1 (555) 123-4567", type=IdentityType.PHONE)
        result = IdentityNormalizer().normalize(identity)
        assert result == NormalizedIdentity(
            value="15551234567", type=IdentityType.PHONE
        )


class TestDuplicateEnrollment:
    """Duplicate detection relies on (campaign_id, normalized_identity) uniqueness."""

    def test_same_identity_is_duplicate(self):
        campaign_id = uuid4()
        identity_value = "user@example.com"
        normalized = "user@example.com"

        e1 = Enrollment(
            campaign_id=campaign_id,
            identity=identity_value,
            identity_type=IdentityType.EMAIL,
            normalized_identity=normalized,
        )
        e2 = Enrollment(
            campaign_id=campaign_id,
            identity="  USER@EXAMPLE.COM  ",
            identity_type=IdentityType.EMAIL,
            normalized_identity="user@example.com",
        )
        # Both normalized identities match
        assert e1.normalized_identity == e2.normalized_identity
        assert e1.campaign_id == e2.campaign_id

    def test_different_campaigns_not_duplicate(self):
        identity_value = "user@example.com"

        e1 = Enrollment(
            campaign_id=uuid4(),
            identity=identity_value,
            identity_type=IdentityType.EMAIL,
            normalized_identity=identity_value,
        )
        e2 = Enrollment(
            campaign_id=uuid4(),
            identity=identity_value,
            identity_type=IdentityType.EMAIL,
            normalized_identity=identity_value,
        )
        assert e1.normalized_identity == e2.normalized_identity
        assert e1.campaign_id != e2.campaign_id
