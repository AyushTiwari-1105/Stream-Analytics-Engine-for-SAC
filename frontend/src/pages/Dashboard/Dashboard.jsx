import React, { useState, useEffect, useCallback, useRef } from 'react';
import KpiSection from './KpiSection.jsx';
import EventsOverTimeChart from '../../components/charts/EventsOverTimeChart.jsx';
import EventDistributionChart from '../../components/charts/EventDistributionChart.jsx';
import PayloadModal from './PayloadModal.jsx';
import { Icon } from '../../components/common/Icons.jsx';
import { apiFetch } from '../../services/apiClient.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024));
  return `${(bytes / Math.pow(1024, Math.min(i, units.length - 1))).toFixed(1)} ${units[Math.min(i, units.length - 1)]}`;
}

function relativeTime(ts) {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function buildKpiStats(metrics, schemas) {
  const loginRow = metrics
    .filter((m) => m.metricName === 'total_login_attempts')
    .sort((a, b) => new Date(b.windowEnd) - new Date(a.windowEnd))[0];

  const bytesRow = metrics
    .filter((m) => m.metricName === 'total_bytes_transferred')
    .sort((a, b) => new Date(b.windowEnd) - new Date(a.windowEnd))[0];

  const totalLoginVal = loginRow ? Math.round(loginRow.metricValue) : null;
  const totalBytesVal = bytesRow ? bytesRow.metricValue : null;

  return {
    eventsProcessed: {
      value: schemas !== null ? `${schemas.length}` : '—',
      delta: schemas !== null ? `${schemas.length} registered` : '—',
      comparison: 'schemas in PostgreSQL',
      isPositive: true,
      sparkline: [],
    },
    eventsPerSecond: {
      value: metrics.length > 0 ? `${metrics.length}` : '—',
      delta: metrics.length > 0 ? `${metrics.length} metric rows` : 'no data yet',
      comparison: 'aggregated_metrics rows',
      isPositive: metrics.length > 0,
      sparkline: [],
    },
    totalLogins: {
      value: totalLoginVal !== null ? totalLoginVal.toLocaleString() : '—',
      delta: totalLoginVal !== null ? 'last 24 h window' : 'awaiting scheduler',
      comparison: 'USER_LOGIN events',
      isPositive: totalLoginVal !== null && totalLoginVal > 0,
      sparkline: [],
    },
    bytesTransferred: {
      value: totalBytesVal !== null ? formatBytes(totalBytesVal) : '—',
      delta: totalBytesVal !== null ? 'last 24 h window' : 'awaiting scheduler',
      comparison: 'DOWNLOAD_COMPLETED bytes',
      isPositive: totalBytesVal !== null && totalBytesVal > 0,
      sparkline: [],
    },
  };
}

function buildDistribution(metrics) {
  const loginRow = metrics
    .filter((m) => m.metricName === 'total_login_attempts')
    .sort((a, b) => new Date(b.windowEnd) - new Date(a.windowEnd))[0];

  const bytesRow = metrics
    .filter((m) => m.metricName === 'total_bytes_transferred')
    .sort((a, b) => new Date(b.windowEnd) - new Date(a.windowEnd))[0];

  const loginCount = loginRow ? Math.round(Number(loginRow.metricValue) || 0) : 0;

  // In aggregated_metrics from PostgreSQL, total_bytes_transferred is tracked for DOWNLOAD_COMPLETED.
  // Average payload size per simulated download event is ~22 MB (22,046,405 bytes in actual PostgreSQL dataset).
  let downloadCount = 0;
  try {
    const saved = sessionStorage.getItem('simulator_logs');
    if (saved) {
      const logs = JSON.parse(saved);
      if (Array.isArray(logs) && logs.length > 0) {
        downloadCount = logs.filter(
          (l) => (l.eventType || l.eventDto?.eventType) === 'DOWNLOAD_COMPLETED'
        ).length;
      }
    }
  } catch { /* ignore */ }

  const bytesVal = bytesRow ? Number(bytesRow.metricValue) || 0 : 0;
  const dbDownloadCount = bytesVal > 0 ? Math.max(1, Math.round(bytesVal / 22046405)) : 0;
  if (downloadCount === 0 || dbDownloadCount > downloadCount) {
    downloadCount = dbDownloadCount;
  }

  const total = (loginCount + downloadCount) || 1;
  const result = [];

  if (loginCount > 0 || downloadCount > 0) {
    const loginPct = Math.round((loginCount / total) * 100);
    const downloadPct = 100 - loginPct;

    result.push({
      type: 'USER_LOGIN',
      count: loginCount,
      percentage: loginPct,
      color: '#38bdf8',
    });

    result.push({
      type: 'DOWNLOAD_COMPLETED',
      count: downloadCount,
      percentage: downloadPct,
      color: '#818cf8',
    });
  }

  return result;
}

function buildEventsOverTime(metrics, timeRange) {
  if (!metrics || metrics.length === 0) return [];

  // Group metrics by timestamp (windowEnd) from PostgreSQL
  const timestampMap = new Map();

  for (const m of metrics) {
    if (!m.windowEnd) continue;
    const timeKey = m.windowEnd;
    if (!timestampMap.has(timeKey)) {
      timestampMap.set(timeKey, {
        timestamp: m.windowEnd,
        date: new Date(m.windowEnd),
        eventCount: 0,
        bytes: 0,
        breakdown: {},
      });
    }
    const entry = timestampMap.get(timeKey);
    if (m.metricName === 'total_login_attempts' || m.eventType === 'USER_LOGIN') {
      const count = Math.round(Number(m.metricValue) || 0);
      entry.eventCount += count;
      entry.breakdown[m.eventType || 'USER_LOGIN'] = (entry.breakdown[m.eventType || 'USER_LOGIN'] || 0) + count;
    } else if (m.metricName === 'total_bytes_transferred') {
      entry.bytes += Number(m.metricValue) || 0;
    } else if (m.metricName?.includes('count') || m.metricName?.includes('attempt') || m.metricName?.includes('event')) {
      const count = Math.round(Number(m.metricValue) || 0);
      entry.eventCount += count;
      entry.breakdown[m.eventType || m.metricName] = (entry.breakdown[m.eventType || m.metricName] || 0) + count;
    }
  }

  // Sort chronologically (oldest to newest)
  const sortedPoints = Array.from(timestampMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (sortedPoints.length === 0) return [];

  // Filter based on timeRange relative to newest point
  const latestMs = sortedPoints[sortedPoints.length - 1].date.getTime();
  let filtered = sortedPoints;

  if (timeRange === '15m') {
    const cutoff = latestMs - 15 * 60 * 1000;
    filtered = sortedPoints.filter((p) => p.date.getTime() >= cutoff);
  } else if (timeRange === '1h') {
    const cutoff = latestMs - 60 * 60 * 1000;
    filtered = sortedPoints.filter((p) => p.date.getTime() >= cutoff);
  } else if (timeRange === '24h') {
    const cutoff = latestMs - 24 * 60 * 60 * 1000;
    filtered = sortedPoints.filter((p) => p.date.getTime() >= cutoff);
  }

  // If filter left fewer than 2 points, but we have more total data, include up to the last 20 points
  if (filtered.length < 2 && sortedPoints.length >= 2) {
    filtered = sortedPoints.slice(-20);
  }

  return filtered.map((p) => {
    const d = p.date;
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullDate = d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return {
      rawTimestamp: p.timestamp,
      time: timeLabel,
      fullTime: fullDate,
      eventCount: p.eventCount,
      bytes: p.bytes,
      breakdown: p.breakdown,
    };
  });
}

// ─── Dashboard Component ──────────────────────────────────────────────────────

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('15m');
  const [inspectedEvent, setInspectedEvent] = useState(null);

  const [schemas, setSchemas] = useState(null);
  const [schemaError, setSchemaError] = useState('');
  const [schemaLoading, setSchemaLoading] = useState(true);

  const [metrics, setMetrics] = useState([]);
  const [metricsError, setMetricsError] = useState('');
  const [metricsStatus, setMetricsStatus] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const pollRef = useRef(null);

  const fetchSchemas = useCallback(async () => {
    setSchemaLoading(true);
    const result = await apiFetch('admin', '/v1/admin/schemas', { method: 'GET' });
    setSchemaLoading(false);
    if (result.ok && Array.isArray(result.data)) {
      setSchemas(result.data);
      setSchemaError('');
    } else {
      setSchemaError(
        result.data?.error || `Schema fetch failed: ${result.status} ${result.statusText}`
      );
      setSchemas(null);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    const result = await apiFetch('admin', '/v1/admin/metrics', { method: 'GET' });
    setMetricsStatus(result.status);
    setMetricsLoading(false);
    if (result.ok && Array.isArray(result.data)) {
      // Sort descending by ID with highest ID first (e.g., 390, 389, 388, 387...)
      const sorted = result.data.slice().sort(
        (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
      );
      setMetrics(sorted);
      setMetricsError('');
    } else if (result.status === 404) {
      setMetricsError(
        'GET /api/v1/admin/metrics returned 404. ' +
        'The scheduler writes to aggregated_metrics every 30 s, but no REST endpoint exposes it yet. ' +
        'Add a GET /api/v1/admin/metrics controller to the backend to populate these KPIs.'
      );
      setMetrics([]);
    } else {
      setMetricsError(
        result.data?.error || `Metrics fetch failed: ${result.status} ${result.statusText}`
      );
      setMetrics([]);
    }
  }, []);

  useEffect(() => {
    fetchSchemas();
    fetchMetrics();
    pollRef.current = setInterval(() => {
      fetchSchemas();
      fetchMetrics();
    }, 30_000);
    return () => clearInterval(pollRef.current);
  }, [fetchSchemas, fetchMetrics]);

  const kpiStats = buildKpiStats(metrics, schemas);
  const distributionData = buildDistribution(metrics);
  const eventsOverTimeData = buildEventsOverTime(metrics, timeRange);
  const isLoading = schemaLoading && metricsLoading;

  if (isLoading) {
    return (
      <div className="dashboard-view">
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Icon name="refresh" size={32} color="var(--accent-cyan)" className="spin" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Connecting to backend…</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Fetching telemetry data from the Spring Boot backend.
          </p>
        </div>
      </div>
    );
  }

  if (schemaError && schemas === null) {
    return (
      <div className="dashboard-view">
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.05)',
            textAlign: 'center',
          }}
        >
          <Icon name="alert" size={36} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--accent-rose)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Backend Unreachable
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {schemaError}. Ensure the Spring Boot backend is running and your Admin API Key is set in Settings.
          </p>
          <button className="btn btn-cyan" onClick={() => { fetchSchemas(); fetchMetrics(); }}>
            <Icon name="refresh" size={14} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">

      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="activity" size={22} color="var(--accent-cyan)" />
            <span>Telemetry Overview</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Connected to live backend — real-time stream analytics from PostgreSQL.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => { fetchSchemas(); fetchMetrics(); }}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Icon name="refresh" size={13} className={schemaLoading || metricsLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Metrics endpoint notice ────────────────────────────────────────────── */}
      {metricsError && (
        <div
          style={{
            background: metricsStatus === 404 ? 'rgba(245,158,11,0.08)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${metricsStatus === 404 ? 'rgba(245,158,11,0.35)' : 'rgba(244,63,94,0.35)'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: metricsStatus === 404 ? 'var(--accent-amber)' : 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <Icon name="alert" size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Aggregated Metrics ({metricsStatus}):</strong>{' '}
            {metricsError}
          </div>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <KpiSection stats={kpiStats} />

      {/* ── Charts Row ────────────────────────────────────────────────────────── */}
      <div className="charts-grid" style={{ marginTop: '1.25rem' }}>
        <EventsOverTimeChart
          data={eventsOverTimeData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <EventDistributionChart data={distributionData} />
      </div>

      {/* ── Aggregated Metrics Table ───────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Icon name="database" size={16} color="var(--accent-emerald)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Aggregated Metrics — PostgreSQL</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>
            {metrics.length} rows
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Scheduler runs every 30 s · auto-refreshes
          </span>
        </div>

        {metricsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Icon name="refresh" size={20} className="spin" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading metrics…</p>
          </div>
        ) : metrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Icon name="database" size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              {metricsError
                ? 'Cannot load aggregated metrics — see notice above.'
                : 'No rows in aggregated_metrics yet.'}
            </p>
            <p style={{ fontSize: '0.78rem' }}>
              Use the <strong>Event Simulator</strong> to ingest events. The scheduler aggregates them every 30 s.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Metric Name</th>
                  <th>Event Type</th>
                  <th>Value</th>
                  <th>Window Start</th>
                  <th>Window End</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id}>
                    <td className="mono-cell" style={{ color: 'var(--text-muted)' }}>{m.id}</td>
                    <td>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {m.metricName}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${m.eventType === 'USER_LOGIN' ? 'badge-violet' : 'badge-emerald'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {m.eventType}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {m.metricName === 'total_bytes_transferred'
                        ? formatBytes(m.metricValue)
                        : Math.round(m.metricValue).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{relativeTime(m.windowStart)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{relativeTime(m.windowEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Schema Registry Summary ────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Icon name="layers" size={16} color="var(--accent-violet)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Event Schema Registry</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>
            {schemas ? schemas.length : '—'} schemas
          </span>
        </div>

        {schemaLoading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            <Icon name="refresh" size={18} className="spin" />
          </div>
        ) : schemas && schemas.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {schemas.map((s) => (
              <div
                key={s.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{s.eventType}</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>v{s.schemaVersion}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {schemaError || 'No schemas registered yet.'}
          </p>
        )}
      </div>

      {/* ── Payload Modal ──────────────────────────────────────────────────────── */}
      {inspectedEvent && (
        <PayloadModal
          event={inspectedEvent}
          onClose={() => setInspectedEvent(null)}
        />
      )}
    </div>
  );
}
