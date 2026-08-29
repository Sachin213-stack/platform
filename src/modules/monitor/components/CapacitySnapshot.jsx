import React from 'react';
import { Card } from '../../../shared/components/Card';

export function CapacitySnapshot({
  cpuUsage = 48,
  memUsage = 64,
  queueDepth = 82, // elevated to show threshold color
  onNavigateToAnalytics,
}) {
  const getThresholdStatus = (val) => {
    if (val > 90) return 'critical';
    if (val >= 70) return 'warning';
    return 'healthy';
  };

  const cpuStatus = getThresholdStatus(cpuUsage);
  const memStatus = getThresholdStatus(memUsage);
  const queueStatus = getThresholdStatus(queueDepth);

  const getBarColor = (status) => {
    switch (status) {
      case 'critical':
        return 'var(--color-status-error)';
      case 'warning':
        return 'var(--color-status-warning)';
      case 'healthy':
      default:
        return 'var(--color-status-success)';
    }
  };

  return (
    <Card
      className="capacity-card capacity-card--clickable"
      padding="compact"
      onClick={() => onNavigateToAnalytics && onNavigateToAnalytics()}
      role="button"
      tabIndex={0}
      title="Click to view deep Analytics & Capacity Forecasting Studio"
    >
      <div className="capacity-card__header">
        <div className="capacity-card__title-row">
          <span className="capacity-card__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </span>
          <div>
            <h4 className="capacity-card__title">Cluster Capacity Snapshot</h4>
            <p className="capacity-card__subtitle">Resource utilization & queue headroom</p>
          </div>
        </div>

        <div className="capacity-card__action-hint">
          <span>Forecasting Studio</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>

      <div className="capacity-card__body">
        {/* CPU Progress */}
        <div className="capacity-meter">
          <div className="capacity-meter__meta">
            <div className="capacity-meter__label-group">
              <span className="capacity-meter__name">CPU Core Allocation</span>
              <span className="capacity-meter__sub">16 / 32 vCPUs active</span>
            </div>
            <div className="capacity-meter__val-group">
              <span className="capacity-meter__percentage">{cpuUsage}%</span>
              <span className={`capacity-meter__badge capacity-meter__badge--${cpuStatus}`}>
                {cpuStatus === 'healthy' ? 'Optimal' : cpuStatus === 'warning' ? 'Elevated' : 'Critical'}
              </span>
            </div>
          </div>
          <div className="capacity-meter__track">
            <div
              className="capacity-meter__fill"
              style={{
                width: `${cpuUsage}%`,
                backgroundColor: getBarColor(cpuStatus),
              }}
            />
          </div>
        </div>

        {/* Memory Progress */}
        <div className="capacity-meter">
          <div className="capacity-meter__meta">
            <div className="capacity-meter__label-group">
              <span className="capacity-meter__name">Cluster RAM (64 GB)</span>
              <span className="capacity-meter__sub">41.0 GB reserved · 23 GB buffer</span>
            </div>
            <div className="capacity-meter__val-group">
              <span className="capacity-meter__percentage">{memUsage}%</span>
              <span className={`capacity-meter__badge capacity-meter__badge--${memStatus}`}>
                {memStatus === 'healthy' ? 'Optimal' : memStatus === 'warning' ? 'Elevated' : 'Critical'}
              </span>
            </div>
          </div>
          <div className="capacity-meter__track">
            <div
              className="capacity-meter__fill"
              style={{
                width: `${memUsage}%`,
                backgroundColor: getBarColor(memStatus),
              }}
            />
          </div>
        </div>

        {/* SQS / RabbitMQ Queue Depth */}
        <div className="capacity-meter">
          <div className="capacity-meter__meta">
            <div className="capacity-meter__label-group">
              <span className="capacity-meter__name">Async Job Queue Depth</span>
              <span className="capacity-meter__sub">1,840 pending messages in backlog</span>
            </div>
            <div className="capacity-meter__val-group">
              <span className="capacity-meter__percentage">{queueDepth}%</span>
              <span className={`capacity-meter__badge capacity-meter__badge--${queueStatus}`}>
                {queueStatus === 'healthy' ? 'Optimal' : queueStatus === 'warning' ? 'Warning (>70%)' : 'Critical'}
              </span>
            </div>
          </div>
          <div className="capacity-meter__track">
            <div
              className="capacity-meter__fill"
              style={{
                width: `${queueDepth}%`,
                backgroundColor: getBarColor(queueStatus),
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
