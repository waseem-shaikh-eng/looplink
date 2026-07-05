import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useCampaign, useUpdateCampaign, useDeleteCampaign,
  useScheduleCampaign, useLaunchCampaign, useEndCampaign, useSetOffers,
} from '../hooks/useCampaigns';
import { useToast } from '../../../shared/lib/toast';
import CampaignForm from '../components/CampaignForm';
import OfferBuilder from '../components/OfferBuilder';
import LifecycleButtons from '../components/LifecycleButtons';
import StatusBadge from '../components/StatusBadge';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Spinner from '../../../shared/components/Spinner';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import DistributionCard from '../../../shared/components/DistributionCard';
import Layout from '../../../shared/components/Layout';

const TABS = ['Details', 'Offers', 'Lifecycle'];

export default function CampaignEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: campaign, isLoading, error, refetch } = useCampaign(id);
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const scheduleMutation = useScheduleCampaign();
  const launchMutation = useLaunchCampaign();
  const endMutation = useEndCampaign();
  const offersMutation = useSetOffers();
  const [localOffers, setLocalOffers] = useState([]);

  useEffect(() => {
    if (campaign) setLocalOffers(campaign.offers || []);
  }, [campaign]);

  const handleUpdate = (data) => {
    const payload = { ...data, version: campaign.version };
    if (data.description === undefined) payload.description = campaign.description || '';
    updateMutation.mutate({ id, data: payload }, {
      onSuccess: () => toast('Campaign updated', 'success'),
      onError: (err) => toast(err.message || 'Update failed', 'error'),
    });
  };

  const handleSaveOffers = () => {
    offersMutation.mutate({ id, offers: localOffers, version: campaign.version }, {
      onSuccess: (updated) => toast('Offers saved', 'success'),
      onError: (err) => toast(err.message || 'Failed to save offers', 'error'),
    });
  };

  const handleSchedule = (startsAt) => {
    scheduleMutation.mutate({ id, starts_at: startsAt, version: campaign.version }, {
      onSuccess: () => toast('Campaign scheduled', 'success'),
      onError: (err) => toast(err.message || 'Schedule failed', 'error'),
    });
  };

  const handleLaunch = () => {
    launchMutation.mutate({ id, version: campaign.version }, {
      onSuccess: () => toast('Campaign launched!', 'success'),
      onError: (err) => toast(err.message || 'Launch failed', 'error'),
    });
  };

  const handleEnd = () => {
    endMutation.mutate({ id, version: campaign.version }, {
      onSuccess: () => toast('Campaign ended', 'success'),
      onError: (err) => toast(err.message || 'End failed', 'error'),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast('Campaign deleted', 'success');
        navigate('/builder/campaigns');
      },
      onError: (err) => toast(err.message || 'Delete failed', 'error'),
    });
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spinner size={36} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 16 }}>Loading campaign...</p>
        </div>
      </Layout>
    );
  }

  if (error || !campaign) {
    return (
      <Layout>
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{
            width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-danger-light)', borderRadius: '50%', margin: '0 auto 16px',
            fontSize: 28, color: 'var(--color-danger)',
          }}>
            !
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Campaign Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '0 0 24px' }}>
            This campaign may have been deleted or the link is invalid.
          </p>
          <Button onClick={() => navigate('/builder/campaigns')}>← Back to Campaigns</Button>
        </Card>
      </Layout>
    );
  }

  const allPending = updateMutation.isPending || scheduleMutation.isPending ||
    launchMutation.isPending || endMutation.isPending || offersMutation.isPending;

  return (
    <Layout>
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Delete Forever"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        variant="danger"
      />

      <Link
        to="/builder/campaigns"
        style={{
          color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}
      >
        ← Back to Campaigns
      </Link>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
        animation: 'slideIn 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="header-title" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{campaign.name}</h1>
          <StatusBadge status={campaign.status} />
          <code style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            v{campaign.version}
          </code>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {campaign.status === 'live' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/builder/campaigns/${id}/distribution`)}
              tooltip="View QR code and shareable link"
            >
              📍 Distribution
            </Button>
          )}
          {campaign.status === 'draft' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteMutation.isPending}
              tooltip="Permanently delete this campaign"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{
        display: 'flex', gap: 0, marginBottom: 24,
        borderBottom: '2px solid var(--color-border)',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-tooltip={`${tab} tab`}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -2,
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: 14,
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab}
          </button>
        ))}
        {allPending && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 8 }}>
            <Spinner size={16} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 6 }}>Saving...</span>
          </div>
        )}
      </div>

      {/* Tab: Details */}
      {activeTab === 'Details' && (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px', color: 'var(--color-text)' }}>
            Campaign Details
          </h2>
          {campaign.can_edit ? (
            <CampaignForm
              defaultValues={{ name: campaign.name, description: campaign.description || '', starts_at: campaign.starts_at, ends_at: campaign.ends_at }}
              onSubmit={handleUpdate}
              loading={updateMutation.isPending}
            />
          ) : (
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '4px 16px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Name</span>
                <span>{campaign.name}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Description</span>
                <span>{campaign.description || '—'}</span>
                {campaign.starts_at && (
                  <>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Starts</span>
                    <span>{new Date(campaign.starts_at).toLocaleString()}</span>
                  </>
                )}
                {campaign.ends_at && (
                  <>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Ends</span>
                    <span>{new Date(campaign.ends_at).toLocaleString()}</span>
                  </>
                )}
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Public Token</span>
                <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{campaign.public_token}</code>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Offers */}
      {activeTab === 'Offers' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
                Offers
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Configure the offers shoppers will receive when they enroll.
              </p>
            </div>
            {campaign.can_edit && (
              <Button
                onClick={handleSaveOffers}
                loading={offersMutation.isPending}
                disabled={offersMutation.isPending}
                size="sm"
                tooltip="Save all offer changes"
              >
                Save Offers
              </Button>
            )}
          </div>
          <OfferBuilder
            offers={localOffers}
            onChange={setLocalOffers}
            readOnly={!campaign.can_edit}
          />
        </Card>
      )}

      {/* Tab: Lifecycle */}
      {activeTab === 'Lifecycle' && (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text)' }}>
            Lifecycle Actions
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
            Control the state of your campaign through its lifecycle.
          </p>

          <LifecycleButtons
            campaign={campaign}
            onSchedule={handleSchedule}
            onLaunch={handleLaunch}
            onEnd={handleEnd}
            loading={scheduleMutation.isPending || launchMutation.isPending || endMutation.isPending}
            defaultStartsAt={campaign.starts_at}
          />

          {campaign.status === 'live' && (
            <div style={{
              marginTop: 24, padding: 20,
              background: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bbf7d0',
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#166534' }}>
                Campaign is Live 🎉
              </p>
              <DistributionCard
                campaignId={id}
                publicToken={campaign.public_token}
              />
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
}
