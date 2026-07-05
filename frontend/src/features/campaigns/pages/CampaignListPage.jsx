import { useMemo, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiShare2 } from 'react-icons/fi';
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
          <Button onClick={() => navigate('/builder/campaigns/new')} icon="+" tooltip="Create a new campaign">
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
              data-tooltip={`Filter: ${f.label}`}
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
        <div className="campaign-table" style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{
                background: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Version</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Share | Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <Fragment key={c.id}>
                  <tr
                    style={{
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={tdStyle}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</span>
                        {c.description && (
                          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                            {c.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}><StatusBadge status={c.status} /></td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      v{c.version}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        {c.status === 'live' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShareId(shareId === c.id ? null : c.id); }}
                            style={{
                              padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              background: shareId === c.id ? 'var(--color-primary-light)' : 'transparent',
                              color: shareId === c.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                            data-tooltip="Share campaign"
                          >
                            <FiShare2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/builder/campaigns/${c.id}`)}
                          style={{
                              padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              background: shareId === c.id ? 'var(--color-primary-light)' : 'transparent',
                              color: shareId === c.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                              cursor: 'pointer',
                            }}
                          data-tooltip="Edit"
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        >
                          <FiEdit size={14} style={{ marginRight: 4 }} color='#6610f2' />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {c.status === 'live' && shareId === c.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0, borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{
                          padding: 16,
                          background: 'var(--color-bg)',
                          animation: 'fadeIn 0.2s ease',
                        }}>
                          <DistributionCard
                            campaignId={c.id}
                            publicToken={c.public_token}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--color-text-muted)',
};

const tdStyle = {
  padding: '14px 16px',
  verticalAlign: 'middle',
  borderBottom: '1px solid var(--color-border-light)',
};
