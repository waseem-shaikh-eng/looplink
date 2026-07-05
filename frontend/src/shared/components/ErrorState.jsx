import Button from './Button';

export default function ErrorState({ title, message, onRetry }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: 64, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-danger-light)',
        borderRadius: '50%',
        margin: '0 auto 16px',
        fontSize: 28,
        color: 'var(--color-danger)',
      }}>
        !
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text)' }}>
        {title || 'Something went wrong'}
      </h3>
      {message && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
          {message}
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="primary">Try Again</Button>
      )}
    </div>
  );
}
