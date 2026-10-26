import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import {
  simulatorTemplates,
  generateEventId,
  getCurrentIsoTimestamp,
} from '../../utils/mockSimulatorPresets.js';
import { dispatchLiveEvent } from '../../services/eventService.js';
import { getPublisherApiKey } from '../../services/configService.js';

export default function SingleEventSender({ onEventDispatched }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('USER_LOGIN');
  const [eventId, setEventId] = useState(generateEventId());
  const [sourceId, setSourceId] = useState(simulatorTemplates.USER_LOGIN.sourceId);
  const [eventType, setEventType] = useState(simulatorTemplates.USER_LOGIN.eventType);
  const [schemaVersion, setSchemaVersion] = useState(simulatorTemplates.USER_LOGIN.schemaVersion);
  const [eventTimestamp, setEventTimestamp] = useState(getCurrentIsoTimestamp());
  const [payloadText, setPayloadText] = useState(JSON.stringify(simulatorTemplates.USER_LOGIN.payload, null, 2));
  const [jsonError, setJsonError] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const handleSelectTemplate = (key) => {
    const tmpl = simulatorTemplates[key];
    if (!tmpl) return;
    setSelectedTemplateKey(key);
    setEventId(generateEventId());
    setSourceId(tmpl.sourceId);
    setEventType(tmpl.eventType);
    setSchemaVersion(tmpl.schemaVersion);
    setEventTimestamp(getCurrentIsoTimestamp());
    setPayloadText(JSON.stringify(tmpl.payload, null, 2));
    setJsonError('');
    setLastResponse(null);
  };

  const handlePayloadChange = (val) => {
    setPayloadText(val);
    try {
      JSON.parse(val);
      setJsonError('');
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleFormatPayload = () => {
    try {
      const parsed = JSON.parse(payloadText);
      setPayloadText(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err) {
      setJsonError(`Cannot format: ${err.message}`);
    }
  };

  const handleSendEvent = async (e) => {
    e.preventDefault();
    setLastResponse(null);

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err) {
      setJsonError(`Invalid JSON payload: ${err.message}`);
      return;
    }

    const eventDto = {
      eventId: eventId.trim(),
      sourceId: sourceId.trim(),
      eventType: eventType.trim(),
      schemaVersion: parseInt(schemaVersion, 10) || 1,
      eventTimestamp: eventTimestamp.trim(),
      payload: parsedPayload,
    };

    setIsSending(true);

    // Always dispatch as a real HTTP call
    const result = await dispatchLiveEvent(eventDto);
    const response = {
      statusCode: result.status,
      status: result.statusText,
      message: result.data?.message || result.data?.error || result.statusText,
      details: result.data?.details || null,
      latencyMs: result.latencyMs,
      timestamp: new Date().toLocaleTimeString(),
      eventDto,
      isLive: true,
    };
    setLastResponse(response);
    setIsSending(false);
    if (onEventDispatched) onEventDispatched(response);
  };

  const hasPublisherKey = !!getPublisherApiKey();

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="terminal" size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>Single Event Dispatcher</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>● LIVE</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>POST /api/v1/events</span>
        </div>
      </div>

      {/* Publisher key warning */}
      {!hasPublisherKey && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '6px',
            padding: '0.55rem 0.85rem',
            fontSize: '0.77rem',
            color: 'var(--accent-amber)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <Icon name="shield" size={14} color="var(--accent-amber)" />
          <span><strong>Publisher API Key not set.</strong> Requests will return 401. Go to Settings → API Keys.</span>
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Choose a preset event template or customize the incoming streaming payload:
      </div>

      {/* Preset Chips */}
      <div className="template-chips">
        {Object.keys(simulatorTemplates).map((key) => {
          const tmpl = simulatorTemplates[key];
          const isSelected = selectedTemplateKey === key;
          const isInvalid = key === 'INVALID_PAYLOAD';
          return (
            <button
              key={key}
              type="button"
              className={`template-chip ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectTemplate(key)}
              style={isInvalid ? { borderColor: isSelected ? 'var(--accent-rose)' : 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)' } : {}}
            >
              {tmpl.name}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSendEvent}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label">eventId (Deduplication PK) *</label>
              <button
                type="button"
                onClick={() => setEventId(generateEventId())}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Regenerate
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">sourceId (Publisher Node) *</label>
            <input
              type="text"
              className="form-input"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">eventType *</label>
            <input
              type="text"
              className="form-input"
              value={eventType}
              onChange={(e) => setEventType(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">schemaVersion *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={schemaVersion}
              onChange={(e) => setSchemaVersion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label">eventTimestamp *</label>
              <button
                type="button"
                onClick={() => setEventTimestamp(getCurrentIsoTimestamp())}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Now
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              value={eventTimestamp}
              onChange={(e) => setEventTimestamp(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Payload JSON */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label className="form-label">payload (Dynamic PostgreSQL JSONB) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: jsonError ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                {jsonError ? 'Syntax Error' : 'Valid JSON'}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleFormatPayload}
                style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
              >
                Format
              </button>
            </div>
          </div>
          <textarea
            className="form-textarea"
            rows="6"
            value={payloadText}
            onChange={(e) => handlePayloadChange(e.target.value)}
            spellCheck="false"
            style={{ width: '100%', borderColor: jsonError ? 'var(--accent-rose)' : 'var(--border-subtle)' }}
            required
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Header: <code>X-API-Key: {hasPublisherKey ? '••••••••' : '(not set)'}</code>
          </span>
          <button
            type="submit"
            className="btn btn-cyan"
            disabled={isSending || !!jsonError}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Icon name={isSending ? 'refresh' : 'send'} size={14} className={isSending ? 'spin' : ''} />
            <span>{isSending ? 'Dispatching…' : 'Dispatch Event (Live)'}</span>
          </button>
        </div>
      </form>

      {/* Response Panel */}
      {lastResponse && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${lastResponse.statusCode === 202 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            background: lastResponse.statusCode === 202 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                className={`badge ${lastResponse.statusCode === 202 ? 'badge-emerald' : 'badge-rose'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {lastResponse.statusCode} {lastResponse.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Latency:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{lastResponse.latencyMs}ms</strong>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>LIVE</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lastResponse.timestamp}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
            {lastResponse.message || lastResponse.error}
          </p>

          {lastResponse.details && (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.4rem', lineHeight: 1.5 }}>
              {lastResponse.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
