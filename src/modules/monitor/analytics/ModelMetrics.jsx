import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';

export function ModelMetrics({ modelMetrics, onAskFriday }) {
  if (!modelMetrics) {
    return (
      <Card padding="compact" className="analytics-model-metrics-card">
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: '0 0 6px', fontWeight: 600 }}>
            Predictive Model Calibration Pending
          </p>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
            ML confidence and accuracy metrics will calibrate automatically once live telemetry streams.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="compact" className="analytics-model-metrics-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-accent), #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 12px var(--color-accent-glow)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
              Model Performance & Confidence
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {modelMetrics.version} • {modelMetrics.modelType}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Badge variant="violet" size="sm" dot>{modelMetrics.status}</Badge>
          {onAskFriday && (
            <button
              onClick={() =>
                onAskFriday(
                  `Evaluate current ML Model ${modelMetrics.version} accuracy, precision (${modelMetrics.precision}%), and recall (${modelMetrics.recall}%). Is model retraining needed?`
                )
              }
              className="analytics-ask-friday-btn"
              title="Ask FRIDAY about Model Performance"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Ask FRIDAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Confidence Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-2)',
        }}
      >
        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">Precision</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ color: 'var(--color-status-success)' }}>
              {modelMetrics.precision}%
            </span>
            <span className="analytics-stat-pill__delta" style={{ color: 'var(--color-status-success)' }}>
              ↑ 0.8%
            </span>
          </div>
        </div>

        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">Recall</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ color: 'var(--color-accent-light)' }}>
              {modelMetrics.recall}%
            </span>
            <span className="analytics-stat-pill__delta" style={{ color: 'var(--color-text-tertiary)' }}>
              High Sensitivity
            </span>
          </div>
        </div>

        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">False Positive Rate</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ color: 'var(--color-status-success)' }}>
              {modelMetrics.falsePositiveRate}%
            </span>
            <span className="analytics-stat-pill__delta" style={{ color: 'var(--color-status-success)' }}>
              Low Drift
            </span>
          </div>
        </div>

        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">F1-Score</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ color: '#a855f7' }}>
              {modelMetrics.f1Score}%
            </span>
            <span className="analytics-stat-pill__delta" style={{ color: 'var(--color-text-tertiary)' }}>
              Harmonic Mean
            </span>
          </div>
        </div>

        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">Last Retrained</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ fontSize: 'var(--text-xs)' }}>
              {modelMetrics.lastRetrained}
            </span>
          </div>
        </div>

        <div className="analytics-stat-pill">
          <span className="analytics-stat-pill__label">Dataset Vectors</span>
          <div className="analytics-stat-pill__val-row">
            <span className="analytics-stat-pill__val" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {modelMetrics.datasetVectors}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
