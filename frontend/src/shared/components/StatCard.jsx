export default function StatCard({ label, value, color, accent, icon }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      borderTop: accent ? `3px solid ${accent}` : undefined,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {icon && <span style={{ fontSize: 20, color: color || 'var(--color-text-muted)' }}>{icon}</span>}
      </div>
      <p style={{
        fontSize: 32,
        fontWeight: 700,
        margin: '0 0 4px',
        color: color || 'var(--color-text)',
      }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>
        {label}
      </p>
    </div>
  );
}
