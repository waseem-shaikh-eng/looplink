import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShare2 } from 'react-icons/fi';
import { useCampaigns } from '../hooks/useCampaigns';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import Spinner from '../../../shared/components/Spinner';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';
import PageHeader from '../../../shared/components/PageHeader';
import DistributionCard from '../../../shared/components/DistributionCard';
import StatusBadge from '../components/StatusBadge';
import Layout from '../../../shared/components/Layout';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
];

export default function CampaignListPage() {
  const { data, isLoading, error, refetch } = useCampaigns();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [shareId, setShareId] = useState(null);

  const allCampaigns = data?.campaigns || [];

  const filtered = useMemo(() => {
    let result = allCampaigns;
    if (filter !== 'all') {
      result = result.filter((c) => c.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allCampaigns, filter, search]);

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spinner size={36} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 16 }}>Loading campaigns...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState
          title="Failed to load campaigns"
          message={error.message}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Campaigns"
        subtitle={`${allCampaigns.length} total · ${filtered.length} shown`}
        actions={
          <Button onClick={() => navigate('/builder/campaigns/new')} icon="+">
            New Campaign
          </Button>
        }
      />

      {/* Search & Filter bar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 14,
              background: 'var(--color-surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div className="filter-pills" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${filter === f.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: filter === f.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: filter === f.value ? 'var(--color-primary-text)' : 'var(--color-text-secondary)',
                fontWeight: filter === f.value ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {allCampaigns.length === 0 ? (
        <Card>
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start building offers and enrolling shoppers."
            actionLabel="+ Create Your First Campaign"
            onAction={() => navigate('/builder/campaigns/new')}
            icon="📋"
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No matching campaigns"
            description={search ? 'Try a different search term.' : 'Try a different filter.'}
            icon="🔍"
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((c) => (
            <div key={c.id}>
              <div
                onClick={() => navigate(`/builder/campaigns/${c.id}`)}
                className="campaign-card"
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: shareId === c.id ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  animation: 'fadeIn 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = shareId === c.id ? 'var(--color-primary)' : 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>
                    {c.name}
                  </p>
                  {c.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="campaign-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={c.status} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    v{c.version}
                  </span>
                  <div
                    onClick={(e) => { e.stopPropagation(); setShareId(shareId === c.id ? null : c.id); }}
                    style={{
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      fontSize: 16, cursor: 'pointer',
                      background: shareId === c.id ? 'var(--color-primary-light)' : 'transparent',
                      color: shareId === c.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}
                    title="Share"
                  >
                    <FiShare2 size={14} />
                  </div>
                </div>
              </div>
              {shareId === c.id && (
                <div style={{
                  padding: 16, border: '1px solid var(--color-primary)',
                  borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                  background: 'var(--color-bg)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <DistributionCard
                    campaignId={c.id}
                    publicToken={c.public_token}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
