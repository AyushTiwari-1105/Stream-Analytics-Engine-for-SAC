import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import { DEFAULT_SCHEMA_TEMPLATE } from '../../utils/mockSchemas.js';
import { registerLiveSchema } from '../../services/schemaService.js';

export default function SchemaModal({ isOpen, onClose, onRegisterSchema, existingSchemas, liveMode = false }) {
  const [eventType, setEventType] = useState('');
  const [schemaVersion, setSchemaVersion] = useState(1);
  const [description, setDescription] = useState('');
  const [jsonDefinition, setJsonDefinition] = useState(DEFAULT_SCHEMA_TEMPLATE);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastStatus, setLastStatus] = useState(null); // real HTTP status from backend

  if (!isOpen) return null;

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonDefinition);
      setJsonDefinition(JSON.stringify(parsed, null, 2));
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(`JSON Syntax Error: ${err.message}`);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setEventType('');
    setSchemaVersion(1);
    setDescription('');
    setJsonDefinition(DEFAULT_SCHEMA_TEMPLATE);
    setErrorMessage('');
    setLastStatus(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLastStatus(null);

    const trimmedEventType = eventType.trim().toUpperCase();

    if (!trimmedEventType) {
      setErrorMessage('Event Type is required (e.g., PAYMENT_PROCESSED).');
      return;
    }
    if (!/^[A-Z0-9_]+$/.test(trimmedEventType)) {
      setErrorMessage('Event Type must contain only alphanumeric characters and underscores.');
      return;
    }

    const versionNum = parseInt(schemaVersion, 10);
    if (isNaN(versionNum) || versionNum < 1) {
      setErrorMessage('Schema Version must be a positive integer (e.g., 1, 2).');
      return;
    }

    // Validate JSON Schema
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonDefinition);
    } catch (err) {
      setErrorMessage(`Invalid JSON definition: ${err.message}`);
      return;
    }

    if (typeof parsedJson !== 'object' || parsedJson === null || Array.isArray(parsedJson)) {
      setErrorMessage('JSON Schema root must be a valid JSON Object.');
      return;
    }
    if (!parsedJson.type && !parsedJson.$schema) {
      setErrorMessage('Schema definition should declare a root "type" (e.g. "object") or a "$schema" URI.');
      return;
    }

    // Build the shape both backend and UI understand
    const schemaPayload = {
      eventType: trimmedEventType,
      schemaVersion: versionNum,
      jsonSchemaDefinition: JSON.stringify(parsedJson, null, 2),
    };

    if (liveMode) {
      // ── LIVE: POST to backend ──────────────────────────────────────────
      setIsSubmitting(true);
      const result = await registerLiveSchema(schemaPayload);
      setIsSubmitting(false);
      setLastStatus(result.status);

      if (result.ok) {
        // Backend returns a plain-text string; we wrap a UI schema from the payload
        const savedSchema = {
          // Backend may not return the saved entity; build a local representation
          id: Date.now(),
          ...schemaPayload,
          status: 'Active',
          standard: parsedJson.$schema ? 'Draft-7' : 'Custom Object',
          updatedAt: 'Stored in PostgreSQL',
          description: description.trim() || `Event contract for ${trimmedEventType}`,
          samplePayload: '{}',
        };
        onRegisterSchema(savedSchema);
        handleClose();
      } else {
        // Surface the real backend error
        const errorText =
          result.data?.error ||
          result.data?.message ||
          `Backend returned ${result.status} ${result.statusText}`;
        const details = result.data?.details;
        setErrorMessage(
          details && details.length > 0
            ? `${errorText}\n• ${details.join('\n• ')}`
            : errorText
        );
      }
    } else {
      // ── MOCK: check for duplicate in session ───────────────────────────
      const duplicate = existingSchemas.find(
        (s) => s.eventType.toUpperCase() === trimmedEventType && s.schemaVersion === versionNum
      );
      if (duplicate) {
        setErrorMessage(`Schema for "${trimmedEventType}" version ${versionNum} already exists.`);
        return;
      }

      const newSchema = {
        id: Date.now(),
        eventType: trimmedEventType,
        schemaVersion: versionNum,
        status: 'Active',
        standard: parsedJson.$schema ? 'Draft-7' : 'Custom Object',
        updatedAt: 'Just now (Mock Session)',
        description: description.trim() || `Event contract for ${trimmedEventType}`,
        jsonSchemaDefinition: JSON.stringify(parsedJson, null, 2),
        samplePayload: JSON.stringify(
          parsedJson.properties
            ? Object.keys(parsedJson.properties).reduce((acc, key) => {
                const prop = parsedJson.properties[key];
                acc[key] = prop.type === 'number' ? 100 : prop.type === 'boolean' ? true : `sample_${key}`;
                return acc;
              }, {})
            : { message: 'sample payload' },
          null,
          2
        ),
      };
      onRegisterSchema(newSchema);
      handleClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '8px',
                background: liveMode ? 'rgba(52, 211, 153, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: liveMode ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
              }}
            >
              <Icon name="plus" size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Register New Event Schema</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Draft-7 validation contract for SAC streaming events
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Mode notice */}
            <div
              style={{
                background: liveMode ? 'rgba(52, 211, 153, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                border: `1px solid ${liveMode ? 'rgba(52, 211, 153, 0.25)' : 'rgba(56, 189, 248, 0.25)'}`,
                borderRadius: '6px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.75rem',
                color: liveMode ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <Icon name={liveMode ? 'zap' : 'shield'} size={15} />
              <span>
                {liveMode ? (
                  <>
                    <strong>LIVE:</strong> Schema will be saved to PostgreSQL via{' '}
                    <code style={{ fontSize: '0.72rem' }}>POST /api/v1/admin/schemas</code>.
                    {lastStatus && (
                      <span style={{ marginLeft: '0.4rem', opacity: 0.8 }}>
                        Last response: <strong>{lastStatus}</strong>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <strong>MOCK:</strong> Registers into the active browser session only. Enable Live Mode on the Schemas page to persist to PostgreSQL.
                  </>
                )}
              </span>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  color: 'var(--accent-rose)',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-line',
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Icon name="alert" size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Event Type Identifier *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. USER_LOGOUT or FILE_UPLOAD"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Schema Version *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={schemaVersion}
                  onChange={(e) => setSchemaVersion(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief summary of event semantics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label">JSON Schema Definition (Draft-7) *</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleFormatJson}
                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                >
                  <Icon name="code" size={13} color="var(--accent-cyan)" />
                  <span>Format JSON</span>
                </button>
              </div>
              <textarea
                className="form-textarea"
                rows="10"
                value={jsonDefinition}
                onChange={(e) => {
                  setJsonDefinition(e.target.value);
                  setErrorMessage('');
                }}
                spellCheck="false"
                required
              />
            </div>
          </div>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem',
              background: 'var(--bg-elevated)',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={`btn ${liveMode ? 'btn-cyan' : 'btn-cyan'}`} disabled={isSubmitting}>
              <Icon name={isSubmitting ? 'refresh' : 'check'} size={14} className={isSubmitting ? 'spin' : ''} />
              <span>
                {isSubmitting
                  ? 'Registering…'
                  : liveMode
                  ? 'Register Schema (Live → PostgreSQL)'
                  : 'Register Schema (Mock)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
