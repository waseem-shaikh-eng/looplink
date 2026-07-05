export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 28,
      flexWrap: 'wrap',
      gap: 12,
      animation: 'slideIn 0.3s ease',
    }}>
      <div>
        <h1 className="header-title" style={{ fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="header-subtitle" style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="page-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
