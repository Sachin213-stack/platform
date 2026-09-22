import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function UsageOverview({
  currentPlan = 'Enterprise',
  cycleDates = {
    start: 'Aug 01, 2026',
    end: 'Aug 31, 2026',
    renewsOn: 'Sep 01, 2026',
  },
  onUpgradeClick,
}) {
  // Usage categories data model
  const [categories] = useState([
    {
      id: 'telemetry',
      name: 'Monthly Telemetry Compute',
      used: 0,
      limit: 10,
      unit: 'M Events',
      percent: 0,
      variant: 'violet',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
          <path d="M2 12h12M4 9l3-3 3 3 4-6" />
        </svg>
      ),
    },
    {
      id: 'friday_ai',
      name: 'FRIDAY AI Agent Invocations',
      used: 0,
      limit: 2500,
      unit: 'Actions',
      percent: 0,
      variant: 'emerald',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
          <polygon points="8 1 10 6 15 8 10 10 8 15 6 10 1 8 6 6 8 1" />
        </svg>
      ),
    },
    {
      id: 'vector_storage',
      name: 'Vector Database Storage',
      used: 0,
      limit: 25,
      unit: 'GB',
      percent: 0,
      variant: 'amber',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
          <ellipse cx="8" cy="4" rx="6" ry="2.5" />
          <path d="M2 4v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V4" />
          <path d="M2 8v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V8" />
        </svg>
      ),
    },
    {
      id: 'egress',
      name: 'Real-time API Egress Bandwidth',
      used: 0,
      limit: 500,
      unit: 'GB',
      percent: 0,
      variant: 'violet',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
          <path d="M4 12V4l8 8V4" />
        </svg>
      ),
    },
  ]);

  // Mini-chart trend data across last 3 billing cycles (June, July, August)
  const trendCycles = [
    { month: 'June 2026', compute: 3.1, fridayAi: 520, cost: '$799', percent: 31 },
    { month: 'July 2026', compute: 3.8, fridayAi: 710, cost: '$799', percent: 38 },
    { month: 'August 2026 (Current)', compute: 4.2, fridayAi: 842, cost: '$799', percent: 42 },
  ];

  const [hoveredTrend, setHoveredTrend] = useState(trendCycles[2]);

  // Check if any category is over 80% or 100% threshold
  const highestUsage = Math.max(...categories.map((c) => c.percent));
  const isWarning = highestUsage >= 80;
  const isCritical = highestUsage >= 95;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Overage Warning Banner */}
      {isWarning && (
        <div className={`billing-alert-banner ${isCritical ? 'billing-alert-banner--critical' : ''}`}>
          <div className="billing-alert-banner__content">
            <div className="billing-alert-banner__icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 3L2 17h16L10 3z" />
                <line x1="10" y1="8" x2="10" y2="12" />
                <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="billing-alert-banner__title">
                {isCritical
                  ? `Critical Usage Alert: You've reached ${highestUsage.toFixed(0)}% of your plan quota!`
                  : `You're at ${highestUsage.toFixed(0)}% of your plan limit — upgrade to avoid service throttling`}
              </div>
              <div className="billing-alert-banner__text">
                Your monthly compute telemetry and autonomous agent invocations are tracking higher than previous cycles.
              </div>
            </div>
          </div>
          <Button
            variant={isCritical ? 'danger' : 'primary'}
            size="sm"
            onClick={onUpgradeClick}
          >
            Upgrade Plan & Quota →
          </Button>
        </div>
      )}

      {/* Grid: Quotas & Mini Trend Chart */}
      <div className="usage-overview-grid">
        {/* Left: Usage Category Breakdown & Cycle Dates */}
        <Card padding="normal">
          <CardHeader
            title="Usage Overview & Quotas"
            subtitle="Real-time resource allocation and consumption across active services"
            action={<Badge variant="violet" size="sm">{currentPlan} Plan</Badge>}
          />
          <CardBody>
            {/* Cycle Dates Badge Bar */}
            <div className="usage-cycles-badge-row">
              <div className="cycle-date-item">
                <span className="cycle-date-item__label">Cycle Start</span>
                <span className="cycle-date-item__value">{cycleDates.start}</span>
              </div>
              <div className="cycle-date-divider" />
              <div className="cycle-date-item">
                <span className="cycle-date-item__label">Cycle End</span>
                <span className="cycle-date-item__value">{cycleDates.end}</span>
              </div>
              <div className="cycle-date-divider" />
              <div className="cycle-date-item">
                <span className="cycle-date-item__label">Renews On</span>
                <span className="cycle-date-item__value" style={{ color: 'var(--color-accent)' }}>
                  {cycleDates.renewsOn}
                </span>
              </div>
            </div>

            {/* Category Progress Meters */}
            <div className="usage-meters-list">
              {categories.map((cat) => (
                <div key={cat.id} className="usage-meter-item">
                  <div className="usage-meter-item__header">
                    <span className="usage-meter-item__name">
                      <span style={{ color: 'var(--color-accent-light)' }}>{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="usage-meter-item__stats">
                      <strong>{cat.used}</strong> / {cat.limit} {cat.unit} ({cat.percent}%)
                    </span>
                  </div>
                  <div className="usage-progress-bar">
                    <div
                      className={`usage-progress-fill usage-progress-fill--${cat.variant}`}
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Right: Transparent 3-Cycle Usage Trend Mini-Chart */}
        <Card padding="normal" className="usage-trend-chart-card">
          <div>
            <CardHeader
              title="3-Cycle Usage Trend"
              subtitle="Comparison across June, July & August billing cycles"
            />
            
            <div className="usage-trend-chart-container">
              {/* Tooltip Overlay */}
              {hoveredTrend && (
                <div className="trend-tooltip">
                  <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {hoveredTrend.month}
                  </div>
                  <div style={{ color: 'var(--color-accent-light)', marginTop: '2px' }}>
                    Compute: {hoveredTrend.compute}M Events ({hoveredTrend.percent}%)
                  </div>
                  <div style={{ color: 'var(--color-status-success)' }}>
                    FRIDAY AI: {hoveredTrend.fridayAi} Actions
                  </div>
                </div>
              )}

              {/* Pure SVG Trend Area Chart with Transparent Background */}
              <svg
                viewBox="0 0 320 140"
                className="usage-trend-chart-svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="20" y1="25" x2="300" y2="25" stroke="var(--color-border-subtle)" strokeDasharray="3,3" />
                <line x1="20" y1="70" x2="300" y2="70" stroke="var(--color-border-subtle)" strokeDasharray="3,3" />
                <line x1="20" y1="115" x2="300" y2="115" stroke="var(--color-border-subtle)" />

                {/* Area Fill */}
                <path
                  d="M 50,85 C 100,75 120,60 160,55 C 200,50 220,38 270,30 L 270,115 L 50,115 Z"
                  fill="url(#trendGradient)"
                />

                {/* Trend Stroke Line */}
                <path
                  d="M 50,85 C 100,75 120,60 160,55 C 200,50 220,38 270,30"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {trendCycles.map((t, idx) => {
                  const x = 50 + idx * 110;
                  const y = idx === 0 ? 85 : idx === 1 ? 55 : 30;
                  const isSelected = hoveredTrend?.month === t.month;
                  return (
                    <g
                      key={t.month}
                      className="trend-dot"
                      onMouseEnter={() => setHoveredTrend(t)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : 4}
                        fill="var(--color-bg-primary)"
                        stroke="var(--color-accent)"
                        strokeWidth="2.5"
                      />
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={10}
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeOpacity="0.4"
                          strokeWidth="1.5"
                        />
                      )}
                      {/* X-axis labels */}
                      <text
                        x={x}
                        y={132}
                        textAnchor="middle"
                        fill={isSelected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'}
                        fontSize="10"
                        fontFamily="var(--font-body)"
                        fontWeight={isSelected ? '600' : '400'}
                      >
                        {t.month.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="trend-legend">
            <div className="trend-legend-item">
              <div className="trend-legend-dot" style={{ background: 'var(--color-accent)' }} />
              <span>Telemetry Consumption (+35% QoQ)</span>
            </div>
            <div className="trend-legend-item">
              <span style={{ color: 'var(--color-status-success)', fontWeight: 'var(--weight-semibold)' }}>●</span>
              <span>All Quotas Normal</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
