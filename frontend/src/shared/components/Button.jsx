const sizes = {
  xs: { padding: '4px 10px', fontSize: 11 },
  sm: { padding: '6px 14px', fontSize: 12 },
  md: { padding: '8px 20px', fontSize: 14 },
  lg: { padding: '12px 28px', fontSize: 16 },
};

const variants = {
  primary: { bg: 'var(--color-primary)', color: '#fff', hover: 'var(--color-primary-hover)' },
  danger: { bg: 'var(--color-danger)', color: '#fff', hover: 'var(--color-danger-hover)' },
  secondary: { bg: 'var(--color-text-secondary)', color: '#fff', hover: '#334155' },
  success: { bg: 'var(--color-success)', color: '#fff', hover: 'var(--color-success-hover)' },
  ghost: { bg: 'transparent', color: 'var(--color-text)', hover: 'var(--color-bg-dark)' },
  outline: { bg: 'transparent', color: 'var(--color-primary)', hover: 'var(--color-primary-light)' },
};

export default function Button({
  children, variant = 'primary', size = 'md', disabled, loading,
  onClick, type = 'button', style, icon, fullWidth, tooltip,
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      data-tooltip={(!disabled && !loading && tooltip) ? tooltip : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: s.padding,
        borderRadius: 'var(--radius-md)',
        border: variant === 'outline' ? `1.5px solid var(--color-primary)` : 'none',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.5 : 1,
        fontWeight: 600,
        fontSize: s.fontSize,
        background: v.bg,
        color: v.color,
        transition: `all var(--transition-fast)`,
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.hover;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.bg;
      }}
    >
      {loading ? (
        <span style={{
          width: s.fontSize, height: s.fontSize,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon ? (
        <span style={{ fontSize: s.fontSize }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
