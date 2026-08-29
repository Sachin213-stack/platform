import React, { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';

export default function AnalyticsPage({ onNavigate }) {
  const [sensitivity, setSensitivity] = useState(85);

  return (
    <div className="analytics-page-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'dashboardFadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Analytics & Capacity Forecasting Studio
            </h2>
            <Badge variant="violet" size="sm">Predictive ML Model v3.2</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Machine learning anomaly detection, crash risk probability, and resource runway models.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate && onNavigate('dashboard')}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          }
        >
          ← Return to Dashboard
        </Button>
      </div>

      {/* Top Studio Grid: Crash Risk Gauge & Sensitivity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <Card padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              Projected 24h Crash Risk
            </h4>
            <Badge variant="success" size="sm">Low Risk (4.2%)</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', margin: 'var(--space-2) 0' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-status-success)' }}>
              4.2%
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              99.8% headroom probability
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: '4.2%', height: '100%', background: 'var(--color-status-success)', borderRadius: '999px' }} />
          </div>
        </Card>

        <Card padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              ML Anomaly Sensitivity
            </h4>
            <Badge variant="violet" size="sm">{sensitivity}% Active</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Adjust detection threshold tolerance for microsecond latency deviations.
          </p>
          <input
            type="range"
            min="50"
            max="99"
            value={sensitivity}
            onChange={(e) => setSensitivity(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </Card>
      </div>

      {/* Forecast Curve Chart — Strictly adhering to transparent chart rule */}
      <Card padding="normal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              24-Hour Predictive Capacity Curve & Confidence Envelope
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Historical throughput with ML upper/lower confidence bounds.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="violet" size="sm">Actual Telemetry</Badge>
            <Badge variant="warning" size="sm">ML Predicted Peak</Badge>
          </div>
        </div>

        {/* Transparent Chart Container */}
        <div style={{ width: '100%', height: '240px', background: 'transparent' }}>
          <svg viewBox="0 0 700 220" style={{ width: '100%', height: '100%', background: 'transparent' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Subtle transparent gridlines */}
            {[40, 90, 140, 190].map((y) => (
              <line key={y} x1="40" y1={y} x2="680" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            ))}

            {/* Confidence Area Band */}
            <path
              d="M 40,140 C 140,180 240,80 350,50 C 450,60 550,20 680,80 L 680,180 C 550,140 450,160 350,170 C 240,180 140,200 40,190 Z"
              fill="url(#forecastBand)"
            />

            {/* Actual Line */}
            <path
              d="M 40,140 C 140,180 240,80 350,50 C 400,55 450,60 480,65"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
            />

            {/* Predicted Line (Dashed) */}
            <path
              d="M 480,65 C 550,20 620,40 680,80"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
          </svg>
        </div>
      </Card>
    </div>
  );
}
