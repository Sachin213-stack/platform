import React from 'react';
import { Button } from '../../../../shared/components/Button';

export function LogTopBar({
  isLive,
  onToggleLive,
  activeCount,
  totalCount,
  isReconnecting,
  anomalyContext,
  onClearAnomalyContext,
  onClearFilters,
  hasActiveFilters,
  onOpenShippingModal,
  businessName = 'Current Business',
}) {
  return (
    <div className="log-topbar">
      <div className="log-topbar__left">
        {/* Live / Paused Stream Status Toggle */}
        <button
          type="button"
          className={`log-live-toggle ${isLive ? 'log-live-toggle--live' : 'log-live-toggle--paused'}`}
          onClick={onToggleLive}
          title={isLive ? 'Click to pause log tailing' : 'Click to resume live log tailing'}
        >
          <span className={`log-live-dot ${isLive ? 'log-live-dot--pulsing' : ''}`} />
          <span className="log-live-toggle__label">
            {isLive ? 'LIVE STREAMING' : 'STREAM PAUSED'}
          </span>
          <span className="log-live-toggle__shortcut">
            {isLive ? '(Auto-scroll on)' : '(Click to resume)'}
          </span>
        </button>

        {/* Tenant / Business Indicator */}
        <div className="log-tenant-badge" title="Tenant RLS context automatically applied">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6v4H9z" />
          </svg>
          <span>{businessName}</span>
        </div>

        {/* Reconnecting banner if SSE dropped */}
        {isReconnecting && (
          <div className="log-reconnecting-pill">
            <span className="log-spinner-tiny" />
            <span>Reconnecting to live tail...</span>
          </div>
        )}

        {/* Count Pill */}
        <div className="log-count-indicator">
          Showing <strong>{activeCount}</strong> of <strong>{totalCount}</strong> logs
        </div>
      </div>

      <div className="log-topbar__right">
        {/* Reset / Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="log-clear-btn"
          >
            Reset Filters
          </Button>
        )}

        {/* Connect Log Shipper */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenShippingModal}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h8M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 22v-4a4 4 0 0 1 8 0v4" />
            </svg>
          }
        >
          Shipper Setup
        </Button>
      </div>

      {/* Anomaly Deep-Link Active Context Banner */}
      {anomalyContext && (
        <div className="log-anomaly-context-banner">
          <div className="log-anomaly-context-banner__left">
            <span className="log-anomaly-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <span className="log-anomaly-context-banner__title">
                Investigating Anomaly: <strong>{anomalyContext.title || anomalyContext.metric_name || 'Incident Window'}</strong>
              </span>
              <span className="log-anomaly-context-banner__sub">
                Pre-filtered to correlated log window (±5 minutes around anomaly detection)
              </span>
            </div>
          </div>
          <button
            type="button"
            className="log-anomaly-context-banner__clear"
            onClick={onClearAnomalyContext}
            title="Clear anomaly scope and return to full logs"
          >
            ✕ Exit Anomaly Focus
          </button>
        </div>
      )}
    </div>
  );
}
