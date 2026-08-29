import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function ActiveAnomalies({
  anomalies = [],
  telemetryEvents = [],
  decisionLogs = [],
  onApplyRecommendation,
  onOpenFridayWithContext,
  onNavigateToAuditLog,
}) {
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [decisionLogsOpen, setDecisionLogsOpen] = useState(false);
  const [expandedAnomalyId, setExpandedAnomalyId] = useState(anomalies[0]?.id || null);

  const hasAnomalies = anomalies.length > 0;
  const criticalCount = anomalies.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;

  return (
    <div className="anomalies-section">
      {/* ── Status Banner ── */}
      <div className={`anomalies-status-banner anomalies-status-banner--${hasAnomalies ? (criticalCount > 0 ? 'critical' : 'warning') : 'healthy'}`}>
        <div className="anomalies-status-banner__left">
          <span className="anomalies-status-banner__icon">
            {hasAnomalies ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </span>
          <div className="anomalies-status-banner__info">
            <h3 className="anomalies-status-banner__title">
              {hasAnomalies ? `${anomalies.length} Active Anomalies Detected` : 'No Anomalies Detected'}
            </h3>
            <p className="anomalies-status-banner__desc">
              {hasAnomalies
                ? `${criticalCount} high priority incidents require automated or manual remediation.`
                : 'All microservice health probes and SLA latency envelopes are nominal.'}
            </p>
          </div>
        </div>

        {hasAnomalies && (
          <Badge variant={criticalCount > 0 ? 'error' : 'warning'} size="md">
            {criticalCount} Critical Action Required
          </Badge>
        )}
      </div>

      {/* ── Active Anomalies List with AI Recommendations ── */}
      {hasAnomalies && (
        <div className="anomalies-list">
          {anomalies.map((ano) => {
            const isExpanded = expandedAnomalyId === ano.id;
            const severityVariant =
              ano.severity === 'Critical'
                ? 'error'
                : ano.severity === 'High'
                ? 'error'
                : ano.severity === 'Medium'
                ? 'warning'
                : 'neutral';

            return (
              <Card
                key={ano.id}
                className={`anomaly-card anomaly-card--${ano.severity.toLowerCase()} ${isExpanded ? 'anomaly-card--expanded' : ''}`}
                padding="compact"
              >
                {/* Header Row */}
                <div
                  className="anomaly-card__header"
                  onClick={() => setExpandedAnomalyId(isExpanded ? null : ano.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="anomaly-card__header-left">
                    <Badge variant={severityVariant} size="sm">
                      {ano.severity}
                    </Badge>
                    <span className="anomaly-card__service">{ano.service}</span>
                    <span className="anomaly-card__title">{ano.title}</span>
                  </div>

                  <div className="anomaly-card__header-right">
                    <span className="anomaly-card__deviation">{ano.deviation}</span>
                    <span className="anomaly-card__timestamp">{ano.timestamp}</span>
                    <svg
                      className={`anomaly-card__chevron ${isExpanded ? 'anomaly-card__chevron--rotated' : ''}`}
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

                {/* Expanded Details & AI Recommendation Box */}
                {isExpanded && (
                  <div className="anomaly-card__expanded-content">
                    <div className="anomaly-card__impact-box">
                      <span className="anomaly-card__impact-label">Telemetry Impact:</span>
                      <span className="anomaly-card__impact-text">{ano.impact}</span>
                    </div>

                    {/* AI Recommendation Box */}
                    <div className="anomaly-ai-recommendation">
                      <div className="anomaly-ai-recommendation__header">
                        <div className="anomaly-ai-recommendation__badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>FRIDAY AI Prescriptive Recommendation</span>
                        </div>
                        <span className="anomaly-ai-recommendation__confidence">Confidence: 98.6%</span>
                      </div>

                      <p className="anomaly-ai-recommendation__text">{ano.aiRecommendation}</p>

                      <div className="anomaly-ai-recommendation__actions">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApplyRecommendation && onApplyRecommendation(ano)}
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          }
                        >
                          {ano.recommendedAction || 'Execute Mitigation'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenFridayWithContext && onOpenFridayWithContext(ano)}
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          }
                        >
                          Consult FRIDAY AI →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Collapsible Telemetry Events & Decision Logs Drawer ── */}
      <div className="anomalies-secondary-drawers">
        {/* Recent Telemetry Events (Collapsible) */}
        <div className="collapsible-drawer">
          <button
            type="button"
            className="collapsible-drawer__trigger"
            onClick={() => setTelemetryOpen(!telemetryOpen)}
            aria-expanded={telemetryOpen}
          >
            <div className="collapsible-drawer__title-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span className="collapsible-drawer__title">Recent Telemetry Probe Events ({telemetryEvents.length})</span>
            </div>
            <svg
              className={`collapsible-drawer__chevron ${telemetryOpen ? 'collapsible-drawer__chevron--open' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {telemetryOpen && (
            <div className="collapsible-drawer__body">
              <div className="telemetry-events-list">
                {telemetryEvents.map((evt) => (
                  <div key={evt.id} className="telemetry-event-row">
                    <span className="telemetry-event-row__time">{evt.time}</span>
                    <Badge variant={evt.level === 'warning' ? 'warning' : 'neutral'} size="sm">
                      {evt.type}
                    </Badge>
                    <span className="telemetry-event-row__msg">{evt.message}</span>
                    <span className="telemetry-event-row__latency">{evt.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Historical Decision Logs (Collapsible with View Full Log Link) */}
        <div className="collapsible-drawer">
          <button
            type="button"
            className="collapsible-drawer__trigger"
            onClick={() => setDecisionLogsOpen(!decisionLogsOpen)}
            aria-expanded={decisionLogsOpen}
          >
            <div className="collapsible-drawer__title-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="collapsible-drawer__title">Autonomous Decision & Action Log ({decisionLogs.length})</span>
            </div>
            <svg
              className={`collapsible-drawer__chevron ${decisionLogsOpen ? 'collapsible-drawer__chevron--open' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {decisionLogsOpen && (
            <div className="collapsible-drawer__body">
              <div className="decision-logs-list">
                {decisionLogs.map((log) => (
                  <div key={log.id} className="decision-log-row">
                    <div className="decision-log-row__top">
                      <span className="decision-log-row__actor">{log.actor}</span>
                      <span className="decision-log-row__time">{log.timestamp}</span>
                      <Badge variant="violet" size="sm">{log.status}</Badge>
                    </div>
                    <div className="decision-log-row__action">{log.action}</div>
                    <div className="decision-log-row__impact">{log.impact}</div>
                  </div>
                ))}
              </div>

              <div className="collapsible-drawer__footer">
                <button
                  type="button"
                  className="collapsible-drawer__full-link"
                  onClick={() => onNavigateToAuditLog && onNavigateToAuditLog()}
                >
                  <span>View Full Audit Log Screen →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
