import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { CORRELATION_PAIRS, generateCorrelationData } from './analyticsData';

const SVG_WIDTH = 760;
const SVG_HEIGHT = 240;
const PADDING = { top: 20, right: 55, bottom: 35, left: 55 };
const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

export function CorrelationView({ onAskFriday }) {
  const [selectedPairId, setSelectedPairId] = useState('latency-conversion');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverX, setHoverX] = useState(null);

  const containerRef = useRef(null);

  // Active correlation pair metadata
  const pair = useMemo(() => {
    return CORRELATION_PAIRS.find((p) => p.id === selectedPairId) || CORRELATION_PAIRS[0];
  }, [selectedPairId]);

  // Generate data points for this pair
  const data = useMemo(() => {
    return generateCorrelationData(selectedPairId);
  }, [selectedPairId]);

  // Compute scale boundaries for dual axes
  const maxA = useMemo(() => Math.max(...data.map((d) => d.valA)) * 1.15, [data]);
  const minA = useMemo(() => Math.min(...data.map((d) => d.valA)) * 0.85, [data]);
  const maxB = useMemo(() => Math.max(...data.map((d) => d.valB)) * 1.15, [data]);
  const minB = useMemo(() => Math.min(...data.map((d) => d.valB)) * 0.85, [data]);

  // Build SVG Points for Metric A (left axis) and Metric B (right axis)
  const pointsA = useMemo(() => {
    return data.map((d, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH;
      const yRange = maxA - minA || 1;
      const y = PADDING.top + PLOT_HEIGHT - ((d.valA - minA) / yRange) * PLOT_HEIGHT;
      return { x, y, val: d.valA, label: d.label };
    });
  }, [data, maxA, minA]);

  const pointsB = useMemo(() => {
    return data.map((d, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH;
      const yRange = maxB - minB || 1;
      const y = PADDING.top + PLOT_HEIGHT - ((d.valB - minB) / yRange) * PLOT_HEIGHT;
      return { x, y, val: d.valB, label: d.label };
    });
  }, [data, maxB, minB]);

  // Helper for smooth cubic bezier SVG path
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const pathA = useMemo(() => createSmoothPath(pointsA), [pointsA]);
  const pathB = useMemo(() => createSmoothPath(pointsB), [pointsB]);

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
    <Card padding="normal" className="analytics-correlation-card">
      {/* Header */}
      <div className="analytics-correlation-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-accent), #06b6d4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', margin: 0 }}>
              Multi-Metric Correlation & Impact Analysis
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Dual-axis telemetry regression showing cross-metric dependency and business impact
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Preset Pair Selector */}
          <div className="chart-pill-selector" role="tablist">
            {CORRELATION_PAIRS.map((p) => (
              <button
                key={p.id}
                className={`chart-pill-btn ${selectedPairId === p.id ? 'chart-pill-btn--active' : ''}`}
                onClick={() => setSelectedPairId(p.id)}
              >
                {p.name.split('vs')[0].trim()} vs {p.name.split('vs')[1]?.trim()}
              </button>
            ))}
          </div>

          {onAskFriday && (
            <button
              onClick={() =>
                onAskFriday(
                  `Explain the correlation between ${pair.metricA.label} and ${pair.metricB.label} (Pearson r = ${pair.pearsonR}). What threshold violations risk business conversion?`
                )
              }
              className="analytics-ask-friday-btn"
              title="Ask FRIDAY about this correlation"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Ask FRIDAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Legend & Pearson Score */}
      <div className="analytics-correlation-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: pair.metricA.color }} />
            <span className="legend-label" style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)' }}>
              {pair.metricA.label} (Left Y-Axis)
            </span>
          </div>

          <div className="legend-item">
            <span className="legend-dot" style={{ background: pair.metricB.color }} />
            <span className="legend-label" style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)' }}>
              {pair.metricB.label} (Right Y-Axis)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Pearson Coefficient:</span>
          <Badge variant={pair.pearsonR < -0.8 ? 'warning' : 'violet'} size="sm">
            r = {pair.pearsonR} ({pair.relationship})
          </Badge>
        </div>
      </div>

      {/* Transparent Dual-Axis SVG Chart */}
      <div
        className="traffic-chart-canvas-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '240px', position: 'relative', marginTop: 'var(--space-2)' }}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          preserveAspectRatio="none"
        >
          {/* Strictly transparent canvas */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="none" />

          {/* Subtle horizontal gridlines */}
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

          {/* Left Y-Axis Labels (Metric A) */}
          {[0, 0.5, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * (1 - ratio);
            const val = +(minA + (maxA - minA) * ratio).toFixed(pair.metricA.unit === '%' ? 1 : 0);
            return (
              <text
                key={`left-${ratio}`}
                x={PADDING.left - 10}
                y={y + 4}
                fill={pair.metricA.color}
                fontSize="11"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {val} {pair.metricA.unit}
              </text>
            );
          })}

          {/* Right Y-Axis Labels (Metric B) */}
          {[0, 0.5, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * (1 - ratio);
            const val = +(minB + (maxB - minB) * ratio).toFixed(pair.metricB.unit === '%' ? 1 : 0);
            return (
              <text
                key={`right-${ratio}`}
                x={SVG_WIDTH - PADDING.right + 10}
                y={y + 4}
                fill={pair.metricB.color}
                fontSize="11"
                fontFamily="var(--font-mono)"
                textAnchor="start"
              >
                {val} {pair.metricB.unit}
              </text>
            );
          })}

          {/* X-Axis Time Labels */}
          {data.map((d, idx) => {
            if (idx % 2 !== 0 && idx !== data.length - 1) return null;
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

          {/* Metric A Curve */}
          <path
            d={pathA}
            fill="none"
            stroke={pair.metricA.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Metric B Curve */}
          <path
            d={pathB}
            fill="none"
            stroke={pair.metricB.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pair.pearsonR < 0 ? '6 4' : 'none'}
          />

          {/* Crosshair Line */}
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
              <Badge variant="violet" size="sm">Correlated Point</Badge>
            </div>
            <div className="traffic-chart-tooltip__rows">
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot" style={{ background: pair.metricA.color }} />
                <span className="traffic-chart-tooltip__key">{pair.metricA.label}:</span>
                <span className="traffic-chart-tooltip__val">
                  {hoveredPoint.valA} {pair.metricA.unit}
                </span>
              </div>
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot" style={{ background: pair.metricB.color }} />
                <span className="traffic-chart-tooltip__key">{pair.metricB.label}:</span>
                <span className="traffic-chart-tooltip__val">
                  {hoveredPoint.valB} {pair.metricB.unit}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ML Correlation Insight Banner */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span style={{ color: 'var(--color-accent-light)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>ML Predictive Insight:</strong> {pair.insight}
        </p>
      </div>
    </Card>
  );
}
