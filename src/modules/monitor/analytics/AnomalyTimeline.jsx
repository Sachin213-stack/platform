import React, { useState, useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';

export function AnomalyTimeline({
  anomalies = [],
  selectedAnomalyId,
  onSelectAnomaly,
  onApplyRecommendation,
  onAskFriday,
  onViewLogs,
}) {
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Active' | 'Resolved' | 'Critical'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(selectedAnomalyId || anomalies[0]?.id || null);

  // Filtered anomalies
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      // Tab filter
      if (filterTab === 'Active' && a.status !== 'Active') return false;
      if (filterTab === 'Resolved' && a.status !== 'Resolved') return false;
      if (filterTab === 'Critical' && a.severity !== 'Critical') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchService = a.service?.toLowerCase().includes(q);
        const matchMetric = a.metric?.toLowerCase().includes(q);
        return matchTitle || matchService || matchMetric;
      }
      return true;
    });
  }, [anomalies, filterTab, searchQuery]);

  const activeCount = anomalies.filter((a) => a.status === 'Active').length;
  const criticalCount = anomalies.filter((a) => a.severity === 'Critical').length;
  const resolvedCount = anomalies.filter((a) => a.status === 'Resolved').length;

  const handleRowClick = (anomaly) => {
    const nextExpanded = expandedId === anomaly.id ? null : anomaly.id;
    setExpandedId(nextExpanded);
    if (onSelectAnomaly) {
      onSelectAnomaly(anomaly.id);
    }
  };

  return (
    <Card padding="normal" className="analytics-timeline-card">
      {/* Header with Title & Filter Tabs */}
      <div className="analytics-timeline-header">
        <div className="analytics-timeline-header__left">
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', margin: 0 }}>
              Anomaly Detection Timeline & Audit Log
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Chronological audit of deviations flagged by Predictive ML Model v3.2
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="analytics-timeline-controls">
          <div className="chart-pill-selector" role="tablist">
            <button
              className={`chart-pill-btn ${filterTab === 'All' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setFilterTab('All')}
            >
              All ({anomalies.length})
            </button>
            <button
              className={`chart-pill-btn ${filterTab === 'Active' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setFilterTab('Active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`chart-pill-btn ${filterTab === 'Critical' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setFilterTab('Critical')}
            >
              Critical ({criticalCount})
            </button>
            <button
              className={`chart-pill-btn ${filterTab === 'Resolved' ? 'chart-pill-btn--active' : ''}`}
              onClick={() => setFilterTab('Resolved')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="analytics-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Anomaly Entries Feed */}
      <div className="analytics-timeline-feed" style={{ marginTop: 'var(--space-4)' }}>
        {filteredAnomalies.length === 0 ? (
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            }
            title="No anomalies detected in this period"
            description="All monitored metrics and latency bounds for the selected filter are nominal."
            actionLabel={filterTab !== 'All' ? 'View All Anomalies' : undefined}
            onAction={() => {
              setFilterTab('All');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredAnomalies.map((ano) => {
            const isExpanded = expandedId === ano.id;
            const isSelected = selectedAnomalyId === ano.id;
            const severityVariant =
              ano.severity === 'Critical'
                ? 'error'
                : ano.severity === 'High'
                ? 'error'
                : ano.severity === 'Medium'
                ? 'warning'
                : 'info';

            return (
              <div
                key={ano.id}
                className={`analytics-anomaly-item ${isExpanded ? 'analytics-anomaly-item--expanded' : ''} ${
                  isSelected ? 'analytics-anomaly-item--selected' : ''
                }`}
              >
                {/* Main Row */}
                <div
                  className="analytics-anomaly-item__header"
                  onClick={() => handleRowClick(ano)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="analytics-anomaly-item__left">
                    <span className="analytics-anomaly-item__time">{ano.timestamp}</span>
                    <Badge variant={severityVariant} size="sm">
                      {ano.severity}
                    </Badge>
                    <Badge variant={ano.status === 'Active' ? 'error' : 'success'} size="sm" dot>
                      {ano.status}
                    </Badge>
                    <span className="analytics-anomaly-item__service">{ano.service}</span>
                    <span className="analytics-anomaly-item__title">{ano.title}</span>
                  </div>

                  <div className="analytics-anomaly-item__right">
                    <span className="analytics-anomaly-item__deviation">{ano.deviation}</span>
                    <svg
                      className={`analytics-anomaly-chevron ${isExpanded ? 'analytics-anomaly-chevron--open' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="analytics-anomaly-item__expanded">
                    <div className="analytics-anomaly-expanded-grid">
                      <div>
                        <div className="analytics-exp-label">Metric Affected</div>
                        <div className="analytics-exp-val">{ano.metric}</div>
                      </div>
                      <div>
                        <div className="analytics-exp-label">Observed vs Baseline</div>
                        <div className="analytics-exp-val">
                          <span style={{ color: 'var(--color-status-error)', fontWeight: 'bold' }}>
                            {ano.observedValue}
                          </span>{' '}
                          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                            (Baseline: {ano.baselineValue})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="analytics-exp-label">Business Telemetry Impact</div>
                        <div className="analytics-exp-val">{ano.impact}</div>
                      </div>
                    </div>

                    {/* AI Recommendation & Action Buttons */}
                    <div className="analytics-anomaly-rec-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-accent-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          FRIDAY AI Recommendation
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-3) 0', lineHeight: '1.45' }}>
                        {ano.aiRecommendation}
                      </p>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                        {ano.status === 'Active' && onApplyRecommendation && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyRecommendation(ano);
                            }}
                            icon={
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            }
                          >
                            {ano.recommendedAction || 'Apply Mitigation'}
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectAnomaly) onSelectAnomaly(ano.id);
                          }}
                          icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          }
                        >
                          Inspect Root Cause Breakdown
                        </Button>

                        {onAskFriday && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAskFriday(
                                `Analyze anomaly "${ano.title}" (${ano.service}). Deviation: ${ano.deviation}. What is the exact root cause and suggested mitigation?`,
                                ano
                              );
                            }}
                            className="analytics-ask-friday-btn"
                            title="Ask FRIDAY about this anomaly"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Ask FRIDAY</span>
                          </button>
                        )}

                        {onViewLogs && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewLogs(ano);
                            }}
                            className="analytics-view-logs-btn"
                            title="View correlated logs for this anomaly"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2" />
                              <polyline points="6 9 10 13 14 9" />
                            </svg>
                            <span>View Logs</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
