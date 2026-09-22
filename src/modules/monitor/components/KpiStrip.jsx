import React from 'react';
import { Card } from '../../../shared/components/Card';

/**
 * Business-Type KPI Configuration Matrix
 * TODO: When backend provides tenant-level custom KPI definitions,
 * plug the API feed into `getKpiConfigForBusiness()`.
 */
export function getKpisForBusiness(businessType = 'ecommerce', comparisonBasis = 'yesterday') {
  const commonSparkline = [0, 0, 0, 0, 0];

  switch (businessType) {
    case 'saas':
      return [
        {
          id: 'response-time',
          label: 'Avg Response Time',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 200, crit: 350 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'api-throughput',
          label: 'API Invocations/Min',
          value: '0',
          rawValue: 0,
          threshold: { warn: 80000, crit: 120000 },
          unit: 'req/m',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'js-error-rate',
          label: 'Client JS Error Rate',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.5, crit: 1.5 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'http-error-rate',
          label: '5xx Server Error Rate',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
      ];

    case 'content':
      return [
        {
          id: 'response-time',
          label: 'TTFB / Edge Latency',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 150, crit: 300 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'requests-min',
          label: 'CDN Requests/Min',
          value: '0',
          rawValue: 0,
          threshold: { warn: 300000, crit: 500000 },
          unit: 'req/m',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'js-error-rate',
          label: 'Video Player Errors',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'http-error-rate',
          label: 'Origin 5xx Errors',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.5, crit: 1.5 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
      ];

    case 'fintech':
      return [
        {
          id: 'response-time',
          label: 'Core Banking Latency',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 100, crit: 250 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'tx-throughput',
          label: 'Settlement Throughput',
          value: '0',
          rawValue: 0,
          threshold: { warn: 35000, crit: 60000 },
          unit: 'tx/m',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'auth-failure-rate',
          label: 'Auth & 2FA Failures',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.2, crit: 0.8 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'gateway-error-rate',
          label: 'Gateway 5xx Errors',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.1, crit: 0.5 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
      ];

    case 'marketplace':
      return [
        {
          id: 'response-time',
          label: 'Avg Response Time',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 200, crit: 350 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'gmv-velocity',
          label: 'GMV Orders / Min',
          value: '0',
          rawValue: 0,
          threshold: { warn: 150, crit: 300 },
          unit: 'orders/m',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'search-latency',
          label: 'Search Index Latency',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 60, crit: 120 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'checkout-failure',
          label: 'Checkout Failure Rate',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 1.0, crit: 2.5 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
      ];

    case 'ecommerce':
    default:
      return [
        {
          id: 'response-time',
          label: 'Avg Response Time',
          value: '0ms',
          rawValue: 0,
          threshold: { warn: 200, crit: 350 },
          unit: 'ms',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'requests-min',
          label: 'Requests/Min',
          value: '0',
          rawValue: 0,
          threshold: { warn: 25000, crit: 40000 },
          unit: 'rpm',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'js-error-rate',
          label: 'JS Error Rate',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
        {
          id: 'http-error-rate',
          label: 'HTTP Error Rate',
          value: '0.00%',
          rawValue: 0,
          threshold: { warn: 1.0, crit: 2.5 },
          unit: '%',
          delta: '0.0%',
          deltaType: 'neutral',
          sparkline: commonSparkline,
          target: 'Awaiting telemetry',
        },
      ];
  }
}

// Mini SVG Sparkline helper
function Sparkline({ points = [], status = 'green' }) {
  const min = points.length > 0 ? Math.min(...points) : 0;
  const max = points.length > 0 ? Math.max(...points) || 1 : 1;
  const height = 28;
  const width = 84;
  const padding = 3;

  const strokeColor =
    status === 'red'
      ? 'var(--color-status-error)'
      : status === 'amber'
      ? 'var(--color-status-warning)'
      : 'var(--color-accent)';

  const fillColor =
    status === 'red'
      ? 'rgba(239, 68, 68, 0.15)'
      : status === 'amber'
      ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(139, 92, 246, 0.15)';

  const normalized = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p - min) / (max - min || 1)) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathStr = `M ${normalized.join(' L ')}`;
  const areaStr = `${pathStr} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <svg className="kpi-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={areaStr} fill={fillColor} />
      <path d={pathStr} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KpiStrip({
  businessType = 'ecommerce',
  comparisonPeriod = 'yesterday', // 'yesterday' | 'week'
  onComparisonChange,
  kpiOverrides = null,
}) {
  const kpis = kpiOverrides || getKpisForBusiness(businessType, comparisonPeriod);

  return (
    <div className="kpi-strip-section">
      {/* ── Section Header with Explicit Comparison Toggle ── */}
      <div className="kpi-strip-header">
        <div className="kpi-strip-header__title-row">
          <h2 className="kpi-strip-header__title">Core Telemetry KPIs</h2>
          <span className="kpi-strip-header__hint">
            Direct edge node telemetry updated every 5s
          </span>
        </div>

        {/* Comparison Basis Selector */}
        <div className="kpi-comparison-toggle" role="group" aria-label="Comparison period">
          <span className="kpi-comparison-toggle__label">Comparison:</span>
          <button
            type="button"
            className={`kpi-comparison-toggle__btn ${comparisonPeriod === 'yesterday' ? 'kpi-comparison-toggle__btn--active' : ''}`}
            onClick={() => onComparisonChange && onComparisonChange('yesterday')}
          >
            vs Yesterday
          </button>
          <button
            type="button"
            className={`kpi-comparison-toggle__btn ${comparisonPeriod === 'week' ? 'kpi-comparison-toggle__btn--active' : ''}`}
            onClick={() => onComparisonChange && onComparisonChange('week')}
          >
            vs Last Week
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid">
        {kpis.map((kpi) => {
          // Compute status threshold: green, amber, red
          let status = 'green';
          if (kpi.rawValue >= kpi.threshold.crit) {
            status = 'red';
          } else if (kpi.rawValue >= kpi.threshold.warn) {
            status = 'amber';
          }

          const isNegativeTrend = kpi.deltaType === 'negative';
          const isPositiveTrend = kpi.deltaType === 'positive';

          return (
            <Card
              key={kpi.id}
              className={`kpi-card kpi-card--status-${status}`}
              padding="compact"
            >
              <div className="kpi-card__top">
                <span className="kpi-card__label">{kpi.label}</span>
                <span className={`kpi-status-badge kpi-status-badge--${status}`}>
                  {status === 'green' ? 'Healthy' : status === 'amber' ? 'Elevated' : 'Critical'}
                </span>
              </div>

              <div className="kpi-card__body">
                <div className="kpi-card__value-group">
                  <div className="kpi-card__main-val">{kpi.value}</div>
                  <div className="kpi-card__delta-row">
                    <span
                      className={`kpi-delta-pill ${isPositiveTrend ? 'kpi-delta-pill--positive' : isNegativeTrend ? 'kpi-delta-pill--negative' : 'kpi-delta-pill--neutral'}`}
                    >
                      {isPositiveTrend ? '↓ ' : isNegativeTrend ? '↑ ' : ''}
                      {kpi.delta}
                    </span>
                    <span className="kpi-card__period-basis">
                      {comparisonPeriod === 'yesterday' ? 'vs yesterday' : 'vs last week'}
                    </span>
                  </div>
                </div>

                <div className="kpi-card__spark-col">
                  <Sparkline points={kpi.sparkline} status={status} />
                  <span className="kpi-card__target-note">{kpi.target}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
