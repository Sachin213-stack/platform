import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function CapacityPlanner({
  resourceRunway,
  whatIfSpike,
  onWhatIfChange,
  liveCrashRisk,
  liveHeadroom,
  onApplyRecommendation,
  onAskFriday,
}) {
  if (!resourceRunway) return null;

  // Calculate dynamic simulated cost based on What-If spike
  const simulatedReplicas = Math.ceil(whatIfSpike / 40);
  const simulatedCostDelta = simulatedReplicas * 205; // $205 per additional replica tier
  const totalSimulatedCost = resourceRunway.currentMonthlyCost + simulatedCostDelta;

  return (
    <div className="analytics-capacity-planner-grid">
      {/* ── 1. Resource Runway Card ───────────────────────────────── */}
      <Card padding="normal" className="analytics-runway-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </span>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
              Resource Runway Projection
            </h4>
          </div>

          {onAskFriday && (
            <button
              onClick={() =>
                onAskFriday(
                  `Assess our infrastructure resource runway (~${resourceRunway.runwayDays} days remaining). Primary bottleneck is ${resourceRunway.bottleneck}. What auto-scaling policy should we configure?`
                )
              }
              className="analytics-ask-friday-btn"
              title="Ask FRIDAY about Runway"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Ask FRIDAY</span>
            </button>
          )}
        </div>

        {/* Big Runway Metric Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'bold',
              color: resourceRunway.runwayDays > 30 ? 'var(--color-status-success)' : 'var(--color-status-warning)',
            }}
          >
            ~{resourceRunway.runwayDays} Days
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            ({resourceRunway.runwayWeeks} weeks remaining until saturation)
          </span>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: '1.45' }}>
          At current growth rate (<strong style={{ color: 'var(--color-accent-light)' }}>+{resourceRunway.growthRatePct}% / week</strong>), capacity limit will be breached on <strong style={{ color: 'var(--color-text-primary)' }}>{resourceRunway.exhaustionDate}</strong>.
        </p>

        {/* Runway Progress Bar */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
            <span>Current Utilization: {resourceRunway.bottleneckCurrentPct}%</span>
            <span>Critical Ceiling: {resourceRunway.bottleneckLimitPct}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${resourceRunway.bottleneckCurrentPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #f59e0b)',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>

        {/* Bottleneck Callout & Recommendation */}
        <div
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2) var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Primary Resource Constraint:</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-status-warning)', marginTop: '2px' }}>
            {resourceRunway.bottleneck}
          </div>
        </div>

        {onApplyRecommendation && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onApplyRecommendation({
                id: 'runway-remediation',
                title: 'Proactive MemoryDB Scaling',
                service: 'redis-memory-cluster',
                recommendedAction: resourceRunway.recommendedAction,
              })
            }
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          >
            Apply Proactive Scale Recommendation
          </Button>
        )}
      </Card>

      {/* ── 2. What-If Traffic Simulator Card ─────────────────────── */}
      <Card padding="normal" className="analytics-simulator-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
              What-If Traffic Spike Simulator
            </h4>
          </div>

          <Badge variant={whatIfSpike > 100 ? 'error' : whatIfSpike > 0 ? 'warning' : 'neutral'} size="sm">
            +{whatIfSpike}% Simulated Surge
          </Badge>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
          Simulate marketing flash sales or traffic spikes to test crash risk thresholds in real-time.
        </p>

        {/* Range Slider */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
            <span>Baseline (+0%)</span>
            <span>+100% (2x)</span>
            <span>+200% (3x)</span>
            <span>+300% (4x)</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={whatIfSpike}
            onChange={(e) => onWhatIfChange(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </div>

        {/* Live Simulation Output Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div className="analytics-sim-metric-box">
            <span className="analytics-sim-metric-label">Projected Crash Risk</span>
            <span
              className="analytics-sim-metric-val"
              style={{
                color: liveCrashRisk < 15 ? 'var(--color-status-success)' : liveCrashRisk < 50 ? 'var(--color-status-warning)' : 'var(--color-status-error)',
              }}
            >
              {liveCrashRisk}%
            </span>
          </div>

          <div className="analytics-sim-metric-box">
            <span className="analytics-sim-metric-label">Headroom Probability</span>
            <span className="analytics-sim-metric-val">{liveHeadroom}%</span>
          </div>
        </div>

        {whatIfSpike > 80 && (
          <div
            style={{
              background: 'var(--color-status-error-bg)',
              border: '1px solid var(--color-status-error-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: '11px',
              color: 'var(--color-status-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Simulated load exceeds cluster autoscale headroom! Additional replicas required.</span>
          </div>
        )}
      </Card>

      {/* ── 3. Monthly Cost Projection Card ───────────────────────── */}
      <Card padding="normal" className="analytics-cost-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-accent), #a855f7)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
              Capacity Cost Projection Model
            </h4>
          </div>

          <Badge variant="violet" size="sm">
            {whatIfSpike > 0 ? `+$${simulatedCostDelta}/mo Surge Delta` : 'Baseline Tier'}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            ${totalSimulatedCost.toLocaleString()}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            / month (Baseline: ${resourceRunway.currentMonthlyCost.toLocaleString()}/mo)
          </span>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
          Autoscaling infrastructure cost tied to simulated demand and provisioning limits.
        </p>

        {/* Cost Breakdown Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div className="analytics-cost-row">
            <span className="analytics-cost-row__label">Compute Instances (EKS / ECS)</span>
            <span className="analytics-cost-row__val">
              ${(resourceRunway.costBreakdown.computeNodes + Math.round(simulatedCostDelta * 0.6)).toLocaleString()}/mo
            </span>
          </div>

          <div className="analytics-cost-row">
            <span className="analytics-cost-row__label">Redis In-Memory Tier</span>
            <span className="analytics-cost-row__val">
              ${(resourceRunway.costBreakdown.redisMemory + Math.round(simulatedCostDelta * 0.25)).toLocaleString()}/mo
            </span>
          </div>

          <div className="analytics-cost-row">
            <span className="analytics-cost-row__label">Global Ingress / Egress CDN</span>
            <span className="analytics-cost-row__val">
              ${(resourceRunway.costBreakdown.dataTransfer + Math.round(simulatedCostDelta * 0.15)).toLocaleString()}/mo
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
