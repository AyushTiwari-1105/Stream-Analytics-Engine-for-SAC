import React from 'react';
import { Icon } from '../common/Icons.jsx';

export default function Sidebar({ currentTab, onSelectTab, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Telemetry Overview', icon: 'activity', badge: 'Live' },
    { id: 'schemas', label: 'Schema Registry', icon: 'layers', badge: 'Draft-7' },
    { id: 'simulator', label: 'Event Simulator', icon: 'terminal', badge: 'Pub' },
    { id: 'settings', label: 'Engine Settings', icon: 'settings', badge: null }
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-badge">
            <Icon name="zap" size={18} color="#ffffff" />
          </div>
          <div>
            <div className="logo-text-title">Stream Analytics</div>
            <div className="logo-text-sub">SAC Engine Console</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ padding: '0.25rem 0.75rem 0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>SAC Node:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>sac-node-primary</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Build:</span>
            <span>v0.1.0-milestone</span>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 35
          }}
        />
      )}
    </>
  );
}
