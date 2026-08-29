import React from 'react';
import { Card } from '../../../shared/components/Card';

/**
 * Business-Type KPI Configuration Matrix
 * TODO: When backend provides tenant-level custom KPI definitions,
 * plug the API feed into `getKpiConfigForBusiness()`.
 */
export function getKpisForBusiness(businessType = 'ecommerce', comparisonBasis = 'yesterday') {
  // Baseline multipliers for comparison periods
  const isWeek = comparisonBasis === 'week';

  switch (businessType) {
    case 'saas':
      return [
        {
          id: 'response-time',
          label: 'Avg Response Time',
          value: '118ms',
          rawValue: 118,
          threshold: { warn: 200, crit: 350 },
          unit: 'ms',
          delta: isWeek ? '-8.4%' : '-4.2%',
          deltaType: 'positive', // lower latency is good
          sparkline: [140, 132, 128, 120, 115, 118],
          target: '< 200ms target',
        },
        {
          id: 'api-throughput',
          label: 'API Invocations/Min',
          value: '42.8k',
          rawValue: 42800,
          threshold: { warn: 80000, crit: 120000 },
          unit: 'req/m',
          delta: isWeek ? '+18.2%' : '+6.8%',
          deltaType: 'positive',
          sparkline: [36, 38, 40, 39, 41, 42.8],
          target: 'Scale capacity: 150k',
        },
        {
          id: 'js-error-rate',
          label: 'Client JS Error Rate',
          value: '0.04%',
          rawValue: 0.04,
          threshold: { warn: 0.5, crit: 1.5 },
          unit: '%',
          delta: isWeek ? '-0.02%' : '+0.01%',
          deltaType: 'neutral',
          sparkline: [0.06, 0.05, 0.04, 0.04, 0.03, 0.04],
          target: '< 0.1% SLA',
        },
        {
          id: 'http-error-rate',
          label: '5xx Server Error Rate',
          value: '0.12%',
          rawValue: 0.12,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: isWeek ? '-0.14%' : '-0.05%',
          deltaType: 'positive',
          sparkline: [0.28, 0.22, 0.18, 0.15, 0.13, 0.12],
          target: '< 0.5% SLA',
        },
      ];

    case 'content':
      return [
        {
          id: 'response-time',
          label: 'TTFB / Edge Latency',
          value: '64ms',
          rawValue: 64,
          threshold: { warn: 150, crit: 300 },
          unit: 'ms',
          delta: isWeek ? '-12.0%' : '-3.1%',
          deltaType: 'positive',
          sparkline: [82, 78, 70, 68, 65, 64],
          target: 'Edge Cache: 94%',
        },
        {
          id: 'requests-min',
          label: 'CDN Requests/Min',
          value: '185.4k',
          rawValue: 185400,
          threshold: { warn: 300000, crit: 500000 },
          unit: 'req/m',
          delta: isWeek ? '+24.5%' : '+11.2%',
          deltaType: 'positive',
          sparkline: [140, 155, 160, 172, 180, 185.4],
          target: 'Global edge distribution',
        },
        {
          id: 'js-error-rate',
          label: 'Video Player Errors',
          value: '0.18%',
          rawValue: 0.18,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: isWeek ? '-0.05%' : '-0.02%',
          deltaType: 'positive',
          sparkline: [0.24, 0.22, 0.20, 0.19, 0.18, 0.18],
          target: '< 0.5% stream fail',
        },
        {
          id: 'http-error-rate',
          label: 'Origin 5xx Errors',
          value: '0.08%',
          rawValue: 0.08,
          threshold: { warn: 0.5, crit: 1.5 },
          unit: '%',
          delta: isWeek ? '-0.04%' : '+0.01%',
          deltaType: 'neutral',
          sparkline: [0.12, 0.10, 0.09, 0.08, 0.07, 0.08],
          target: '< 0.2% Origin Error',
        },
      ];

    case 'ecommerce':
    default:
      return [
        {
          id: 'response-time',
          label: 'Avg Response Time',
          value: '142ms',
          rawValue: 142,
          threshold: { warn: 200, crit: 350 },
          unit: 'ms',
          delta: isWeek ? '-14.8%' : '-6.2%',
          deltaType: 'positive',
          sparkline: [178, 165, 155, 148, 145, 142],
          target: 'SLA < 200ms',
        },
        {
          id: 'requests-min',
          label: 'Requests/Min',
          value: '12,480',
          rawValue: 12480,
          threshold: { warn: 25000, crit: 40000 },
          unit: 'rpm',
          delta: isWeek ? '+19.4%' : '+8.1%',
          deltaType: 'positive',
          sparkline: [9.8, 10.4, 11.2, 11.8, 12.1, 12.48],
          target: 'Peak cap: 50k rpm',
        },
        {
          id: 'js-error-rate',
          label: 'JS Error Rate',
          value: '0.34%',
          rawValue: 0.34,
          threshold: { warn: 0.8, crit: 2.0 },
          unit: '%',
          delta: isWeek ? '-0.12%' : '-0.04%',
          deltaType: 'positive',
          sparkline: [0.48, 0.44, 0.40, 0.38, 0.35, 0.34],
          target: '< 0.5% threshold',
        },
        {
          id: 'http-error-rate',
          label: 'HTTP Error Rate',
          value: '0.86%',
          rawValue: 0.86,
          threshold: { warn: 1.0, crit: 2.5 },
          unit: '%',
          delta: isWeek ? '+0.21%' : '+0.14%',
          deltaType: 'negative',
          sparkline: [0.65, 0.68, 0.72, 0.79, 0.82, 0.86],
          target: '< 1.0% healthy',
        },
      ];
  }
}

// Mini SVG Sparkline helper
function Sparkline({ points, status = 'green' }) {
  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
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
