import React, { useState } from 'react';
import { Icon } from '../../components/common/Icons.jsx';

export default function PayloadModal({ event, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Icon name="terminal" size={18} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Raw Event Payload (PostgreSQL JSONB)</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {event.eventId} &bull; {event.eventType}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Source Node: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{event.sourceId}</span>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{event.eventTimestamp}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Payload Object:
            </span>
            <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
              <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="code-block">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
