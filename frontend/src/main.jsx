import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --color-white: #ffffff;
    --color-bg: #f1f5f9;
    --color-bg-dark: #e2e8f0;
    --color-surface: #ffffff;
    --color-border: #e2e8f0;
    --color-border-light: #f1f5f9;

    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-primary-light: #dbeafe;
    --color-primary-text: #1e40af;

    --color-success: #22c55e;
    --color-success-hover: #16a34a;
    --color-success-light: #d1fae5;
    --color-success-text: #065f46;

    --color-danger: #ef4444;
    --color-danger-hover: #dc2626;
    --color-danger-light: #fef2f2;
    --color-danger-text: #991b1b;

    --color-warning: #f59e0b;
    --color-warning-light: #fef3c7;
    --color-warning-text: #92400e;

    --color-info: #3b82f6;
    --color-info-light: #dbeafe;
    --color-info-text: #1e40af;

    --color-text: #0f172a;
    --color-text-secondary: #475569;
    --color-text-muted: #94a3b8;
    --color-text-inverse: #ffffff;

    --sidebar-width: 240px;
    --sidebar-bg: #0f172a;
    --sidebar-text: #94a3b8;
    --sidebar-text-active: #ffffff;

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-lg: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
    --shadow-xl: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);

    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;

    --transition-fast: 0.15s ease;
    --transition-normal: 0.2s ease;
  }

  body {
    margin: 0;
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-text);
    background: var(--color-bg);
    line-height: 1.5;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes toastOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-12px); }
  }

  input, textarea, select {
    font-family: var(--font-sans);
    font-size: 14px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
  }

  a { color: var(--color-primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  ::selection { background: var(--color-primary-light); color: var(--color-primary-text); }

  [data-tooltip] {
    position: relative;
  }
  [data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    background: #1e293b;
    color: #fff;
    font-size: 12;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.15s ease;
    font-family: var(--font-sans);
  }
  [data-tooltip]:hover::after { opacity: 1; }

  @media (min-width: 769px) {
    .sidebar-overlay { display: none !important; }
    .sidebar-close { display: none !important; }
  }

  @media (max-width: 768px) {
    .sidebar { width: 240px !important; }
    .main-content-wrapper { margin-left: 0 !important; }
    .main-content { padding: 16px !important; }
    .tabs-bar { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .tabs-bar button { flex-shrink: 0; }
    .grid-2 { grid-template-columns: 1fr !important; }
    .date-fields { grid-template-columns: 1fr !important; }
    .page-header-actions { width: 100%; }
    .page-header-actions button { flex: 1; }
    .filter-pills { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
    .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .lifecycle-buttons { flex-direction: column; }
    .lifecycle-buttons button { width: 100%; }
  }

  @media (max-width: 640px) {
    .campaign-table table, .campaign-table thead, .campaign-table tbody,
    .campaign-table th, .campaign-table td, .campaign-table tr {
      display: block;
    }
    .campaign-table thead { display: none; }
    .campaign-table tr {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .campaign-table td {
      padding: 4px 0 !important;
      border: none !important;
    }
    .campaign-table td:first-child { padding-top: 0 !important; }
    .campaign-table td:last-child { padding-bottom: 0 !important; }
  }

  @media (max-width: 480px) {
    .stat-grid { grid-template-columns: 1fr 1fr !important; }
    .header-title { font-size: 22px !important; }
    .header-subtitle { font-size: 13px !important; }
    .landing-hero { padding: 32px 16px 24px !important; }
    .landing-hero h1 { font-size: 24px !important; }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
