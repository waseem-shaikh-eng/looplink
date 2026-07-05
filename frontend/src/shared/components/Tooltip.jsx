export default function Tooltip({ children, label, position = 'top' }) {
  if (!label) return children;

  const positions = {
    top: { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' },
  };

  const pos = positions[position] || positions.top;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      <span className="tooltip" style={{
        position: 'absolute', ...pos,
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        background: '#1e293b',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.15s ease',
      }}>
        {label}
      </span>
      <style>{`
        .tooltip-trigger:hover + .tooltip,
        .tooltip-trigger:hover .tooltip { opacity: 1; }
      `}</style>
    </div>
  );
}
