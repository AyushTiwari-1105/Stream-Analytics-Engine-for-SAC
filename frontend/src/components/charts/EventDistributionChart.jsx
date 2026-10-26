import React, { useState } from 'react';
import { Icon } from '../common/Icons.jsx';

export default function EventDistributionChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No event distribution data</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : data[0];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header" style={{ marginBottom: '0.75rem' }}>
        <div>
          <div className="chart-title">
            <Icon name="layers" size={16} color="var(--accent-violet)" />
            <span>Event Breakdown</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Distribution by stream schema
          </div>
        </div>
      </div>

      {/* Actual event count & percentage cards inside the chart area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          gap: '0.5rem',
          padding: '0.55rem 0.75rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          marginBottom: '0.5rem',
        }}
      >
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.type}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                cursor: 'pointer',
                opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '2px',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {item.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {item.count.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: item.color }}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '0.5rem 0' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {data.map((item, index) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={item.type}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label inside donut displaying count and percentage */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '120px',
            lineHeight: 1.25,
          }}
        >
          {hoveredIndex !== null ? (
            <>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: activeItem.color, fontFamily: 'var(--font-mono)' }}>
                {activeItem.count.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: activeItem.color, marginTop: '1px' }}>
                {activeItem.percentage}%
              </div>
              <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: '2px' }}>
                {activeItem.type.replace('_', ' ')}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Total Events
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '2px 0' }}>
                {total.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {data.map(d => `${d.count}`).join(' / ')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: 'auto' }}>
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.type}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                background: isHovered ? 'var(--bg-elevated)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '2px',
                    backgroundColor: item.color,
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {item.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.count.toLocaleString()} events</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
