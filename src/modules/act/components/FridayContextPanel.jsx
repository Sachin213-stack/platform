import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { useAnalytics } from '../../../shared/context/AnalyticsContext';

export function FridayContextPanel({
  initialContext,
  commandHistory,
  onClearHistory,
  onReRunCommand,
  micState,
}) {
  const [activeTab, setActiveTab] = useState('context'); // 'context' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const { sensitivity, liveCrashRisk, liveHeadroom, activeAnomaliesCount, anomalies } = useAnalytics();

  const filteredHistory = commandHistory.filter((item) =>
    item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.responseSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contextService =
    initialContext?.context?.anomaly?.service ||
    initialContext?.context?.service ||
    (activeAnomaliesCount > 0 ? anomalies[0]?.service : 'checkout-v2');

  const contextIncident =
    initialContext?.initialPrompt ||
    (activeAnomaliesCount > 0
      ? `Active Incident: ${anomalies[0]?.title} (${anomalies[0]?.deviation})`
      : 'All microservice health probes and latency bounds are nominal.');

  return (
    <div className="friday-context-panel">
      {/* Panel Switcher Tabs */}
      <div className="friday-panel-tabs">
        <button
          className={`friday-panel-tab ${activeTab === 'context' ? 'friday-panel-tab--active' : ''}`}
          onClick={() => setActiveTab('context')}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="14" height="14" rx="2" />
            <path d="M7 7h6M7 11h6M7 15h4" />
          </svg>
          <span>Telemetry & Context</span>
        </button>

        <button
          className={`friday-panel-tab ${activeTab === 'history' ? 'friday-panel-tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="10" cy="10" r="7" />
            <polyline points="10,6 10,10 13,12" />
          </svg>
          <span>Command History ({commandHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Context & Live Notes */}
      {activeTab === 'context' && (
        <Card padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              Incident Scope & Studio Sync
            </span>
            <Badge variant="violet" size="sm" dot>Sensitivity: {sensitivity}%</Badge>
          </div>

          <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Target Service:</span>
              {activeAnomaliesCount > 0 && (
                <Badge variant="error" size="sm">
                  {activeAnomaliesCount} Active Anomaly
                </Badge>
              )}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-accent-light)', marginTop: '2px' }}>
              {contextService}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.35' }}>
              {contextIncident}
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="friday-metrics-grid">
            <div className="friday-metric-box">
              <span className="friday-metric-box__label">Crash Risk</span>
              <span className="friday-metric-box__val" style={{ color: liveCrashRisk < 15 ? 'var(--color-status-success)' : 'var(--color-status-warning)' }}>
                {liveCrashRisk}%
              </span>
            </div>
            <div className="friday-metric-box">
              <span className="friday-metric-box__label">Headroom</span>
              <span className="friday-metric-box__val">{liveHeadroom}%</span>
            </div>
            <div className="friday-metric-box">
              <span className="friday-metric-box__label">Sensitivity</span>
              <span className="friday-metric-box__val" style={{ color: 'var(--color-accent-light)' }}>{sensitivity}%</span>
            </div>
            <div className="friday-metric-box">
              <span className="friday-metric-box__label">Inference Lag</span>
              <span className="friday-metric-box__val">12ms</span>
            </div>
          </div>

          {/* Live Notes Area */}
          <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                Live Notes & Telemetry
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Auto-Ingest</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.45', background: 'var(--color-bg-tertiary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
              • High checkout concurrency flagged at 18:21 UTC.<br />
              • Autonomous remediation policy is ready to trigger.<br />
              • Zero error threshold breached on edge Envoy gateways.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 2: Command History */}
      {activeTab === 'history' && (
        <Card padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              Voice & Text Directives
            </span>
            {commandHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <input
              type="text"
              placeholder="Search past directives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '11px',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* History List */}
          <div className="friday-history-list">
            {filteredHistory.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                No past directives found.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="friday-history-item"
                  onClick={() => micState === 'idle' && onReRunCommand && onReRunCommand(item.command)}
                  title="Click to re-run directive"
                >
                  <div className="friday-history-item__header">
                    <span>{item.time}</span>
                    <Badge variant="success" size="sm">Completed</Badge>
                  </div>
                  <div className="friday-history-item__text">
                    "{item.command}"
                  </div>
                  <div className="friday-history-item__summary">
                    {item.responseSummary}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
