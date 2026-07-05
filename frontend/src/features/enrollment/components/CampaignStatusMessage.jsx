const statusConfig = {
  draft: {
    icon: '📝',
    title: 'Coming Soon',
    message: 'This campaign is being prepared. Check back later!',
    bg: 'var(--color-warning-light)',
    border: '#fde68a',
    color: 'var(--color-warning-text)',
  },
  scheduled: {
    icon: '📅',
    title: 'Coming Soon',
    message: 'This campaign is scheduled and will open soon. Stay tuned!',
    bg: 'var(--color-info-light)',
    border: '#bfdbfe',
    color: 'var(--color-info-text)',
  },
  live: {
    icon: '🟢',
    title: 'Live Now',
    message: 'This campaign is active! Enroll below to get your offers.',
    bg: 'var(--color-success-light)',
    border: '#bbf7d0',
    color: 'var(--color-success-text)',
  },
  ended: {
    icon: '✅',
    title: 'Campaign Ended',
    message: 'This campaign has ended. Thank you for your interest!',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    color: 'var(--color-text-secondary)',
  },
};

export default function CampaignStatusMessage({ status }) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <div style={{
      margin: '0 0 24px',
      padding: 16,
      borderRadius: 'var(--radius-md)',
      background: config.bg,
      border: `1px solid ${config.border}`,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      animation: 'fadeIn 0.3s ease',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{config.icon}</span>
      <div>
        <p style={{
          margin: '0 0 2px', fontWeight: 600, fontSize: 14,
          color: config.color,
        }}>
          {config.title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: config.color, opacity: 0.9 }}>
          {config.message}
        </p>
      </div>
    </div>
  );
}
