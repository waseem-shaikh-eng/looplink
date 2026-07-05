import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../../features/campaigns/api/campaignApi';
import Button from './Button';
import Spinner from './Spinner';

export default function DistributionCard({ campaignId, publicToken, baseUrl }) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution', campaignId],
    queryFn: () => campaignApi.getDistribution(campaignId, baseUrl || window.location.origin),
    enabled: !!campaignId,
  });

  const copyToClipboard = async () => {
    if (!data?.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = data.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spinner size={20} />
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Loading distribution...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p style={{ fontSize: 13, color: 'var(--color-danger)', margin: 0 }}>
        Failed to load distribution link.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {data.qr_code_base64 && (
          <div style={{
            flexShrink: 0, padding: 8,
            background: '#fff', borderRadius: 'var(--radius-sm)',
          }}>
            <img
              src={`data:image/png;base64,${data.qr_code_base64}`}
              alt="QR Code"
              style={{ width: 80, height: 80, display: 'block' }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
          }}>
            Shareable Link
          </p>
          <div style={{
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 12, background: 'var(--color-bg)',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', marginBottom: 8, color: 'var(--color-text)',
          }}>
            {data.url}
          </div>
          <Button size="xs" onClick={copyToClipboard} variant={copied ? 'success' : 'outline'} tooltip="Copy to clipboard">
            {copied ? '✓ Copied' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
