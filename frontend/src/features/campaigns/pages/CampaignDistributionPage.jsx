import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../api/campaignApi';
import { useToast } from '../../../shared/lib/toast';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Spinner from '../../../shared/components/Spinner';
import ErrorState from '../../../shared/components/ErrorState';
import PageHeader from '../../../shared/components/PageHeader';
import Layout from '../../../shared/components/Layout';

export default function CampaignDistributionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['distribution', id],
    queryFn: () => campaignApi.getDistribution(id, window.location.origin),
  });

  const copyToClipboard = async () => {
    if (!data?.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      toast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = data.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      toast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spinner size={36} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 16 }}>Generating distribution...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState
          title="Failed to load distribution"
          message={error.message}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Link
        to={`/builder/campaigns/${id}`}
        style={{
          color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}
      >
        ← Back to Campaign
      </Link>

      <PageHeader
        title="Campaign Distribution"
        subtitle="Share this campaign with shoppers via QR code or direct link."
      />

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* QR Code */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>QR Code</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
            Shoppers scan this QR code to access the campaign landing page.
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: 20,
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            minHeight: 200,
          }}>
            {data?.qr_code_base64 ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={`data:image/png;base64,${data.qr_code_base64}`}
                  alt="Campaign QR Code"
                  style={{
                    width: 180, height: 180,
                    display: 'block', margin: '0 auto',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                  Scan to enroll
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>QR code not available</p>
            )}
          </div>
        </Card>

        {/* Share Link */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Shareable Link</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
            Share this link with shoppers via email, SMS, or social media.
          </p>
          {data?.url ? (
            <div>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16,
              }}>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 13, background: 'var(--color-bg)',
                  color: 'var(--color-text)', minWidth: 0,
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {data.url}
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant={copied ? 'success' : 'primary'}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </Button>
              </div>
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" fullWidth>
                  🔗 Preview Public Page
                </Button>
              </a>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>Shareable link not available</p>
          )}
        </Card>
      </div>
    </Layout>
  );
}
