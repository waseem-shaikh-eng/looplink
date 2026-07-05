export default function FormField({ label, error, children, required }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: 6,
          fontWeight: 600, fontSize: 13,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <p style={{
          margin: '6px 0 0',
          fontSize: 13,
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span>✕</span> {error}
        </p>
      )}
    </div>
  );
}
