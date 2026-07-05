import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      animation: 'fadeIn 0.3s ease',
    }}>
      {icon && (
        <div style={{
          fontSize: 48, marginBottom: 16,
          width: 80, height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg)',
          borderRadius: '50%',
          margin: '0 auto 16px',
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 400, margin: '0 auto 24px' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">{actionLabel}</Button>
      )}
    </div>
  );
}
