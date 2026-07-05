const colors = {
  draft: { bg: 'var(--color-warning-light)', color: 'var(--color-warning-text)', dot: '#f59e0b' },
  scheduled: { bg: 'var(--color-info-light)', color: 'var(--color-info-text)', dot: '#3b82f6' },
  live: { bg: 'var(--color-success-light)', color: 'var(--color-success-text)', dot: '#22c55e' },
  ended: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
};

export default function StatusBadge({ status }) {
  const c = colors[status] || colors.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 12px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        textTransform: 'capitalize',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: c.dot, flexShrink: 0,
      }} />
      {status}
    </span>
  );
}
