import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton-wrapper" aria-busy="true" aria-label="Loading dashboard telemetry">
      {/* Top Banner Skeleton */}
      <div className="skeleton-box skeleton-health-banner" />

      {/* KPI Grid Skeleton */}
      <div className="skeleton-kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-box skeleton-kpi-card" />
        ))}
      </div>

      {/* Business Metrics Skeleton */}
      <div className="skeleton-biz-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-box skeleton-biz-card" />
        ))}
      </div>

      {/* Chart & Side Grid Skeleton */}
      <div className="skeleton-main-grid">
        <div className="skeleton-box skeleton-chart-card" />
        <div className="skeleton-box skeleton-side-card" />
      </div>
    </div>
  );
}

export function DashboardErrorState({
  errorMessage = 'Unable to establish secure telemetry connection with cluster edge nodes.',
  onRetry,
}) {
  return (
    <div className="dashboard-error-state">
      <Card className="dashboard-error-card" padding="large">
        <div className="dashboard-error-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="dashboard-error-title">Telemetry Stream Unreachable</h3>
        <p className="dashboard-error-desc">{errorMessage}</p>

        <div className="dashboard-error-actions">
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            }
          >
            Retry Connection
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function MetricEmptyState({
  title = 'No Telemetry Recorded',
  description = 'No traffic or anomaly events detected in the selected period. Check back soon or verify tracking snippet installation.',
}) {
  return (
    <div className="metric-empty-box">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      <span className="metric-empty-title">{title}</span>
      <span className="metric-empty-desc">{description}</span>
    </div>
  );
}
