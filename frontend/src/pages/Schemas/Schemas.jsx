import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import SchemaDetailView from './SchemaDetailView.jsx';
import SchemaModal from './SchemaModal.jsx';
import { fetchLiveSchemas } from '../../services/schemaService.js';
import { getAdminApiKey } from '../../services/configService.js';

/**
 * Maps a raw backend EventSchema row to the richer shape used by the UI.
 */
function mapBackendSchema(raw) {
  return {
    id: raw.id,
    eventType: raw.eventType,
    schemaVersion: raw.schemaVersion,
    jsonSchemaDefinition: raw.jsonSchemaDefinition,
    status: 'Active',
    standard: 'Draft-7',
    updatedAt: 'Stored in PostgreSQL',
    description: `Event contract for ${raw.eventType}`,
    samplePayload: '{}',
  };
}

export default function Schemas({ currentRole = 'ROLE_ADMIN' }) {
  // ─── Schema list state ───────────────────────────────────────────────────────
  const [schemas, setSchemas] = useState([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // ─── Live fetch state ─────────────────────────────────────────────────────────
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [lastFetchStatus, setLastFetchStatus] = useState(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // ─── Live fetch ───────────────────────────────────────────────────────────────
  const loadLiveSchemas = useCallback(async () => {
    setIsFetching(true);
    setFetchError('');
    const result = await fetchLiveSchemas();
    setLastFetchStatus(result.status);
    setIsFetching(false);

    if (result.ok && Array.isArray(result.data)) {
      const mapped = result.data.map(mapBackendSchema);
      setSchemas(mapped);
      setSelectedSchemaId(mapped.length > 0 ? mapped[0].id : null);
      setFetchError('');
    } else {
      const msg =
        result.data?.error ||
        `Backend returned ${result.status} ${result.statusText}`;
      setFetchError(msg);
      setSchemas([]);
      setSelectedSchemaId(null);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadLiveSchemas();
  }, [loadLiveSchemas]);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const filteredSchemas = schemas.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.eventType.toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term)
    );
  });

  const selectedSchema = schemas.find((s) => s.id === selectedSchemaId) || schemas[0] || null;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleRegisterNewSchema = (newSchema) => {
    setSchemas((prev) => [newSchema, ...prev]);
    setSelectedSchemaId(newSchema.id);
    setIsModalOpen(false);
    showToast(`✓ Schema "${newSchema.eventType} v${newSchema.schemaVersion}" registered in PostgreSQL.`, 'success');
  };

  const handleUpdateDefinition = (id, newJsonDefinition) => {
    setSchemas((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, jsonSchemaDefinition: newJsonDefinition, updatedAt: 'Stored in PostgreSQL' }
          : s
      )
    );
  };

  const handleDeleteSchema = (id) => {
    const updated = schemas.filter((s) => s.id !== id);
    setSchemas(updated);
    if (selectedSchemaId === id && updated.length > 0) {
      setSelectedSchemaId(updated[0].id);
    }
    showToast('Schema removed from this session view (backend deletion not implemented in Phase 1).', 'success');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  const hasAdminKey = !!getAdminApiKey();

  return (
    <div className="dashboard-view">

      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          border: ' 1px solid rgba(52, 211, 153, 0.4)',
          background: 'rgba(52, 211, 153, 0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent-emerald)',
              boxShadow: '0 0 8px var(--accent-emerald)',
            }}
          />
          <span style={{ color: 'var(--accent-emerald)' }}>
            <strong>LIVE MODE</strong> — Schema list fetched from PostgreSQL via{' '}
            <code style={{ fontSize: '0.75rem' }}>GET /api/v1/admin/schemas</code>.
            {lastFetchStatus && (
              <span style={{ marginLeft: '0.4rem', opacity: 0.8 }}>
                Last response: <strong>{lastFetchStatus}</strong>
                {' · '}{isFetching ? 'refreshing…' : `${schemas.length} schema(s)`}
              </span>
            )}
          </span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={loadLiveSchemas}
          disabled={isFetching}
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
        >
          <Icon name="refresh" size={13} className={isFetching ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── No API key warning ───────────────────────────────────────────── */}
      {!hasAdminKey && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--accent-amber)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <Icon name="shield" size={15} color="var(--accent-amber)" />
          <span>
            <strong>Admin API Key not set.</strong> Requests will return 401. Go to{' '}
            <strong>Settings → API Keys</strong> to configure it.
          </span>
        </div>
      )}

      {/* ── Fetch error banner ───────────────────────────────────────────── */}
      {fetchError && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--accent-rose)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <Icon name="alert" size={15} />
          <span>
            <strong>Backend error{lastFetchStatus ? ` (${lastFetchStatus})` : ''}:</strong> {fetchError}
          </span>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          style={{
            background: toastType === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${toastType === 'success' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: toastType === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <Icon name={toastType === 'success' ? 'check' : 'alert'} size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="layers" size={22} color="var(--accent-violet)" />
            <span>Event Schema Registry</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Contracts enforced by the Spring Boot NetworkNT Draft-7 engine during ingestion
          </p>
        </div>

        {/* Register button — ADMIN only */}
        {currentRole === 'ROLE_ADMIN' ? (
          <button
            className="btn btn-cyan"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0.55rem 1rem' }}
          >
            <Icon name="plus" size={16} />
            <span>Register New Schema</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              background: 'rgba(129, 140, 248, 0.08)',
              fontSize: '0.78rem',
              color: 'var(--accent-violet)',
            }}
          >
            <Icon name="shield" size={14} color="var(--accent-violet)" />
            <span>Only <strong>ADMIN</strong> users can register new schemas.</span>
          </div>
        )}
      </div>

      {/* ── Schema Grid ──────────────────────────────────────────────────── */}
      <div className="schema-grid">
        {/* Left: Catalog */}
        <div>
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ position: 'absolute', left: '0.65rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                placeholder="Search schemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.65rem 0.4rem 2rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Registered Schemas</span>
              <span>{filteredSchemas.length} items</span>
            </div>

            <div className="schema-catalog-list">
              {isFetching ? (
                <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Icon name="refresh" size={18} className="spin" style={{ marginBottom: '0.5rem' }} />
                  <p>Loading from backend…</p>
                </div>
              ) : filteredSchemas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {fetchError
                    ? 'Could not load schemas — see error above.'
                    : searchTerm
                      ? `No schemas match "${searchTerm}".`
                      : 'No schemas registered in the database yet.'}
                </div>
              ) : (
                filteredSchemas.map((s) => {
                  const isSelected = selectedSchema && selectedSchema.id === s.id;
                  return (
                    <button
                      key={s.id}
                      className={`schema-card-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSchemaId(s.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                          {s.eventType}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                          v{s.schemaVersion}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '2px 0' }}>
                        {(s.description || '').length > 55
                          ? `${(s.description || '').substring(0, 55)}...`
                          : (s.description || '')}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 500 }}>● {s.status}</span>
                        <span>{s.standard}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail View */}
        <div>
          {selectedSchema ? (
            <SchemaDetailView
              schema={selectedSchema}
              onUpdateSchemaDefinition={handleUpdateDefinition}
              onDeleteSchema={handleDeleteSchema}
            />
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon name="layers" size={32} style={{ marginBottom: '0.75rem' }} />
              <h3>No Schema Selected</h3>
              <p style={{ fontSize: '0.85rem' }}>Select a schema from the catalog or register a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Register Modal (ADMIN only) ───────────────────────────────── */}
      {currentRole === 'ROLE_ADMIN' && (
        <SchemaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRegisterSchema={handleRegisterNewSchema}
          existingSchemas={schemas}
          liveMode={true}
        />
      )}
    </div>
  );
}
