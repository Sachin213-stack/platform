import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { generateChartData } from '../dashboardData';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 260;
const PADDING = { top: 20, right: 30, bottom: 35, left: 55 };
const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

export function TrafficRevenueChart({
  businessType = 'ecommerce',
  isLive = true,
}) {
  const [timeRange, setTimeRange] = useState('24h'); // '24h' | '7d' | '30d'
  const [metricMode, setMetricMode] = useState('both'); // 'traffic' | 'revenue' | 'both'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverX, setHoverX] = useState(null);

  const containerRef = useRef(null);

  // Generate chart data based on active range and business
  const data = useMemo(() => {
    return generateChartData(timeRange, businessType);
  }, [timeRange, businessType]);

  // Compute scale boundaries
  const maxTraffic = useMemo(() => Math.max(...data.map((d) => d.traffic)) * 1.15, [data]);
  const maxRevenue = useMemo(() => Math.max(...data.map((d) => d.revenue)) * 1.15, [data]);

  // Build SVG path points
  const pointsTraffic = useMemo(() => {
    return data.map((d, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH;
      const y = PADDING.top + PLOT_HEIGHT - (d.traffic / maxTraffic) * PLOT_HEIGHT;
      return { x, y, data: d };
    });
  }, [data, maxTraffic]);

  const pointsRevenue = useMemo(() => {
    return data.map((d, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH;
      const y = PADDING.top + PLOT_HEIGHT - (d.revenue / maxRevenue) * PLOT_HEIGHT;
      return { x, y, data: d };
    });
  }, [data, maxRevenue]);

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

  const pathTraffic = useMemo(() => createSmoothPath(pointsTraffic), [pointsTraffic]);
  const pathRevenue = useMemo(() => createSmoothPath(pointsRevenue), [pointsRevenue]);

  const areaTraffic = useMemo(() => {
    if (pointsTraffic.length === 0) return '';
    const bottomY = PADDING.top + PLOT_HEIGHT;
    const lastX = pointsTraffic[pointsTraffic.length - 1].x;
    const firstX = pointsTraffic[0].x;
    return `${pathTraffic} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathTraffic, pointsTraffic]);

  const areaRevenue = useMemo(() => {
    if (pointsRevenue.length === 0) return '';
    const bottomY = PADDING.top + PLOT_HEIGHT;
    const lastX = pointsRevenue[pointsRevenue.length - 1].x;
    const firstX = pointsRevenue[0].x;
    return `${pathRevenue} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathRevenue, pointsRevenue]);

  // Mouse hover tracking for exact crosshair & tooltip
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relPercent = Math.max(0, Math.min(1, (relX - (PADDING.left / SVG_WIDTH) * rect.width) / ((PLOT_WIDTH / SVG_WIDTH) * rect.width)));
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
    <Card className="traffic-chart-card" padding="compact">
      {/* ── Chart Top Controls ── */}
      <div className="traffic-chart-header">
        <div className="traffic-chart-header__left">
          <div className="traffic-chart-title-row">
            <h3 className="traffic-chart-title">Traffic & Revenue Telemetry</h3>
            {isLive && (
              <span className="traffic-live-indicator">
                <span className="traffic-live-indicator__dot" />
                Live Stream
              </span>
            )}
          </div>
          <p className="traffic-chart-subtitle">
            Correlated request throughput vs checkout GMV velocity
          </p>
        </div>

        <div className="traffic-chart-header__controls">
          {/* Metric Overlay Selector */}
          <div className="chart-pill-selector" role="group" aria-label="Metric views">
            <button
              className={`chart-pill-btn ${metricMode === 'traffic' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setMetricMode('traffic')}
            >
              Traffic Only
            </button>
            <button
              className={`chart-pill-btn ${metricMode === 'revenue' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setMetricMode('revenue')}
            >
              Revenue Only
            </button>
            <button
              className={`chart-pill-btn ${metricMode === 'both' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setMetricMode('both')}
            >
              Both Overlaid
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="chart-pill-selector chart-pill-selector--range" role="group" aria-label="Time range">
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
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="traffic-chart-legend">
        {(metricMode === 'traffic' || metricMode === 'both') && (
          <div className="legend-item">
            <span className="legend-dot legend-dot--traffic" />
            <span className="legend-label">Throughput ({businessType === 'saas' ? 'API Invocations' : 'Requests/s'})</span>
          </div>
        )}
        {(metricMode === 'revenue' || metricMode === 'both') && (
          <div className="legend-item">
            <span className="legend-dot legend-dot--revenue" />
            <span className="legend-label">Revenue Velocity ($/min GMV)</span>
          </div>
        )}
        <div className="legend-item legend-item--conversion">
          <span className="legend-badge">Avg Conv: {data[data.length - 1]?.conversion || 3.2}%</span>
        </div>
      </div>

      {/* ── SVG Transparent Chart Canvas ── */}
      <div
        className="traffic-chart-canvas-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          className="traffic-chart-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Violet Gradient for Traffic */}
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#8b5cf6" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>

            {/* Amber/Gold Gradient for Revenue */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Transparent Canvas - strictly NO solid background */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="none" />

          {/* Horizontal Subtle Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * ratio;
            return (
              <line
                key={ratio}
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke="var(--color-border-subtle)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Left Y-Axis Labels (Traffic / Requests) */}
          {[0, 0.5, 1].map((ratio) => {
            const y = PADDING.top + PLOT_HEIGHT * (1 - ratio);
            const val = Math.round(maxTraffic * ratio);
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
                {val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            );
          })}

          {/* X-Axis Time Labels */}
          {data.map((d, idx) => {
            // Show every 2nd or 3rd label depending on range
            const step = timeRange === '30d' ? 3 : timeRange === '7d' ? 1 : 2;
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

          {/* Metric Area and Line: Traffic */}
          {(metricMode === 'traffic' || metricMode === 'both') && (
            <>
              <path d={areaTraffic} fill="url(#trafficGradient)" />
              <path
                d={pathTraffic}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Metric Area and Line: Revenue */}
          {(metricMode === 'revenue' || metricMode === 'both') && (
            <>
              <path d={areaRevenue} fill="url(#revenueGradient)" />
              <path
                d={pathRevenue}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Active Hover Crosshair Line */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={PADDING.top}
              x2={hoverX}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="var(--color-text-tertiary)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Floating Tooltip with exact point details */}
        {hoveredPoint && hoverX !== null && (
          <div
            className="traffic-chart-tooltip"
            style={{
              left: `${(hoverX / SVG_WIDTH) * 100}%`,
              transform: hoverX > SVG_WIDTH * 0.7 ? 'translateX(-105%)' : 'translateX(10px)',
            }}
          >
            <div className="traffic-chart-tooltip__header">
              <span className="traffic-chart-tooltip__time">{hoveredPoint.label}</span>
              <Badge variant="violet" size="sm">Point Telemetry</Badge>
            </div>
            <div className="traffic-chart-tooltip__rows">
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot traffic-chart-tooltip__dot--traffic" />
                <span className="traffic-chart-tooltip__key">Throughput:</span>
                <span className="traffic-chart-tooltip__val">{hoveredPoint.traffic.toLocaleString()} req/m</span>
              </div>
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot traffic-chart-tooltip__dot--revenue" />
                <span className="traffic-chart-tooltip__key">Revenue Velocity:</span>
                <span className="traffic-chart-tooltip__val">${hoveredPoint.revenue.toLocaleString()}/min</span>
              </div>
              <div className="traffic-chart-tooltip__row">
                <span className="traffic-chart-tooltip__dot traffic-chart-tooltip__dot--conv" />
                <span className="traffic-chart-tooltip__key">Conversion Rate:</span>
                <span className="traffic-chart-tooltip__val">{hoveredPoint.conversion}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
