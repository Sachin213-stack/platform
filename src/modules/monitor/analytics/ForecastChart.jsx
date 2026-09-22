import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { generateForecastData } from './analyticsData';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 270;
const PADDING = { top: 25, right: 30, bottom: 35, left: 55 };
const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

export function ForecastChart({
  whatIfSpike = 0,
  onAskFriday,
}) {
  const [timeRange, setTimeRange] = useState('24h'); // '24h' | '7d' | '30d' | 'custom'
  const [granularity, setGranularity] = useState('hourly'); // '15m' | 'hourly' | 'daily'
  const [compareMode, setCompareMode] = useState('none'); // 'none' | 'last_week' | 'previous_deploy'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverX, setHoverX] = useState(null);

  const containerRef = useRef(null);

  // Generate data points based on settings + what-if spike
  const data = useMemo(() => {
    return generateForecastData({
      timeRange,
      granularity,
      compareMode,
      whatIfSpike,
    });
  }, [timeRange, granularity, compareMode, whatIfSpike]);

  // Compute maximum scale boundary
  const maxCapacity = useMemo(() => {
    if (!data || data.length === 0) return 8000;
    const allVals = data.flatMap((d) => [
      d.actual || 0,
      d.predicted || 0,
      d.upperConfidence || 0,
      d.comparisonValue || 0,
    ]);
    return Math.max(...allVals, 8000) * 1.15;
  }, [data]);

  // Map to SVG coordinates
  const pointsActual = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .filter((d) => d.actual !== null)
      .map((d, i) => {
        const x = PADDING.left + (data.length > 1 ? (i / (data.length - 1)) * PLOT_WIDTH : PLOT_WIDTH / 2);
        const y = PADDING.top + PLOT_HEIGHT - (d.actual / maxCapacity) * PLOT_HEIGHT;
        return { x, y, data: d };
      });
  }, [data, maxCapacity]);

  const pointsPredicted = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => {
      const x = PADDING.left + (data.length > 1 ? (i / (data.length - 1)) * PLOT_WIDTH : PLOT_WIDTH / 2);
      const y = PADDING.top + PLOT_HEIGHT - (d.predicted / maxCapacity) * PLOT_HEIGHT;
      const yUpper = PADDING.top + PLOT_HEIGHT - (d.upperConfidence / maxCapacity) * PLOT_HEIGHT;
      const yLower = PADDING.top + PLOT_HEIGHT - (d.lowerConfidence / maxCapacity) * PLOT_HEIGHT;
      return { x, y, yUpper, yLower, data: d };
    });
  }, [data, maxCapacity]);

  const pointsComparison = useMemo(() => {
    if (compareMode === 'none' || !data || data.length === 0) return [];
    return data
      .filter((d) => d.comparisonValue !== null)
      .map((d, i) => {
        const x = PADDING.left + (data.length > 1 ? (i / (data.length - 1)) * PLOT_WIDTH : PLOT_WIDTH / 2);
        const y = PADDING.top + PLOT_HEIGHT - (d.comparisonValue / maxCapacity) * PLOT_HEIGHT;
        return { x, y, data: d };
      });
  }, [data, maxCapacity, compareMode]);

  // Smooth path helper
  const createSmoothPath = (pts, keyY = 'y') => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0][keyY]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx},${p0[keyY]} ${cx},${p1[keyY]} ${p1.x},${p1[keyY]}`;
    }
    return path;
  };

  const pathActual = useMemo(() => createSmoothPath(pointsActual), [pointsActual]);
  const pathPredicted = useMemo(() => createSmoothPath(pointsPredicted), [pointsPredicted]);
  const pathComparison = useMemo(() => createSmoothPath(pointsComparison), [pointsComparison]);

  // Confidence Envelope Area Band
  const confidenceEnvelopeArea = useMemo(() => {
    if (pointsPredicted.length === 0) return '';
    const upperPath = createSmoothPath(pointsPredicted, 'yUpper');
    let lowerReversed = '';
    for (let i = pointsPredicted.length - 1; i >= 0; i--) {
      const pt = pointsPredicted[i];
      lowerReversed += ` L ${pt.x},${pt.yLower}`;
    }
    return `${upperPath} ${lowerReversed} Z`;
  }, [pointsPredicted]);

  // Hover tracking
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relPercent = Math.max(
      0,
      Math.min(1, (relX - (PADDING.left / SVG_WIDTH) * rect.width) / ((PLOT_WIDTH / SVG_WIDTH) * rect.width))
    );
    const index = Math.round(relPercent * (data.length - 1));
    const point = data[index] || data[0];
    const xCoord = PADDING.left + (index / (data.length - 1)) * PLOT_WIDTH;
    setHoveredPoint(point);
    setHoverX(xCoord);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
  };

  return (
    <Card padding="normal" className="analytics-forecast-card">
      {/* Header & Controls */}
      <div className="analytics-forecast-header">
        <div className="analytics-forecast-header__left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-accent), #f59e0b)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', margin: 0 }}>
              Predictive Capacity Curve & Confidence Envelope
            </h3>
            {whatIfSpike > 0 && (
              <Badge variant="warning" size="sm" dot>
                +{whatIfSpike}% Simulated Spike Active
              </Badge>
            )}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Historical throughput with ML confidence bounds and comparative overlay.
          </p>
        </div>

        {/* Action button & Controls */}
        <div className="analytics-forecast-header__controls">
          {/* Time Range Selector */}
          <div className="chart-pill-selector" role="group" aria-label="Time range">
            <button
              className={`chart-pill-btn ${timeRange === '24h' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setTimeRange('24h')}
            >
              24h
            </button>
            <button
              className={`chart-pill-btn ${timeRange === '7d' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7d
            </button>
            <button
              className={`chart-pill-btn ${timeRange === '30d' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30d
            </button>
            <button
              className={`chart-pill-btn ${timeRange === 'custom' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setTimeRange('custom')}
            >
              Custom
            </button>
          </div>

          {/* Granularity Toggle */}
          <div className="chart-pill-selector" role="group" aria-label="Granularity">
            <button
              className={`chart-pill-btn ${granularity === 'hourly' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setGranularity('hourly')}
            >
              Hourly
            </button>
            <button
              className={`chart-pill-btn ${granularity === 'daily' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setGranularity('daily')}
            >
              Daily
            </button>
          </div>

          {/* Comparison Overlay Toggle */}
          <div className="chart-pill-selector" role="group" aria-label="Comparison overlay">
            <button
              className={`chart-pill-btn ${compareMode === 'none' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setCompareMode('none')}
            >
              Compare: Off
            </button>
            <button
              className={`chart-pill-btn ${compareMode === 'last_week' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setCompareMode('last_week')}
              title="Overlay Last Week telemetry"
            >
              vs Last Week
            </button>
            <button
              className={`chart-pill-btn ${compareMode === 'previous_deploy' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setCompareMode('previous_deploy')}
              title="Overlay Previous Deployment baseline"
            >
              vs Prev Deploy
            </button>
          </div>

          {onAskFriday && (
            <button
              onClick={() =>
                onAskFriday(
                  `Evaluate our capacity forecast for the next ${timeRange}. Will we breach cluster headroom? Current compare mode: ${compareMode}, What-If spike: +${whatIfSpike}%.`
                )
              }
              className="analytics-ask-friday-btn"
              title="Ask FRIDAY about Forecast"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Ask FRIDAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="analytics-forecast-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#8b5cf6' }} />
            <span className="legend-label">Actual Telemetry (Requests/s)</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span className="legend-label">ML Predicted Peak</span>
          </div>

          <div className="legend-item">
            <span
              style={{
                width: '12px',
                height: '8px',
                background: 'rgba(139, 92, 246, 0.25)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            <span className="legend-label">95% Confidence Envelope</span>
          </div>

          {compareMode !== 'none' && (
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#06b6d4' }} />
              <span className="legend-label" style={{ color: '#06b6d4' }}>
                {compareMode === 'last_week' ? 'Last Week Baseline' : 'Previous Deploy (v2.13.9)'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Provisioned Limit:</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-status-error)', fontWeight: 'bold' }}>
            11,000 req/s
          </span>
        </div>
      </div>

      {/* Transparent SVG Forecast Canvas or Clean Empty State */}
      {!data || data.length === 0 ? (
        <div style={{
          height: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border-subtle)',
          margin: 'var(--space-3) 0',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            color: 'var(--color-primary, #6366f1)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No Predictive Forecast Available Yet
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
            Capacity curves and confidence envelopes calibrate automatically once sufficient website telemetry has been ingested.
          </p>
        </div>
      ) : (
      <div
        className="traffic-chart-canvas-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '270px', position: 'relative', marginTop: 'var(--space-2)' }}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="forecastEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Transparent canvas */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="none" />

          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * ratio;
            return (
              <line
                key={ratio}
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Left Y-Axis labels */}
          {[0, 0.5, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * (1 - ratio);
            const val = Math.round(maxCapacity * ratio);
            return (
              <text
                key={ratio}
                x={PADDING.left - 10}
                y={y + 4}
                fill="var(--color-text-tertiary)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {val > 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            );
          })}

          {/* X-Axis labels */}
          {data.map((d, idx) => {
            const step = timeRange === '30d' ? 2 : 1;
            if (idx % step !== 0 && idx !== data.length - 1) return null;
            const x = PADDING.left + (idx / (data.length - 1)) * PLOT_WIDTH;
            return (
              <text
                key={idx}
                x={x}
                y={SVG_HEIGHT - 10}
                fill="var(--color-text-tertiary)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {d.label}
              </text>
            );
          })}

          {/* Confidence Area Band */}
          <path d={confidenceEnvelopeArea} fill="url(#forecastEnvelopeGrad)" />

          {/* Comparison Overlay Curve */}
          {compareMode !== 'none' && (
            <path
              d={pathComparison}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* Actual Telemetry Solid Line */}
          <path
            d={pathActual}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ML Predicted Dashed Curve */}
          <path
            d={pathPredicted}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover Crosshair Line */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={PADDING.top}
              x2={hoverX}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && hoverX !== null && (
          <div
            className="traffic-chart-tooltip"
            style={{
              left: `${(hoverX / SVG_WIDTH) * 100}%`,
              transform: hoverX > SVG_WIDTH * 0.65 ? 'translateX(-105%)' : 'translateX(12px)',
            }}
          >
            <div className="traffic-chart-tooltip__header">
              <span className="traffic-chart-tooltip__time">{hoveredPoint.label}</span>
              <Badge variant={hoveredPoint.isHistorical ? 'violet' : 'warning'} size="sm">
                {hoveredPoint.isHistorical ? 'Actual Telemetry' : 'ML Forecast'}
              </Badge>
            </div>
            <div className="traffic-chart-tooltip__rows">
              {hoveredPoint.actual !== null && (
                <div className="traffic-chart-tooltip__row">
                  <span className="traffic-chart-tooltip__dot" style={{ background: '#8b5cf6' }} />
                  <span className="traffic-chart-tooltip__key">Actual Throughput:</span>
                  <span className="traffic-chart-tooltip__val">{hoveredPoint.actual.toLocaleString()} req/s</span>
                </div>
              )}
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot" style={{ background: '#f59e0b' }} />
                <span className="traffic-chart-tooltip__key">Predicted Peak:</span>
                <span className="traffic-chart-tooltip__val">{hoveredPoint.predicted.toLocaleString()} req/s</span>
              </div>
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot" style={{ background: '#a855f7' }} />
                <span className="traffic-chart-tooltip__key">Confidence Range:</span>
                <span className="traffic-chart-tooltip__val">
                  {hoveredPoint.lowerConfidence.toLocaleString()} – {hoveredPoint.upperConfidence.toLocaleString()} req/s
                </span>
              </div>
              {hoveredPoint.comparisonValue !== null && (
                <div className="traffic-chart-tooltip__row">
                  <span className="traffic-chart-tooltip__dot" style={{ background: '#06b6d4' }} />
                  <span className="traffic-chart-tooltip__key">Comparison Series:</span>
                  <span className="traffic-chart-tooltip__val">{hoveredPoint.comparisonValue.toLocaleString()} req/s</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </Card>
  );
}
