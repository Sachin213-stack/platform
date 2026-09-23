import React, { useState } from 'react';
import { Button } from '../../../../shared/components/Button';

export function LogShippingModal({
  isOpen,
  onClose,
  onNavigateToSettings,
  apiKey = '',
  businessId = '',
}) {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const endpointUrl = `${window.location.origin}/api/logs`;
  const currentKey = apiKey || 'YOUR_API_KEY_HERE';

  const snippets = {
    curl: `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${currentKey}" \\
  -d '{
    "logs": [
      {
        "timestamp": "${new Date().toISOString()}",
        "level": "error",
        "source": "backend-service",
        "log_type": "application",
        "format": "json",
        "content": "[BACKEND] ERROR: Database connection timeout after 5000ms",
        "parsed_fields": {
          "status_code": 504,
          "service": "backend-service",
          "error": "TimeoutError",
          "business_id": "${businessId || 'your-business-id'}"
        }
      }
    ]
  }'`,

    python: `import logging
import requests
from datetime import datetime, timezone

AI_CTO_LOGS_URL = "${endpointUrl}"
AI_CTO_API_KEY = "${currentKey}"

def ship_log_entry(level: str, message: str, source: str = "backend-app", parsed: dict = None):
    payload = {
        "logs": [
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": level.lower(),
                "source": source,
                "log_type": "application",
                "format": "json",
                "content": message,
                "parsed_fields": parsed or {}
            }
        ]
    }
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": AI_CTO_API_KEY
    }
    requests.post(AI_CTO_LOGS_URL, json=payload, headers=headers, timeout=2.0)

# Example invocation:
ship_log_entry("error", "Payment processing failed: insufficient funds", source="billing-svc", parsed={"user_id": "usr_941"})`,

    fluentbit: `[SERVICE]
    Flush        1
    Daemon       Off
    Log_Level    info

[INPUT]
    Name         tail
    Path         /var/log/containers/*.log
    Parser       docker
    Tag          kube.*

[OUTPUT]
    Name         http
    Match        *
    Host         ${window.location.hostname}
    Port         ${window.location.port || '8000'}
    URI          /api/logs
    Header       X-API-Key ${currentKey}
    Format       json`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="log-modal-backdrop" onClick={onClose}>
      <div className="log-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="log-modal-header">
          <div className="log-modal-title-row">
            <span className="log-modal-icon">🔌</span>
            <div>
              <h3 className="log-modal-title">Connect Server-Side Log Shipper</h3>
              <p className="log-modal-desc">
                Stream real-time container, Kubernetes, and backend application logs directly into AI-CTO.
              </p>
            </div>
          </div>
          <button type="button" className="log-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="log-modal-body">
          {/* Important Distinction Banner */}
          <div className="log-distinction-banner">
            <span className="log-distinction-icon">ℹ️</span>
            <div>
              <strong>Server Logs vs. Browser Telemetry Snippet:</strong>
              <p>
                This log shipper setup captures <strong>server-side application and container logs</strong> (exceptions, microservice errors, container stdout). It is completely separate and optional from the JavaScript tracking snippet in Onboarding/Settings, which only records browser-side frontend telemetry.
              </p>
            </div>
          </div>

          {/* Connection Endpoint & API Key Requirements */}
          <div className="log-setup-cards-row">
            <div className="log-setup-card">
              <span className="log-setup-card__label">Ingestion Endpoint</span>
              <code className="log-setup-card__code">{endpointUrl}</code>
              <span className="log-setup-card__hint">HTTP POST endpoint accepting JSON batches</span>
            </div>

            <div className="log-setup-card">
              <span className="log-setup-card__label">Authentication</span>
              <div className="log-setup-card__auth-row">
                <code className="log-setup-card__code">X-API-Key: YOUR_KEY</code>
                {onNavigateToSettings && (
                  <button
                    type="button"
                    className="log-setup-card__link-btn"
                    onClick={() => {
                      onClose();
                      onNavigateToSettings();
                    }}
                  >
                    Get API Key in Settings →
                  </button>
                )}
              </div>
              <span className="log-setup-card__hint">RLS-scoped to your current business account</span>
            </div>
          </div>

          {/* Snippet Code Tabs */}
          <div className="log-code-tabs-header">
            <div className="log-code-tabs-buttons">
              <button
                type="button"
                className={`log-code-tab-btn ${activeTab === 'curl' ? 'log-code-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('curl')}
              >
                cURL / HTTP Request
              </button>
              <button
                type="button"
                className={`log-code-tab-btn ${activeTab === 'python' ? 'log-code-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('python')}
              >
                Python Handler
              </button>
              <button
                type="button"
                className={`log-code-tab-btn ${activeTab === 'fluentbit' ? 'log-code-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('fluentbit')}
              >
                FluentBit / Container Daemon
              </button>
            </div>

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
              {copied ? 'Copied to Clipboard!' : 'Copy Code Snippet'}
            </Button>
          </div>

          {/* Code Block */}
          <div className="log-modal-code-block">
            <pre>
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="log-modal-footer">
          <Button variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
