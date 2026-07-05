import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: 'var(--shadow-lg)',
              animation: t.exiting ? 'toastOut 0.3s ease forwards' : 'toastIn 0.3s ease',
              maxWidth: 400,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              ...toastColors(t.type),
            }}
          >
            {toastIcon(t.type)}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function toastColors(type) {
  switch (type) {
    case 'success': return { background: 'var(--color-success-text)', color: '#fff' };
    case 'error': return { background: 'var(--color-danger-text)', color: '#fff' };
    case 'warning': return { background: 'var(--color-warning-text)', color: '#fff' };
    default: return { background: 'var(--color-text)', color: '#fff' };
  }
}

function toastIcon(type) {
  const icons = {
    success: '✓', error: '✕', warning: '!', info: 'i',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>
      {icons[type] || icons.info}
    </span>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
