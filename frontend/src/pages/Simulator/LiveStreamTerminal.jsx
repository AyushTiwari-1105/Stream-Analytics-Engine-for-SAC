import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/common/Icons.jsx';

export default function LiveStreamTerminal({ logs, onClearLogs, onInspectEvent }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACCEPTED' | 'REJECTED'
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef(null);
  // Track whether user has scrolled away from the bottom inside the terminal
  const userScrolledUpRef = useRef(false);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'ACCEPTED') return l.statusCode === 202;
    if (filter === 'REJECTED') return l.statusCode === 400;
    return true;
  });

  // Only auto-scroll the terminal container — never the page.
  // Honour the user's position if they scrolled up inside the terminal.
  useEffect(() => {
    if (autoScroll && !userScrolledUpRef.current && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleTerminalScroll = () => {
    if (!terminalRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    // If user is within 40 px of the bottom, treat as "at bottom"
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 40;
  };

  const handleToggleAutoScroll = (e) => {
    const checked = e.target.checked;
    setAutoScroll(checked);
    if (checked) {
      userScrolledUpRef.current = false;
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="database" size={18} color="var(--accent-violet)" />
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>Live Ingestion Stream Feed</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {logs.length} events
          </span>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Events</option>
            <option value="ACCEPTED">202 Accepted Only</option>
            <option value="REJECTED">400 Errors Only</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={handleToggleAutoScroll}
            />
            <span>Auto-scroll</span>
          </label>

          <button
            className="btn btn-secondary"
            onClick={onClearLogs}
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            title="Clear stream terminal"
          >
            <Icon name="trash" size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Incoming event buffer — all rows reflect real backend HTTP responses. Click any row to view payload.
      </div>

      {/* Terminal Console */}
      <div className="terminal-window" style={{ flex: 1, minHeight: '440px' }} ref={terminalRef} onScroll={handleTerminalScroll}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <Icon name="terminal" size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Stream buffer is empty.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Dispatch a single event or start the continuous stream generator to view live telemetry logs.
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isAccepted = log.statusCode === 202;
            const dto = log.eventDto || {};
            const payload = dto.payload || {};

            let summarySnippet = '';
            if (dto.eventType === 'USER_LOGIN') {
              summarySnippet = `user: ${payload.userId || '—'} | status: ${payload.status || '—'}`;
            } else if (dto.eventType === 'DOWNLOAD_COMPLETED') {
              summarySnippet = `bytes: ${(payload.bytesTransferred || 0).toLocaleString()} | file: ${payload.fileName || '—'}`;
            } else if (dto.eventType === 'FILE_UPLOAD_START') {
              summarySnippet = `size: ${(payload.fileSize || 0).toLocaleString()} B`;
            } else {
              summarySnippet = JSON.stringify(payload).substring(0, 40);
            }

            return (
              <div
                key={index}
                className={`terminal-log-row ${isAccepted ? 'accepted' : 'rejected'}`}
                onClick={() => onInspectEvent(log)}
                title="Click to view full event JSON payload"
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>
                  {log.timestamp}
                </span>

                <span className={`badge ${isAccepted ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', flexShrink: 0 }}>
                  {log.statusCode}
                </span>

                <span
                  className="badge badge-emerald"
                  style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', flexShrink: 0, opacity: 0.85 }}
                >
                  LIVE
                </span>

                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, flexShrink: 0, fontSize: '0.725rem' }}>
                  {dto.eventType}
                </span>

                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, fontSize: '0.7rem' }}>
                  {dto.eventId}
                </span>

                <span style={{ color: isAccepted ? 'var(--text-muted)' : 'var(--accent-rose)', flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word', fontSize: '0.7rem' }}>
                  {isAccepted ? summarySnippet : (log.details ? log.details.join('; ') : log.error)}
                </span>

                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.65rem', flexShrink: 0 }}>
                  {log.latencyMs}ms
                </span>
              </div>
            );
          })
        )}
        {/* sentinel removed — container scrolls via ref */}
      </div>
    </div>
  );
}
