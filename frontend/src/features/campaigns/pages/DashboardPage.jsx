import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import StatCard from '../../../shared/components/StatCard';
import Spinner from '../../../shared/components/Spinner';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Layout from '../../../shared/components/Layout';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useCampaigns();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spinner size={36} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 16 }}>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState
          title="Failed to load dashboard"
          message={error.message}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  const campaigns = data?.campaigns || [];
  const total = campaigns.length;
  const drafts = campaigns.filter((c) => c.status === 'draft').length;
  const scheduled = campaigns.filter((c) => c.status === 'scheduled').length;
  const live = campaigns.filter((c) => c.status === 'live').length;
  const ended = campaigns.filter((c) => c.status === 'ended').length;

  const recent = [...campaigns]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your campaigns"
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/builder/campaigns')} tooltip="See all campaigns">
              View All
            </Button>
            <Button onClick={() => navigate('/builder/campaigns/new')} icon="+" tooltip="Create a new campaign">
              New Campaign
            </Button>
          </>
        }
      />

      <div className="stat-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 16,
        marginBottom: 36,
      }}>
        <StatCard label="Total Campaigns" value={total} icon="📦" />
        <StatCard label="Drafts" value={drafts} accent="#f59e0b" color="#d97706" icon="📝" />
        <StatCard label="Scheduled" value={scheduled} accent="#3b82f6" color="#2563eb" icon="📅" />
        <StatCard label="Live" value={live} accent="#22c55e" color="#16a34a" icon="🚀" />
        <StatCard label="Ended" value={ended} accent="#6b7280" color="#4b5563" icon="✅" />
      </div>

      <Card>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Campaigns</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/builder/campaigns')}>
            View All →
          </Button>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start building offers and enrolling shoppers."
            actionLabel="+ Create Your First Campaign"
            onAction={() => navigate('/builder/campaigns/new')}
            icon="📋"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/builder/campaigns/${c.id}`)}
                data-tooltip="View campaign"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  animation: 'fadeIn 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
                    {c.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Created {new Date(c.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}
