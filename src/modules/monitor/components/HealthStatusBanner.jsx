import React from 'react';
import { Badge } from '../../../shared/components/Badge';

export function HealthStatusBanner({
  healthScore = 96,
  status = 'healthy', // 'healthy' | 'degraded' | 'critical'
  anomalyCount = 0,
  activeServices = '14/14',
  uptime = '99.98%',
  avgLatency = '42ms',
  onInspectAnomalies,
}) {
  // Derive status style tokens
  const statusConfig = {
    healthy: {
      badgeVariant: 'success',
      label: 'Optimal Health',
      colorVar: 'var(--color-status-success)',
      summary: anomalyCount === 0 
        ? 'All critical systems operating within nominal operational thresholds.'
        : `${anomalyCount} minor telemetry alerts flagged — automatically mitigated by FRIDAY AI.`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    degraded: {
      badgeVariant: 'warning',
      label: 'Degraded Performance',
      colorVar: 'var(--color-status-warning)',
      summary: `${anomalyCount} active metrics above threshold — checkout latency p99 elevated.`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    critical: {
      badgeVariant: 'error',
      label: 'Critical Anomaly',
      colorVar: 'var(--color-status-error)',
      summary: `${anomalyCount} critical anomalies impacting user checkout flow — manual review required.`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  };

  const current = statusConfig[status] || statusConfig.healthy;

  return (
    <div className={`health-banner health-banner--${status}`}>
      <div className="health-banner__left">
        {/* Score Circular / Radial Ring Badge */}
        <div className="health-banner__score-ring">
          <svg className="health-banner__svg-ring" viewBox="0 0 48 48">
            <circle
              className="health-banner__ring-bg"
              cx="24"
              cy="24"
              r="20"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              className="health-banner__ring-fill"
              cx="24"
              cy="24"
              r="20"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${(healthScore / 100) * 125.6} 125.6`}
              strokeDashoffset="0"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <div className="health-banner__score-number">
            <span className="health-banner__score-val">{healthScore}</span>
            <span className="health-banner__score-max">/100</span>
          </div>
        </div>

        {/* State description */}
        <div className="health-banner__info">
          <div className="health-banner__header-row">
            <Badge variant={current.badgeVariant} size="sm" dot>
              {current.label}
            </Badge>
            <span className="health-banner__updated-tag">Auto-Assessed via Real-time SLA Engine</span>
          </div>
          <p className="health-banner__summary">{current.summary}</p>
        </div>
      </div>

      {/* ── Right: Mini Vitals Breakdown + Anomaly shortcut ── */}
      <div className="health-banner__right">
        <div className="health-banner__vitals">
          <div className="health-banner__vital-item">
            <span className="health-banner__vital-label">Services</span>
            <span className="health-banner__vital-val">{activeServices}</span>
          </div>
          <div className="health-banner__vital-divider" />
          <div className="health-banner__vital-item">
            <span className="health-banner__vital-label">24h Uptime</span>
            <span className="health-banner__vital-val">{uptime}</span>
          </div>
          <div className="health-banner__vital-divider" />
          <div className="health-banner__vital-item">
            <span className="health-banner__vital-label">API Latency</span>
            <span className="health-banner__vital-val">{avgLatency}</span>
          </div>
        </div>

        {anomalyCount > 0 && onInspectAnomalies && (
          <button className="health-banner__action-btn" onClick={onInspectAnomalies}>
            <span>Inspect Anomalies</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
