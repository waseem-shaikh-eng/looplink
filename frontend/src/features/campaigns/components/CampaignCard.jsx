import StatusBadge from './StatusBadge';

export default function CampaignCard({ campaign, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
          {campaign.name}
        </h3>
        {campaign.description && (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>
            {campaign.description}
          </p>
        )}
      </div>
      <StatusBadge status={campaign.status} />
    </div>
  );
}
