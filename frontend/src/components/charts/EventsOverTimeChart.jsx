import React, { useState } from 'react';
import { Icon } from '../common/Icons.jsx';

export default function EventsOverTimeChart({ data = [], timeRange = '15m', onTimeRangeChange }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="card"
        style={{
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <Icon
          name="activity"
          size={32}
          color="var(--text-muted)"
          style={{ marginBottom: '0.75rem', opacity: 0.5 }}
        />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          No Events Over Time Data
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '360px', margin: '0 auto' }}>
          No aggregated event records found in PostgreSQL. Ingest events using the Event Simulator to populate telemetry.
        </p>
      </div>
    );
  }

  const width = 680;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.eventCount);
  const rawMax = Math.max(...values, 0);
  const rawMin = 0;

  // Ensure chartMax is nicely padded above rawMax
  const chartMin = rawMin;
  const chartMax = rawMax === 0 ? 10 : Math.max(Math.ceil(rawMax * 1.25), rawMax + 2);

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (index / (data.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((d.eventCount - chartMin) / (chartMax - chartMin)) * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG path
  let pathD = '';
  let areaD = '';

  if (points.length === 1) {
    pathD = `M ${padding.left} ${points[0].y} L ${padding.left + chartWidth} ${points[0].y}`;
    areaD = `${pathD} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  } else {
    pathD = points.reduce((acc, point, i) => {
      return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');
    areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }

  // Generate 4-5 evenly spaced Y-axis ticks
  const tickCount = 4;
  const yTicks = [];
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round(chartMin + (i / tickCount) * (chartMax - chartMin)));
  }
  const uniqueYTicks = [...new Set(yTicks)];

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const latestPoint = points[points.length - 1];

  // Pick at most 5-6 evenly spaced X-axis labels to avoid overlap
  const labelInterval = Math.max(1, Math.ceil(points.length / 5));
  const xLabels = points.filter(
    (_, i) => i % labelInterval === 0 || i === points.length - 1
  );

  return (
    <div className="card">
      <div className="chart-header">
        <div>
          <div className="chart-title">
            <Icon name="activity" size={16} color="var(--accent-cyan)" />
            <span>Events Over Time</span>
            {latestPoint && (
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem', marginLeft: '0.35rem' }}>
                Latest: {latestPoint.eventCount.toLocaleString()}
              </span>
            )}
            {rawMax > 0 && (
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>
                Peak: {rawMax.toLocaleString()}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Event counts grouped by timestamp from PostgreSQL
          </div>
        </div>

        <div className="time-filter-group">
          {['15m', '1h', '24h', 'All'].map((t) => (
            <button
              key={t}
              className={`time-btn ${timeRange === t ? 'active' : ''}`}
              onClick={() => onTimeRangeChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="eventAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <filter id="eventGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {uniqueYTicks.map((tick) => {
            const y =
              padding.top +
              chartHeight -
              ((tick - chartMin) / (chartMax - chartMin)) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#eventAreaGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots (if fewer than 30 points) */}
          {points.length <= 30 &&
            points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#38bdf8"
                stroke="#070a12"
                strokeWidth="1.5"
              />
            ))}

          {/* Interactive invisible hover columns */}
          {points.map((p, i) => {
            const step =
              points.length === 1 ? chartWidth : chartWidth / (points.length - 1);
            return (
              <rect
                key={i}
                x={p.x - step / 2}
                y={padding.top}
                width={step}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Hover indicator vertical line & dot */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + chartHeight}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#38bdf8"
                stroke="#070a12"
                strokeWidth="2"
                filter="url(#eventGlow)"
              />
            </g>
          )}

          {/* X-axis labels */}
          {xLabels.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              fill="var(--text-muted)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {p.time}
            </text>
          ))}
        </svg>

        {/* Hover info badge */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              background: 'rgba(19, 26, 44, 0.95)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
              backdropFilter: 'blur(8px)',
              zIndex: 10,
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Time: </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                {hoveredPoint.fullTime || hoveredPoint.time}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Count: </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                }}
              >
                {hoveredPoint.eventCount.toLocaleString()} events
              </span>
            </div>
            {hoveredPoint.breakdown && Object.keys(hoveredPoint.breakdown).length > 0 && (
              <div>
                {Object.entries(hoveredPoint.breakdown).map(([type, cnt]) => (
                  <span
                    key={type}
                    className="badge badge-cyan"
                    style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }}
                  >
                    {type}: {cnt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
