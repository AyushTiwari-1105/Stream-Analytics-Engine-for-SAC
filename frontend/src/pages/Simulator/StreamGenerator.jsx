import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/common/Icons.jsx';
import { createRandomStreamEvent } from '../../utils/mockSimulatorPresets.js';
import { dispatchLiveEvent } from '../../services/eventService.js';

/**
 * StreamGenerator
 * ─────────────────────────────────────────────────────────────────────────────
 * Always operates in live mode. Each tick sends a real POST /api/v1/events request.
 * Rate is bounded to 1–10 ev/s, matching the slider.
 * A confirmation warning is shown before the user starts the stream.
 */
export default function StreamGenerator({ onStreamEventGenerated }) {
  const [isRunning, setIsRunning] = useState(false);
  const [ratePerSec, setRatePerSec] = useState(3);
  const [showWarning, setShowWarning] = useState(false);
  const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0 });

  const timerRef = useRef(null);

  const stopGenerator = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const startGenerator = () => {
    stopGenerator();
    setIsRunning(true);

    const intervalMs = Math.floor(1000 / ratePerSec);

    timerRef.current = setInterval(async () => {
      let eventDto = createRandomStreamEvent();

      // ~5 % of events deliberately inject a schema-violation payload
      if (Math.random() < 0.05) {
        eventDto = { ...eventDto, payload: { corrupted: true, missingUserId: null } };
      }

      // Always send as a real HTTP request
      const result = await dispatchLiveEvent(eventDto);
      const isAccepted = result.ok;

      setStats((prev) => ({
        total: prev.total + 1,
        accepted: isAccepted ? prev.accepted + 1 : prev.accepted,
        rejected: !isAccepted ? prev.rejected + 1 : prev.rejected,
      }));

      if (onStreamEventGenerated) {
        onStreamEventGenerated({
          statusCode: result.status,
          status: result.statusText,
          message: result.data?.message || result.data?.error || result.statusText,
          details: result.data?.details || null,
          latencyMs: result.latencyMs,
          timestamp: new Date().toLocaleTimeString(),
          eventDto,
          isLive: true,
        });
      }
    }, intervalMs);
  };

  // Restart interval when rate changes while running
  useEffect(() => {
    if (isRunning) startGenerator();
  }, [ratePerSec]); // eslint-disable-line react-hooks/exhaustive-deps

  // CRITICAL: cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleResetStats = () => setStats({ total: 0, accepted: 0, rejected: 0 });

  const handleStartClick = () => {
    setShowWarning(true);
  };

  const confirmStart = () => {
    setShowWarning(false);
    startGenerator();
  };

  return (
    <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="zap" size={18} color="var(--accent-amber)" />
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>Continuous Stream Generator</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Running state indicator */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.2rem 0.6rem', borderRadius: '9999px',
              background: isRunning ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-elevated)',
              border: `1px solid ${isRunning ? 'rgba(52, 211, 153, 0.4)' : 'var(--border-subtle)'}`,
              fontSize: '0.725rem',
            }}
          >
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isRunning ? 'var(--accent-emerald)' : 'var(--text-muted)',
                boxShadow: isRunning ? '0 0 8px var(--accent-emerald)' : 'none',
              }}
            />
            <span style={{ color: isRunning ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
              {isRunning ? `STREAMING (${ratePerSec}/s)` : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Emits automated synthetic events (USER_LOGIN, DOWNLOAD_COMPLETED, FILE_UPLOAD_START) at a calibrated rate.
        {isRunning && (
          <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
            {' '}⚠ LIVE STREAM active — each tick sends a real POST /api/v1/events request.
          </span>
        )}
      </p>

      {/* Confirmation warning dialog */}
      {showWarning && (
        <div
          style={{
            padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '0.85rem',
            background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.4)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--accent-rose)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            ⚠ Confirm Live Stream Generation
          </div>
          <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            This will send up to <strong>{ratePerSec} real HTTP POST requests/second</strong> to{' '}
            <code style={{ fontSize: '0.72rem' }}>POST /api/v1/events</code>. Each event is stored in PostgreSQL.
            Ensure you have a <strong>Publisher API Key configured</strong> in Settings and that the backend is running.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowWarning(false)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-cyan"
              onClick={confirmStart}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            >
              Yes, start live stream
            </button>
          </div>
        </div>
      )}

      {/* Rate Slider */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Throughput Rate (1–10 events / sec)
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {ratePerSec} events/sec
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={ratePerSec}
          onChange={(e) => setRatePerSec(parseInt(e.target.value, 10))}
          className="rate-slider"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          <span>1 /s (Low)</span>
          <span>5 /s (Medium)</span>
          <span>10 /s (Max Stress)</span>
        </div>
      </div>

      {/* Start / Stop */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isRunning ? (
            <button className="btn btn-cyan" onClick={handleStartClick} style={{ padding: '0.5rem 1.15rem' }}>
              <Icon name="play" size={15} />
              <span>Start Stream Generator</span>
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={stopGenerator}
              style={{ padding: '0.5rem 1.15rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            >
              <Icon name="stop" size={15} color="var(--accent-rose)" />
              <span>Stop Stream Generator</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={handleResetStats} title="Reset simulation counters">
            <Icon name="refresh" size={14} />
            <span>Reset Counters</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Generated</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats.total.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Accepted (202)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
            {stats.accepted.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', textTransform: 'uppercase' }}>Rejected (400)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)' }}>
            {stats.rejected.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
