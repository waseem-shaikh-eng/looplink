export default function Spinner({ size = 24, overlay = false }) {
  const spinner = (
    <div style={{
      width: size,
      height: size,
      border: `3px solid var(--color-border)`,
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  );

  if (overlay) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 10,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
