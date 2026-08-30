import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function AnalyticsHeader({
  sensitivity,
  onSensitivityChange,
  liveCrashRisk,
  liveHeadroom,
  onNavigate,
  onExportReport,
  onApplyRecommendation,
  onAskFriday,
  isExporting = false,
}) {
  const riskStatus = liveCrashRisk < 15 ? 'Low Risk' : liveCrashRisk < 50 ? 'Moderate Risk' : 'Critical Risk';
  const riskBadgeVariant = liveCrashRisk < 15 ? 'success' : liveCrashRisk < 50 ? 'warning' : 'error';
  const riskColor =
    liveCrashRisk < 15 ? 'var(--color-status-success)' : liveCrashRisk < 50 ? 'var(--color-status-warning)' : 'var(--color-status-error)';

  return (
    <div className="analytics-header-section">
      {/* ── Studio Top Row ── */}
      <div className="analytics-header-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', margin: 0 }}>
              Analytics & Capacity Forecasting Studio
            </h2>
            <Badge variant="violet" size="sm" dot>
              Predictive ML Model v3.2
            </Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Machine learning anomaly detection, crash risk probability, cross-metric regression, and resource runway models.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Export Report Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportReport}
            loading={isExporting}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Export Forecast Report (CSV)
          </Button>

          {/* Return to Dashboard */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate && onNavigate('dashboard')}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            ← Operations Control
          </Button>
        </div>
      </div>

      {/* ── Studio Top Cards Grid (Crash Risk Gauge + Sensitivity Slider) ── */}
      <div className="analytics-top-grid">
        {/* Card 1: Projected 24h Crash Risk */}
        <Card padding="normal" className="analytics-crash-risk-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
                Projected 24h Crash Risk
              </h4>
              <Badge variant={riskBadgeVariant} size="sm">
                {riskStatus} ({liveCrashRisk}%)
              </Badge>
            </div>

            {onAskFriday && (
              <button
                onClick={() =>
                  onAskFriday(
                    `Explain why projected 24h crash risk is calculated at ${liveCrashRisk}%. What specific infrastructure failure modes contribute most?`
                  )
                }
                className="analytics-ask-friday-btn"
                title="Ask FRIDAY about Crash Risk"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Ask FRIDAY</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', margin: 'var(--space-2) 0' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'bold',
                color: riskColor,
              }}
            >
              {liveCrashRisk}%
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              {liveHeadroom}% headroom probability
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(4, liveCrashRisk))}%`,
                height: '100%',
                background: riskColor,
                borderRadius: '999px',
                transition: 'width 300ms ease, background 300ms ease',
              }}
            />
          </div>

          {/* Actionability trigger on crash risk card */}
          {liveCrashRisk > 10 && onApplyRecommendation && (
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onApplyRecommendation({
                    id: 'crash-risk-mitigation',
                    title: 'Proactive Autoscaling Buffer',
                    service: 'ingress-envoy-gateway',
                    recommendedAction: 'Scale ingress cluster replicas by +25%',
                  })
                }
              >
                Apply Scaling Buffer Recommendation →
              </Button>
            </div>
          )}
        </Card>

        {/* Card 2: ML Anomaly Sensitivity */}
        <Card padding="normal" className="analytics-sensitivity-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
                ML Anomaly Sensitivity
              </h4>
              <Badge variant="violet" size="sm">
                {sensitivity}% Active
              </Badge>
            </div>

            {onAskFriday && (
              <button
                onClick={() =>
                  onAskFriday(
                    `Explain how our ML Anomaly Sensitivity setting (${sensitivity}%) affects anomaly detection thresholds. Should I adjust it?`
                  )
                }
                className="analytics-ask-friday-btn"
                title="Ask FRIDAY about Sensitivity"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Ask FRIDAY</span>
              </button>
            )}
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Adjust detection threshold tolerance for microsecond latency deviations (synced live with FRIDAY AI).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>50%</span>
            <input
              type="range"
              min="50"
              max="99"
              value={sensitivity}
              onChange={(e) => onSensitivityChange(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>99%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
            <span>Broad Tolerance (Fewer Alerts)</span>
            <span>Ultra Precision (Micro Spikes)</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
