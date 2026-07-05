import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from './Button';

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 24px',
  color: 'var(--sidebar-text)',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
  transition: 'all 0.15s',
  borderLeft: '3px solid transparent',
};

const activeLink = {
  ...linkBase,
  color: 'var(--sidebar-text-active)',
  background: 'rgba(255,255,255,0.08)',
  borderLeftColor: 'var(--color-primary)',
};

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPublic = location.pathname.startsWith('/c/');

  if (isPublic) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 98,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
          display: sidebarOpen ? 'block' : 'none',
        }}
      />

      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        minHeight: '100vh',
        padding: '24px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 99,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                Campaign<span style={{ color: 'var(--color-primary)' }}>Builder</span>
              </h1>
              <p style={{ color: 'var(--sidebar-text)', fontSize: 11, margin: '2px 0 0', opacity: 0.6 }}>
                Admin Panel
              </p>
            </div>
            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                fontSize: 20, padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink
            to="/builder"
            end
            style={({ isActive }) => (isActive ? activeLink : linkBase)}
            onClick={() => setSidebarOpen(false)}
          >
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink
            to="/builder/campaigns"
            style={({ isActive }) => (isActive ? activeLink : linkBase)}
            onClick={() => setSidebarOpen(false)}
          >
            <span>📋</span> Campaigns
          </NavLink>
        </nav>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--sidebar-text)',
          fontSize: 12,
          opacity: 0.5,
        }}>
          v0.1.0
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minWidth: 0, transition: 'margin-left 0.3s ease' }}>
        {/* Top bar with mobile menu button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--color-text)', padding: 4, marginRight: 12,
            }}
          >
            ☰
          </button>
          <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            {location.pathname === '/builder' ? 'Dashboard' :
             location.pathname === '/builder/campaigns' ? 'Campaigns' :
             location.pathname.includes('/distribution') ? 'Distribution' :
             location.pathname.includes('/new') ? 'New Campaign' : 'Campaign'}
          </span>
        </div>

        <main className="main-content" style={{
          padding: '28px 32px',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
