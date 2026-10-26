import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';

export default function RecentEventsTable({ events, onInspectEvent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.sourceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || evt.eventType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'USER_LOGIN':
        return 'badge-cyan';
      case 'DOWNLOAD_COMPLETED':
        return 'badge-violet';
      case 'FILE_UPLOAD_START':
        return 'badge-emerald';
      case 'SESSION_TERMINATED':
        return 'badge-amber';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="card">
      <div className="chart-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="chart-title">
            <Icon name="database" size={16} color="var(--accent-cyan)" />
            <span>Recent Ingested Events</span>
            <span className="badge badge-neutral" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
              {filteredEvents.length} records
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Live stream buffer &bull; Deduped by eventId into PostgreSQL JSONB
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '0.65rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              placeholder="Search event ID / source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem 0.35rem 2rem',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Event Types</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="DOWNLOAD_COMPLETED">DOWNLOAD_COMPLETED</option>
            <option value="FILE_UPLOAD_START">FILE_UPLOAD_START</option>
            <option value="SESSION_TERMINATED">SESSION_TERMINATED</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
          <Icon name="alert" size={28} color="var(--accent-amber)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.85rem' }}>No events found matching your search criteria.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Type</th>
                <th>Source Node</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => (
                <tr key={evt.eventId}>
                  <td className="mono-cell">{evt.eventId}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(evt.eventType)}`}>
                      {evt.eventType}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {evt.sourceId}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span title={evt.eventTimestamp}>{evt.relativeTime}</span>
                  </td>
                  <td>
                    <span className="badge badge-emerald">
                      <Icon name="check" size={12} />
                      {evt.statusCode} {evt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                      onClick={() => onInspectEvent(evt)}
                    >
                      <Icon name="eye" size={13} color="var(--accent-cyan)" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
