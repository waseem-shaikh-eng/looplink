import { useParams } from 'react-router-dom';
import { usePublicCampaign, useEnroll } from '../hooks/useEnrollment';
import { useToast } from '../../../shared/lib/toast';
import EnrollmentForm from '../components/EnrollmentForm';
import PublicOfferCard from '../components/PublicOfferCard';
import CampaignStatusMessage from '../components/CampaignStatusMessage';
import Spinner from '../../../shared/components/Spinner';
import Card from '../../../shared/components/Card';

export default function LandingPage() {
  const { token } = useParams();
  const toast = useToast();
  const { data: campaign, isLoading, error } = usePublicCampaign(token);
  const enrollMutation = useEnroll();

  const handleEnroll = (data) => {
    enrollMutation.mutate(
      { token, data },
      {
        onSuccess: (result) => {
          if (result?.already_enrolled) {
            toast('You are already enrolled in this campaign!', 'warning');
          } else {
            toast('Successfully enrolled!', 'success');
          }
        },
        onError: (err) => {
          toast(err.message || 'Enrollment failed', 'error');
        },
      }
    );
  };

  const enrollResult = enrollMutation.data;
  const isAlreadyEnrolled = enrollResult?.already_enrolled;

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spinner size={40} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 16 }}>
            Loading campaign...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <Card style={{ textAlign: 'center', maxWidth: 480, margin: '40px auto', padding: 40 }}>
          <div style={{
            width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-danger-light)', borderRadius: '50%',
            margin: '0 auto 20px', fontSize: 32, color: 'var(--color-danger)',
          }}>
            !
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text)' }}>
            Invalid Link
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
            This campaign link is invalid or has expired. Please check the URL and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{
        maxWidth: 640, margin: '0 auto', width: '100%',
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Hero section */}
        <div className="landing-hero" style={{
          textAlign: 'center',
          padding: '48px 24px 40px',
        }}>
          <div style={{
            width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(34,197,94,0.1)', borderRadius: '50%',
            margin: '0 auto 20px', fontSize: 36,
          }}>
            🎉
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: '0 0 8px',
            color: 'var(--color-text)', letterSpacing: '-0.02em',
          }}>
            {campaign.name}
          </h1>
          {campaign.description && (
            <p style={{
              fontSize: 16, color: 'var(--color-text-secondary)',
              margin: '0 auto', maxWidth: 480, lineHeight: 1.6,
            }}>
              {campaign.description}
            </p>
          )}
        </div>

        {/* Campaign status message */}
        <CampaignStatusMessage status={campaign.status} />

        {/* Offers */}
        {campaign.offers && campaign.offers.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, margin: '0 0 16px',
              color: 'var(--color-text)', padding: '0 4px',
            }}>
              ✨ What You Get
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campaign.offers.map((offer, i) => (
                <PublicOfferCard key={i} offer={offer} />
              ))}
            </div>
          </div>
        )}

        {/* Enrollment success / form */}
        {enrollResult && !enrollMutation.isPending ? (
          <Card style={{
            textAlign: 'center',
            background: isAlreadyEnrolled ? 'var(--color-warning-light)' : 'var(--color-success-light)',
            border: isAlreadyEnrolled ? '1px solid #fde68a' : '1px solid #bbf7d0',
            padding: 32,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isAlreadyEnrolled ? '👋' : '🎉'}
            </div>
            <h2 style={{
              fontSize: 20, fontWeight: 700, margin: '0 0 8px',
              color: isAlreadyEnrolled ? 'var(--color-warning-text)' : 'var(--color-success-text)',
            }}>
              {isAlreadyEnrolled ? 'Already Enrolled!' : 'Successfully Enrolled!'}
            </h2>
            <p style={{
              margin: 0, fontSize: 14, lineHeight: 1.6,
              color: isAlreadyEnrolled ? 'var(--color-warning-text)' : 'var(--color-success-text)',
            }}>
              {isAlreadyEnrolled
                ? 'You are already registered for this campaign.'
                : 'You have been enrolled. Check your offers above!'}
            </p>
          </Card>
        ) : campaign.status === 'live' ? (
          <Card style={{ padding: 32 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, margin: '0 0 6px',
              color: 'var(--color-text)',
            }}>
              Join This Campaign
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
              Enter your details below to enroll.
            </p>
            <EnrollmentForm
              onSubmit={handleEnroll}
              loading={enrollMutation.isPending}
            />
          </Card>
        ) : null}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', opacity: 0.6 }}>
            Powered by CampaignBuilder
          </p>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  padding: '0 16px',
  display: 'flex',
  justifyContent: 'center',
};
