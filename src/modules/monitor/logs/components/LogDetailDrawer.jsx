import React, { useState } from 'react';
import { Button } from '../../../../shared/components/Button';
import { Badge } from '../../../../shared/components/Badge';

export function LogDetailDrawer({
  log,
  onClose,
  onAskFriday,
  isCorrelated = false,
}) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const lvl = (log.level || 'info').toLowerCase();
  const parsed = log.parsed_fields || {};
  const hasParsedFields = Object.keys(parsed).length > 0;

  const handleCopy = () => {
    const payload = JSON.stringify(
      {
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        source: log.source,
        content: log.content,
        parsed_fields: log.parsed_fields,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="log-drawer-backdrop" onClick={onClose}>
      <div className="log-drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="log-drawer-header">
          <div className="log-drawer-header__left">
            <Badge
              variant={
                lvl === 'error'
                  ? 'error'
                  : lvl === 'warn'
                  ? 'warning'
                  : lvl === 'info'
                  ? 'info'
                  : 'neutral'
              }
              size="md"
            >
              {lvl.toUpperCase()}
            </Badge>
            <span className="log-drawer-source">{log.source || 'application'}</span>
            <span className="log-drawer-type">({log.log_type || 'application'})</span>
          </div>

          <div className="log-drawer-header__right">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              icon={
                copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )
              }
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>

            <button
              type="button"
              className="log-drawer-close-btn"
              onClick={onClose}
              title="Close drawer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Correlated Root-Cause Callout */}
        {isCorrelated && (
          <div className="log-drawer-correlated-banner">
            <span className="log-drawer-correlated-icon">⚡</span>
            <div>
              <strong>Root-Cause Anomaly Correlation Evidence</strong>
              <p>This log entry was correlated in the active anomaly incident window and identified as a primary contributor.</p>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="log-drawer-body">
          {/* Metadata Grid */}
          <div className="log-drawer-section">
            <h4 className="log-drawer-section-title">Timestamp & Metadata</h4>
            <div className="log-meta-grid">
              <div className="log-meta-item">
                <span className="log-meta-label">Occurred At</span>
                <span className="log-meta-value">{log.timestamp}</span>
              </div>
              <div className="log-meta-item">
                <span className="log-meta-label">Ingested At</span>
                <span className="log-meta-value">{log.ingested_at || log.timestamp}</span>
              </div>
              <div className="log-meta-item">
                <span className="log-meta-label">Log ID</span>
                <span className="log-meta-value log-meta-value--mono">{log.id}</span>
              </div>
              <div className="log-meta-item">
                <span className="log-meta-label">Format</span>
                <span className="log-meta-value">{log.format || 'text'}</span>
              </div>
            </div>
          </div>

          {/* Raw Content Message */}
          <div className="log-drawer-section">
            <h4 className="log-drawer-section-title">Message Content</h4>
            <div className="log-content-block">
              <pre>{log.content}</pre>
            </div>
          </div>

          {/* Parsed Fields Table */}
          {hasParsedFields && (
            <div className="log-drawer-section">
              <h4 className="log-drawer-section-title">Parsed Structured Fields</h4>
              <div className="log-fields-table-wrapper">
                <table className="log-fields-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(parsed).map(([key, val]) => (
                      <tr key={key}>
                        <td className="log-field-key">{key}</td>
                        <td className="log-field-value">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="log-drawer-footer">
          <Button
            variant="primary"
            size="md"
            onClick={() => onAskFriday && onAskFriday(log)}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          >
            Consult FRIDAY AI About This Log →
          </Button>

          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
