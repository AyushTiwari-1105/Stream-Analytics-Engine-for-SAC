import React, { useState, useMemo } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import { mockRawEvents, allEventTypes, allSourceIds, allStatuses } from '../../utils/mockEventsData.js';
import PayloadModal from '../Dashboard/PayloadModal.jsx';

export default function EventExplorer({ currentRole }) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Payload inspection modal
  const [inspectedEvent, setInspectedEvent] = useState(null);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return mockRawEvents.filter((evt) => {
      const matchesSearch =
        searchTerm === '' ||
        evt.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.sourceId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'ALL' || evt.eventType === selectedType;
      const matchesSource = selectedSource === 'ALL' || evt.sourceId === selectedSource;
      const matchesStatus = selectedStatus === 'ALL' || evt.status === selectedStatus;

      return matchesSearch && matchesType && matchesSource && matchesStatus;
    });
  }, [searchTerm, selectedType, selectedSource, selectedStatus]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedSource('ALL');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalRecords = filteredEvents.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const currentRecords = filteredEvents.slice(startIndex, endIndex);

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

  const getPayloadSnippet = (evt) => {
    const p = evt.payload || {};
    if (evt.eventType === 'USER_LOGIN') {
      return `userId: ${p.userId || '—'} | method: ${p.authMethod || '—'}`;
    }
    if (evt.eventType === 'DOWNLOAD_COMPLETED') {
      const mb = p.bytesTransferred ? (p.bytesTransferred / 1048576).toFixed(1) : 0;
      return `${mb} MB | ${p.fileName || '—'}`;
    }
    if (evt.eventType === 'FILE_UPLOAD_START') {
      const mb = p.fileSize ? (p.fileSize / 1048576).toFixed(1) : 0;
      return `${mb} MB upload`;
    }
    if (evt.eventType === 'SESSION_TERMINATED') {
      return `reason: ${p.terminationReason || 'USER_LOGOUT'}`;
    }
    return JSON.stringify(p).substring(0, 35);
  };

  return (
    <div className="dashboard-view">
      {/* Explicit Mock Data Indicator Banner */}
      <div className="mock-banner">
        <div className="mock-banner-text">
          <div className="mock-pulse-dot" />
          <span>
            <strong>Simulated Event Explorer Active:</strong> Demonstrating search, multi-field filtering, and pagination over synthetic event streams. Events are not currently being fetched from the PostgreSQL <code>raw_events</code> table.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Icon name="database" size={14} color="var(--accent-cyan)" />
          <span>PostgreSQL JSONB View</span>
        </div>
      </div>

      {/* Page Title & KPI Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="database" size={22} color="var(--accent-cyan)" />
            <span>Raw Event Explorer</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Searchable event log stream with deep PostgreSQL JSONB inspection
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Ingested: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{mockRawEvents.length}</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Filtered: </span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{filteredEvents.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '220px', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: '0.65rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Search Event ID or Source Node..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
          {searchTerm && (
            <button
              onClick={() => handleFilterChange(setSearchTerm)('')}
              style={{ position: 'absolute', right: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        {/* Event Type Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type:</span>
          <select
            value={selectedType}
            onChange={(e) => handleFilterChange(setSelectedType)(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', cursor: 'pointer' }}
          >
            {allEventTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Event Types' : t}
              </option>
            ))}
          </select>
        </div>

        {/* Source ID Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => handleFilterChange(setSelectedSource)(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', cursor: 'pointer' }}
          >
            {allSourceIds.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Sources' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange(setSelectedStatus)(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', cursor: 'pointer' }}
          >
            {allStatuses.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Statuses' : st === 'ACCEPTED' ? '202 Accepted' : '400 Rejected'}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedType !== 'ALL' || selectedSource !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            className="btn btn-secondary"
            onClick={handleResetFilters}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <Icon name="refresh" size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {totalRecords === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <Icon name="alert" size={32} color="var(--accent-amber)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Events Found
            </h3>
            <p style={{ fontSize: '0.825rem', maxWidth: '450px', margin: '0 auto 1.25rem' }}>
              No ingested events match your active search terms or selected filters.
            </p>
            <button className="btn btn-cyan" onClick={handleResetFilters}>
              <Icon name="refresh" size={14} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Type</th>
                    <th>Source Node</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th>Payload Snippet</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((evt) => {
                    const isAccepted = evt.statusCode === 202;
                    return (
                      <tr
                        key={evt.eventId}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setInspectedEvent(evt)}
                      >
                        <td className="mono-cell" style={{ fontWeight: 600 }}>
                          {evt.eventId}
                        </td>
                        <td>
                          <span className={`badge ${getBadgeClass(evt.eventType)}`}>
                            {evt.eventType}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                          {evt.sourceId}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(evt.eventTimestamp).toLocaleTimeString()} ({new Date(evt.eventTimestamp).toLocaleDateString()})
                        </td>
                        <td>
                          <span className={`badge ${isAccepted ? 'badge-emerald' : 'badge-rose'}`}>
                            <Icon name={isAccepted ? 'check' : 'alert'} size={12} />
                            {evt.statusCode} {evt.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getPayloadSnippet(evt)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedEvent(evt);
                            }}
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                          >
                            <Icon name="eye" size={13} color="var(--accent-cyan)" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="pagination-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>
                  Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalRecords}</strong> events
                </span>
                <span style={{ color: 'var(--border-medium)' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '0.15rem 0.4rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Number Buttons */}
              <div className="pagination-pages">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <Icon name="chevronLeft" size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    className={`page-btn ${currentPage === num ? 'active' : ''}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <Icon name="chevronRight" size={14} />
                </button>
              </div>
            </div>
          </>
        )}
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
