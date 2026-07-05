import { useNavigate } from 'react-router-dom';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { useToast } from '../../../shared/lib/toast';
import CampaignForm from '../components/CampaignForm';
import Card from '../../../shared/components/Card';
import Layout from '../../../shared/components/Layout';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateCampaign();

  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: (campaign) => {
        toast('Campaign created successfully!', 'success');
        navigate(`/builder/campaigns/${campaign.id}`);
      },
      onError: (err) => {
        toast(err.message || 'Failed to create campaign', 'error');
      },
    });
  };

  return (
    <Layout>
      <div style={{ maxWidth: 640 }}>
        <button
          onClick={() => navigate('/builder/campaigns')}
          style={{
            cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 14,
            background: 'none', border: 'none', padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
          }}
        >
          ← Back to campaigns
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>New Campaign</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 28px' }}>
          Set up a new campaign with a name and description.
        </p>

        <Card>
          <CampaignForm
            onSubmit={handleSubmit}
            loading={createMutation.isPending}
          />
        </Card>
      </div>
    </Layout>
  );
}
