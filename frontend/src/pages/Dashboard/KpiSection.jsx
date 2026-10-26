import React from 'react';
import { Icon } from '../../components/common/Icons.jsx';

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const width = 80;
  const height = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function KpiSection({ stats }) {
  const cards = [
    {
      id: 'events-processed',
      title: 'Events Processed',
      value: stats.eventsProcessed.value,
      delta: stats.eventsProcessed.delta,
      comparison: stats.eventsProcessed.comparison,
      isPositive: stats.eventsProcessed.isPositive,
      icon: 'activity',
      accentColor: 'var(--accent-cyan)',
      sparkline: stats.eventsProcessed.sparkline
    },
    {
      id: 'events-sec',
      title: 'Events / Second',
      value: stats.eventsPerSecond.value,
      delta: stats.eventsPerSecond.delta,
      comparison: stats.eventsPerSecond.comparison,
      isPositive: stats.eventsPerSecond.isPositive,
      icon: 'zap',
      accentColor: '#38bdf8',
      sparkline: stats.eventsPerSecond.sparkline
    },
    {
      id: 'total-logins',
      title: 'Total Logins',
      value: stats.totalLogins.value,
      delta: stats.totalLogins.delta,
      comparison: stats.totalLogins.comparison,
      isPositive: stats.totalLogins.isPositive,
      icon: 'shield',
      accentColor: 'var(--accent-violet)',
      sparkline: stats.totalLogins.sparkline
    },
    {
      id: 'bytes-transferred',
      title: 'Bytes Transferred',
      value: stats.bytesTransferred.value,
      delta: stats.bytesTransferred.delta,
      comparison: stats.bytesTransferred.comparison,
      isPositive: stats.bytesTransferred.isPositive,
      icon: 'database',
      accentColor: 'var(--accent-emerald)',
      sparkline: stats.bytesTransferred.sparkline
    }
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div key={card.id} className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">{card.title}</span>
            <div className="kpi-icon-wrap" style={{ color: card.accentColor }}>
              <Icon name={card.icon} size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div className="kpi-value">{card.value}</div>
            <Sparkline data={card.sparkline} color={card.accentColor} />
          </div>

          <div className="kpi-footer">
            <span className={`kpi-delta ${card.isPositive ? 'positive' : 'negative'}`}>
              <Icon name={card.isPositive ? 'arrowUpRight' : 'arrowDownRight'} size={14} />
              {card.delta}
            </span>
            <span>{card.comparison}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
