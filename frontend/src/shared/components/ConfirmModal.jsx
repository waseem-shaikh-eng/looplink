import Button from './Button';

export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'danger' }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: 28,
          maxWidth: 420,
          width: '90%',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} variant="ghost">{cancelLabel || 'Cancel'}</Button>
          <Button onClick={onConfirm} variant={variant}>{confirmLabel || 'Confirm'}</Button>
        </div>
      </div>
    </div>
  );
}
