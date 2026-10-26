import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import SingleEventSender from './SingleEventSender.jsx';
import StreamGenerator from './StreamGenerator.jsx';
import LiveStreamTerminal from './LiveStreamTerminal.jsx';
import PayloadModal from '../Dashboard/PayloadModal.jsx';
import { getPublisherApiKey } from '../../services/configService.js';

export default function Simulator({ currentRole = 'ROLE_PUBLISHER', logs = [], onLogsChange }) {
  const [inspectedEvent, setInspectedEvent] = useState(null);

  const handleAddLog = (logEntry) => {
    onLogsChange((prev) => {
      const next = [...prev, logEntry];
      // Keep at most 200 entries in memory (sessionStorage cap applied in App)
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
  };

  const handleClearLogs = () => onLogsChange([]);

  const handleInspectLog = (log) => {
    if (log && log.eventDto) {
      setInspectedEvent({
        eventId: log.eventDto.eventId,
        eventType: log.eventDto.eventType,
        sourceId: log.eventDto.sourceId,
        eventTimestamp: log.eventDto.eventTimestamp,
        payload: log.eventDto.payload,
      });
    }
  };

  const hasPublisherKey = !!getPublisherApiKey();

  return (
    <div className="dashboard-view">

      {/* ── Status Banner ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          gap: '0.5rem', fontSize: '0.8rem',
          padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          background: 'rgba(52, 211, 153, 0.07)',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
        <span style={{ color: 'var(--accent-emerald)' }}>
          <strong>LIVE MODE</strong> — Single-event dispatch calls{' '}
          <code style={{ fontSize: '0.75rem' }}>POST /api/v1/events</code> with your Publisher API Key.
          The stream generator also sends real requests when started.
        </span>
      </div>

      {/* Publisher key warning */}
      {!hasPublisherKey && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.8rem',
            color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <Icon name="shield" size={15} color="var(--accent-amber)" />
          <span>
            <strong>Publisher API Key not set.</strong> Dispatch requests will return 401. Go to{' '}
            <strong>Settings → API Keys</strong> to configure it.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="terminal" size={22} color="var(--accent-cyan)" />
          <span>Publisher Event Ingestion Simulator</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Test single event validation or simulate continuous high-throughput streams into the SAC pipeline
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="simulator-grid">
        {/* Left: Dispatcher & Continuous Generator */}
        <div>
          <SingleEventSender onEventDispatched={handleAddLog} />
          <StreamGenerator onStreamEventGenerated={handleAddLog} />
        </div>

        {/* Right: Live Flowing Ingestion Stream Feed */}
        <div>
          <LiveStreamTerminal
            logs={logs}
            onClearLogs={handleClearLogs}
            onInspectEvent={handleInspectLog}
          />
        </div>
      </div>

      {/* Payload Modal for Inspection */}
      {inspectedEvent && (
        <PayloadModal
          event={inspectedEvent}
          onClose={() => setInspectedEvent(null)}
        />
      )}
    </div>
  );
}
