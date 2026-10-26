import React from 'react';
import { Icon } from '../common/Icons.jsx';

export default function Header({ currentRole, onToggleRole, onToggleMobileSidebar }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={onToggleMobileSidebar}
          className="btn btn-secondary"
          style={{ display: 'none', padding: '0.4rem', borderRadius: '6px' }}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Icon name="menu" size={18} />
        </button>

        <div>
          <div className="page-title">
            <Icon name="activity" size={20} color="var(--accent-cyan)" />
            <span>Telemetry Operations Center</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time event stream monitoring &amp; aggregation
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Backend status indicator — always live */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-elevated)',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem'
          }}
          title="Connected to Spring Boot backend"
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              boxShadow: '0 0 6px var(--accent-emerald)'
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Engine:</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Live Backend</span>
        </div>

        {/* Role Selector Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.2rem 0.35rem 0.2rem 0.75rem',
            background: 'var(--bg-elevated)',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem'
          }}
        >
          <Icon name="shield" size={14} color="var(--accent-violet)" />
          <span style={{ color: 'var(--text-muted)' }}>Role:</span>
          <button
            onClick={onToggleRole}
            style={{
              background: currentRole === 'ROLE_ADMIN' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              border: `1px solid ${currentRole === 'ROLE_ADMIN' ? 'rgba(129, 140, 248, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
              color: currentRole === 'ROLE_ADMIN' ? 'var(--accent-violet)' : 'var(--accent-cyan)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
            title="Click to toggle between Admin and Publisher roles"
          >
            {currentRole === 'ROLE_ADMIN' ? 'ADMIN' : 'PUBLISHER'} ⇄
          </button>
        </div>
      </div>
    </header>
  );
}
