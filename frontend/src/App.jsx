import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Schemas from './pages/Schemas/Schemas.jsx';
import Simulator from './pages/Simulator/Simulator.jsx';
import Settings from './pages/Settings/Settings.jsx';
import { Icon } from './components/common/Icons.jsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('ROLE_ADMIN');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Simulator logs — persisted across tab navigation via sessionStorage ──
  const [simulatorLogs, setSimulatorLogs] = useState(() => {
    try {
      const saved = sessionStorage.getItem('simulator_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep sessionStorage in sync; cap at 200 entries to avoid quota issues
  useEffect(() => {
    try {
      const capped = simulatorLogs.length > 200
        ? simulatorLogs.slice(simulatorLogs.length - 200)
        : simulatorLogs;
      sessionStorage.setItem('simulator_logs', JSON.stringify(capped));
    } catch { /* ignore quota errors */ }
  }, [simulatorLogs]);

  const toggleRole = () => {
    setCurrentRole((prev) => (prev === 'ROLE_ADMIN' ? 'ROLE_PUBLISHER' : 'ROLE_ADMIN'));
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          currentRole={currentRole}
          onToggleRole={toggleRole}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Tab Views */}
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'schemas' && <Schemas currentRole={currentRole} />}
        {currentTab === 'simulator' && (
          <Simulator
            currentRole={currentRole}
            logs={simulatorLogs}
            onLogsChange={setSimulatorLogs}
          />
        )}
        {currentTab === 'settings' && (
          <Settings currentRole={currentRole} onRoleChange={setCurrentRole} />
        )}

        {currentTab !== 'dashboard' && currentTab !== 'schemas' && currentTab !== 'simulator' && currentTab !== 'settings' && (
          <div className="dashboard-view" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 2rem' }}>
              <Icon name="layers" size={36} color="var(--accent-violet)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                {currentTab.replace('-', ' ')} Module
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                This module has been scaffolded in the directory structure. In the next milestone, it will be integrated with the Spring Boot backend endpoints.
              </p>
              <button className="btn btn-cyan" onClick={() => setCurrentTab('dashboard')}>
                <Icon name="activity" size={14} />
                <span>Return to Telemetry Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
