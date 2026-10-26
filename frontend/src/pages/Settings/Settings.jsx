import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import {
  getBaseUrl, setBaseUrl as persistBaseUrl,
  getAdminApiKey, setAdminApiKey as persistAdminKey,
  getPublisherApiKey, setPublisherApiKey as persistPublisherKey,
  clearAllSettings,
} from '../../services/configService.js';

const DEFAULT_CONFIG = {
  backendBaseUrl: 'http://localhost:8080',
  timeoutSeconds: 15,
};

export default function Settings({ currentRole = 'ROLE_ADMIN', onRoleChange }) {
  // Config state — initialise from localStorage via configService
  const [baseUrl, setBaseUrl] = useState(getBaseUrl() || DEFAULT_CONFIG.backendBaseUrl);
  const [adminApiKey, setAdminApiKey] = useState(getAdminApiKey());
  const [publisherApiKey, setPublisherApiKey] = useState(getPublisherApiKey());
  const [timeoutSeconds, setTimeoutSeconds] = useState(DEFAULT_CONFIG.timeoutSeconds);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [showPublisherKey, setShowPublisherKey] = useState(false);


  // Validation & alerts
  const [urlError, setUrlError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Simulated Health Check state
  const [healthStatus, setHealthStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [simulatedOutcome, setSimulatedOutcome] = useState('HEALTHY');

  // Validate URL
  const validateUrl = (url) => {
    if (!url.trim()) return 'Base URL cannot be blank.';
    if (!/^https?:\/\/.+/i.test(url.trim())) {
      return 'Base URL must start with http:// or https:// (e.g. http://localhost:8080)';
    }
    return '';
  };

  const handleUrlChange = (val) => {
    setBaseUrl(val);
    setUrlError(validateUrl(val));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const error = validateUrl(baseUrl);
    if (error) { setUrlError(error); return; }
    setUrlError('');
    // Persist to localStorage via configService
    persistBaseUrl(baseUrl);
    persistAdminKey(adminApiKey);
    persistPublisherKey(publisherApiKey);
    setToastMessage('Settings saved to localStorage. Service calls will use the new values immediately.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleReset = () => {
    clearAllSettings();
    setBaseUrl(DEFAULT_CONFIG.backendBaseUrl);
    setAdminApiKey('');
    setPublisherApiKey('');
    setTimeoutSeconds(DEFAULT_CONFIG.timeoutSeconds);
    setUrlError('');
    setToastMessage('Settings cleared. API keys removed from localStorage.');
    setTimeout(() => setToastMessage(''), 3500);
  };


  const handleRunHealthCheck = () => {
    setIsPinging(true);
    setHealthStatus(null);

    // Simulate network delay
    const baseLatency = simulatedOutcome === 'HEALTHY' ? Math.floor(18 + Math.random() * 25) : simulatedOutcome === 'DEGRADED' ? Math.floor(280 + Math.random() * 150) : 1000;

    setTimeout(() => {
      setIsPinging(false);
      const timestamp = new Date().toLocaleTimeString();

      if (simulatedOutcome === 'HEALTHY') {
        setHealthStatus({
          status: 'HEALTHY',
          code: 200,
          latencyMs: baseLatency,
          timestamp,
          message: 'Backend engine responded successfully. Dispatch pipeline is ready.'
        });
      } else if (simulatedOutcome === 'DEGRADED') {
        setHealthStatus({
          status: 'DEGRADED',
          code: 200,
          latencyMs: baseLatency,
          timestamp,
          message: 'Backend reachable, but response latency is elevated (>250ms).'
        });
      } else {
        setHealthStatus({
          status: 'OFFLINE',
          code: 503,
          latencyMs: baseLatency,
          timestamp,
          message: 'Connection failed: Backend port unreachable (ECONNREFUSED).'
        });
      }
    }, 450);
  };

  return (
    <div className="dashboard-view">
      {/* Mock Telemetry Banner */}
      <div className="mock-banner">
        <div className="mock-banner-text">
          <div className="mock-pulse-dot" />
          <span>
            <strong>Settings &amp; Connectivity Manager:</strong> Configure environment endpoints and test simulated health checks. Changes are scoped to the active frontend session.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Icon name="shield" size={14} color="var(--accent-violet)" />
          <span>Credentials never logged</span>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 'var(--accent-emerald)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}
        >
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="settings" size={22} color="var(--accent-cyan)" />
          <span>Engine Settings &amp; API Configuration</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Manage backend endpoints, security credentials, and simulate connection health probes
        </p>
      </div>

      {/* Main Grid */}
      <div className="settings-grid">
        {/* Left Column: API & Credential Configuration */}
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="server" size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>API Connection Settings</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Proxy Target</span>
            </div>

            <form onSubmit={handleSave}>
              {/* Backend Base URL */}
              <div className="form-group">
                <label className="form-label">Backend Engine Base URL *</label>
                <input
                  type="text"
                  className="form-input"
                  value={baseUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="http://localhost:8080"
                  style={{ borderColor: urlError ? 'var(--accent-rose)' : 'var(--border-subtle)' }}
                  required
                />
                {urlError && (
                  <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {urlError}
                  </span>
                )}
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Default Spring Boot engine port. In development, Vite proxies <code>/api</code> requests to this target.
                </span>
              </div>

              {/* Active Role Selector */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Active Role Selector *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => onRoleChange && onRoleChange('ROLE_ADMIN')}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentRole === 'ROLE_ADMIN' ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                      background: currentRole === 'ROLE_ADMIN' ? 'rgba(129, 140, 248, 0.15)' : 'var(--bg-canvas)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: currentRole === 'ROLE_ADMIN' ? 'var(--accent-violet)' : 'var(--text-primary)' }}>
                        ADMIN ROLE
                      </span>
                      {currentRole === 'ROLE_ADMIN' && <Icon name="check" size={14} color="var(--accent-violet)" />}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Authorizes schema registration via <code>/api/v1/admin/**</code>.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRoleChange && onRoleChange('ROLE_PUBLISHER')}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentRole === 'ROLE_PUBLISHER' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      background: currentRole === 'ROLE_PUBLISHER' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-canvas)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: currentRole === 'ROLE_PUBLISHER' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        PUBLISHER ROLE
                      </span>
                      {currentRole === 'ROLE_PUBLISHER' && <Icon name="check" size={14} color="var(--accent-cyan)" />}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Authorizes event streaming via <code>/api/v1/events/**</code>.
                    </p>
                  </button>
                </div>
              </div>

              {/* Admin API Key */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Admin API Key (X-API-Key)</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-violet)' }}>→ /api/v1/admin/**</span>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <Icon name="key" size={15} />
                  </span>
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    className="form-input"
                    value={adminApiKey}
                    onChange={(e) => setAdminApiKey(e.target.value)}
                    placeholder="Admin key (matches spring.api.security.admin-key)"
                    style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '2.5rem', fontFamily: 'var(--font-mono)' }}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: showAdminKey ? 'var(--accent-cyan)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                    title={showAdminKey ? 'Mask key' : 'Reveal key'}
                  >
                    <Icon name={showAdminKey ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              {/* Publisher API Key */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Publisher API Key (X-API-Key)</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>→ /api/v1/events/**</span>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <Icon name="key" size={15} />
                  </span>
                  <input
                    type={showPublisherKey ? 'text' : 'password'}
                    className="form-input"
                    value={publisherApiKey}
                    onChange={(e) => setPublisherApiKey(e.target.value)}
                    placeholder="Publisher key (matches spring.api.security.publisher-key)"
                    style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '2.5rem', fontFamily: 'var(--font-mono)' }}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublisherKey(!showPublisherKey)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: showPublisherKey ? 'var(--accent-cyan)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                    title={showPublisherKey ? 'Mask key' : 'Reveal key'}
                  >
                    <Icon name={showPublisherKey ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Saved to localStorage only. Never logged or sent to third parties.
                </span>
              </div>

              {/* Request Timeout */}
              <div className="form-group">
                <label className="form-label">Request Timeout (seconds)</label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  className="form-input"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10) || 15)}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  title="Restore default configuration"
                >
                  <Icon name="refresh" size={14} />
                  <span>Reset to Defaults</span>
                </button>

                <button type="submit" className="btn btn-cyan" disabled={!!urlError}>
                  <Icon name="check" size={14} />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Health Check Probe & Runtime Environment */}
        <div>
          {/* Simulated Backend Health Check Card */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="activity" size={18} color="var(--accent-emerald)" />
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Backend Health Probe</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Simulated</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Test HTTP roundtrip responsiveness to target backend at <code>{baseUrl}</code>.
            </p>

            {/* Health outcome simulator toggle */}
            <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Simulate Health Condition:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'HEALTHY', label: '200 OK (Healthy)', color: 'var(--accent-emerald)' },
                  { id: 'DEGRADED', label: 'High Latency (>250ms)', color: 'var(--accent-amber)' },
                  { id: 'OFFLINE', label: 'Connection Refused (Offline)', color: 'var(--accent-rose)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSimulatedOutcome(item.id)}
                    style={{
                      background: simulatedOutcome === item.id ? 'var(--bg-elevated)' : 'transparent',
                      border: `1px solid ${simulatedOutcome === item.id ? item.color : 'var(--border-subtle)'}`,
                      color: simulatedOutcome === item.id ? item.color : 'var(--text-secondary)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: simulatedOutcome === item.id ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-cyan"
                onClick={handleRunHealthCheck}
                disabled={isPinging}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Icon name={isPinging ? 'refresh' : 'activity'} size={15} className={isPinging ? 'spin' : ''} />
                <span>{isPinging ? 'Probing Engine...' : 'Run Connectivity Health Check'}</span>
              </button>
            </div>

            {/* Health Result Box */}
            {healthStatus && (
              <div
                style={{
                  background: healthStatus.status === 'HEALTHY'
                    ? 'rgba(52, 211, 153, 0.08)'
                    : healthStatus.status === 'DEGRADED'
                      ? 'rgba(251, 191, 36, 0.08)'
                      : 'rgba(244, 63, 94, 0.08)',
                  border: `1px solid ${healthStatus.status === 'HEALTHY'
                      ? 'rgba(52, 211, 153, 0.35)'
                      : healthStatus.status === 'DEGRADED'
                        ? 'rgba(251, 191, 36, 0.35)'
                        : 'rgba(244, 63, 94, 0.35)'
                    }`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    className={`badge ${healthStatus.status === 'HEALTHY'
                        ? 'badge-emerald'
                        : healthStatus.status === 'DEGRADED'
                          ? 'badge-amber'
                          : 'badge-rose'
                      }`}
                  >
                    {healthStatus.status} ({healthStatus.code})
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Latency: <strong style={{ color: 'var(--text-primary)' }}>{healthStatus.latencyMs}ms</strong>
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {healthStatus.message}
                </p>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Probed at {healthStatus.timestamp} &bull; Target: {baseUrl}
                </div>
              </div>
            )}
          </div>

          {/* Runtime Environment & Architecture Info Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Icon name="database" size={18} color="var(--accent-violet)" />
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Runtime Environment &amp; State</span>
            </div>

            <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
              <div className="env-property-row">
                <span style={{ color: 'var(--text-muted)' }}>Application Mode:</span>
                <span className="badge badge-amber">STANDALONE MOCK MODE</span>
              </div>
              <div className="env-property-row">
                <span style={{ color: 'var(--text-muted)' }}>Frontend Framework:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>React 18 + Vite</span>
              </div>
              <div className="env-property-row">
                <span style={{ color: 'var(--text-muted)' }}>Target Backend Engine:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{baseUrl}</span>
              </div>
              <div className="env-property-row">
                <span style={{ color: 'var(--text-muted)' }}>Security Protocol:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>X-API-Key (Stateless RBAC)</span>
              </div>
              <div className="env-property-row">
                <span style={{ color: 'var(--text-muted)' }}>PostgreSQL Database Status:</span>
                <span className="badge badge-neutral" title="Unverified in mock mode">
                  Unverified (Mock Mode)
                </span>
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Note on PostgreSQL:</strong> Database metrics and live table connections will only be reported once the backend API endpoints (such as <code>/actuator/health</code> or <code>/api/v1/analytics/status</code>) are connected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
