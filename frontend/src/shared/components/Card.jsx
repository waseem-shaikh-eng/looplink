export default function Card({ children, style, onClick, hoverable = false, padding = 24 }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        transition: `all var(--transition-normal)`,
        cursor: onClick ? 'pointer' : undefined,
        animation: 'fadeIn 0.3s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }
      }}
    >
      {children}
    </div>
  );
}
