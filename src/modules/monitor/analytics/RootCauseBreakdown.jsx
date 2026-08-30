import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function RootCauseBreakdown({
  anomaly,
  onApplyRecommendation,
  onAskFriday,
}) {
  if (!anomaly) {
    return (
      <Card padding="normal" className="analytics-root-cause-card">
        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-tertiary)' }}>
          <p style={{ fontSize: 'var(--text-sm)' }}>Select an anomaly from the timeline to inspect its ML Root Cause Breakdown.</p>
        </div>
      </Card>
    );
  }

  const rootCauses = anomaly.rootCauses || [
    {
      factor: 'Service Load Contention',
      importance: 55,
      category: 'Compute',
      description: 'High thread contention observed in microservice runtime.',
    },
    {
      factor: 'External Dependency Latency',
      importance: 30,
      category: 'Network',
      description: 'Upstream gateway latency exceeded nominal SLA.',
    },
    {
      factor: 'Cache Miss Inefficiencies',
      importance: 15,
      category: 'Cache',
      description: 'Elevated origin database fallback requests.',
    },
  ];

  return (
    <Card padding="normal" className="analytics-root-cause-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-accent), #a855f7)',
                color: '#fff',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', margin: 0 }}>
              ML Root Cause & Feature Attribution Breakdown
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Explaining anomaly <strong style={{ color: 'var(--color-accent-light)' }}>{anomaly.title}</strong> on <code style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{anomaly.service}</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Badge variant={anomaly.status === 'Active' ? 'error' : 'success'} size="sm">
            {anomaly.status} Incident
          </Badge>
          {onAskFriday && (
            <button
              onClick={() =>
                onAskFriday(
                  `Analyze the root causes for anomaly "${anomaly.title}" (${anomaly.service}). Factors: ${rootCauses.map((r) => `${r.factor} (${r.importance}%)`).join(', ')}. What is the best remediation playbook?`
                )
              }
              className="analytics-ask-friday-btn"
              title="Ask FRIDAY about this root cause"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Ask FRIDAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Banner */}
      <div
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Observed Metric Deviation</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-status-error)', marginTop: '2px' }}>
              {anomaly.observedValue} <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 'normal' }}>(Baseline: {anomaly.baselineValue})</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: 'var(--space-3)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Telemetry Impact</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {anomaly.impact}
            </div>
          </div>
        </div>

        {anomaly.status === 'Active' && onApplyRecommendation && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApplyRecommendation(anomaly)}
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          >
            {anomaly.recommendedAction || 'Apply Mitigation'}
          </Button>
        )}
      </div>

      {/* Ranked Horizontal Bars for Feature Importance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            Contributing Factors (Ranked by ML Attribution Weight)
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            SHAP Value Importance %
          </span>
        </div>

        {rootCauses.map((rc, idx) => {
          // Color coding based on rank
          const barColor =
            idx === 0
              ? 'linear-gradient(90deg, #8b5cf6, #ef4444)'
              : idx === 1
              ? 'linear-gradient(90deg, #8b5cf6, #f59e0b)'
              : 'linear-gradient(90deg, #6366f1, #8b5cf6)';

          return (
            <div
              key={rc.factor}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3)',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      background: idx === 0 ? 'var(--color-status-error-bg)' : 'var(--color-accent-subtle)',
                      color: idx === 0 ? 'var(--color-status-error)' : 'var(--color-accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {rc.factor}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {rc.category}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: 'var(--text-md)', fontWeight: 'bold', color: idx === 0 ? 'var(--color-status-error)' : 'var(--color-accent-light)', fontFamily: 'var(--font-mono)' }}>
                    {rc.importance}%
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>attribution</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                <div
                  style={{
                    width: `${rc.importance}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '999px',
                    transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
                {rc.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
