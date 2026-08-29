import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { ToggleRow } from '../../../shared/components/ToggleRow';
import { Modal } from '../../../shared/components/Modal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { Badge } from '../../../shared/components/Badge';
import { useToast } from '../../../shared/components/Toast';

const INITIAL_SHARING_CONFIG = [
  {
    id: 'shopify',
    title: 'Shopify Storefront Webhook Stream',
    desc: 'Share live checkout events, cart creation rates, and inventory latency with AI-CTO telemetry.',
    enabled: true,
  },
  {
    id: 'stripe',
    title: 'Stripe Billing & Subscription Sync',
    desc: 'Sync invoice states and usage meter tier thresholds with your payment provider.',
    enabled: true,
  },
  {
    id: 'datadog',
    title: 'Datadog APM Ingestion Pipe',
    desc: 'Export span metrics, memory traces, and container vitals to your external Datadog dashboard.',
    enabled: false,
  },
  {
    id: 'ga4',
    title: 'Google Analytics 4 Enhanced E-commerce',
    desc: 'Correlate latency spikes with visitor drop-off and session conversion drops.',
    enabled: true,
  },
  {
    id: 'sentry',
    title: 'Sentry Crash & JS Exception Sync',
    desc: 'Automatically stream frontend JavaScript stack traces to FRIDAY AI for root-cause diagnosis.',
    enabled: true,
  },
  {
    id: 'openai',
    title: 'FRIDAY AI Telemetry & LLM Tuning',
    desc: 'Allow anonymized operational metrics to improve automated incident recommendation models.',
    enabled: true,
  },
];

const AUDIT_LOGS = [
  {
    id: 'aud_1',
    user: 'Alex Mercer (Owner)',
    action: 'Updated Anomaly Sensitivity',
    details: 'Changed threshold baseline from 75% to 82%',
    timestamp: 'Today at 17:40',
    ip: '198.51.100.4',
  },
  {
    id: 'aud_2',
    user: 'Elena Rostova (Admin)',
    action: 'Added Alert Rule',
    details: 'Created rule "Storefront JS Error Rate >= 4.0%"',
    timestamp: 'Today at 14:15',
    ip: '203.0.113.19',
  },
  {
    id: 'aud_3',
    user: 'Alex Mercer (Owner)',
    action: 'Generated API Key',
    details: 'Created "Production Shopify Sync Worker" (Full Access)',
    timestamp: 'Aug 28, 2026',
    ip: '198.51.100.4',
  },
  {
    id: 'aud_4',
    user: 'David Chen (Analyst)',
    action: 'Toggled Data Sharing',
    details: 'Enabled Datadog APM Ingestion telemetry stream',
    timestamp: 'Aug 27, 2026',
    ip: '192.0.2.88',
  },
  {
    id: 'aud_5',
    user: 'Alex Mercer (Owner)',
    action: 'Updated Retention Policy',
    details: 'Configured metrics retention window to 90 Days',
    timestamp: 'Aug 25, 2026',
    ip: '198.51.100.4',
  },
  {
    id: 'aud_6',
    user: 'Alex Mercer (Owner)',
    action: 'Invited Team Member',
    details: 'Sent Analyst invitation to marcus.vance@contractor-ops.io',
    timestamp: 'Aug 24, 2026',
    ip: '198.51.100.4',
  },
  {
    id: 'aud_7',
    user: 'Elena Rostova (Admin)',
    action: 'Updated Timezone',
    details: 'Changed timezone preference to America/New_York',
    timestamp: 'Aug 20, 2026',
    ip: '203.0.113.19',
  },
];

export function DataPrivacyTab() {
  const { addToast } = useToast();

  const [retentionPeriod, setRetentionPeriod] = useState('90d');
  const [sharingConfig, setSharingConfig] = useState(INITIAL_SHARING_CONFIG);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullLogOpen, setIsFullLogOpen] = useState(false);

  // Delete Business Danger Zone
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const businessNameTarget = 'Acme Global Commerce';

  const handleRetentionChange = (val) => {
    setRetentionPeriod(val);
    addToast(`Data retention period set to ${val}`, 'info');
  };

  const handleToggleSharing = (id, newChecked) => {
    setSharingConfig((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: newChecked } : item))
    );
    addToast(`Integration data sharing ${newChecked ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleExportData = () => {
    setIsExporting(true);
    addToast('Preparing secure data archive download...', 'info');

    setTimeout(() => {
      // Create and trigger mock JSON download
      const exportPayload = {
        organization: 'Acme Global Commerce',
        exportedAt: new Date().toISOString(),
        retentionPolicy: retentionPeriod,
        data: {
          metricsCount: 142095,
          incidentsLogged: 34,
          auditEntries: AUDIT_LOGS,
        },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aicto-telemetry-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      addToast('Archive downloaded successfully (aicto-telemetry-export.json)', 'success');
    }, 1500);
  };

  const handleDeleteBusiness = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      addToast('Business workspace and data scheduled for deletion', 'error');
    }, 1000);
  };

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">Data, Privacy & Compliance</h2>
        <p className="settings-tab-pane__subtitle">
          Manage raw metrics retention limits, third-party connector pipelines, audit logs, and account deletion.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Retention & Export Card */}
        <Card>
          <CardHeader
            title="Telemetry Retention & Archive Export"
            subtitle="Configure historical time-series storage and generate downloadable compliance archives."
          />
          <CardBody>
            <div className="settings-fields-stack">
              <div className="settings-field-row">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="retention-period">
                    Raw Time-Series Retention Window
                  </label>
                  <select
                    id="retention-period"
                    value={retentionPeriod}
                    onChange={(e) => handleRetentionChange(e.target.value)}
                  >
                    <option value="30d">30 Days (Compliant with strict GDPR standards)</option>
                    <option value="90d">90 Days (Recommended for quarterly trend analysis)</option>
                    <option value="1y">1 Year (Enterprise Extended History)</option>
                    <option value="forever">Forever (Permanent Cold Archive)</option>
                  </select>
                  <span className="settings-field__hint">
                    Metrics older than the selected window are permanently aggregated into 1-hour summaries.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label">Export Organization Archive</label>
                  <div style={{ marginTop: '4px' }}>
                    <Button
                      variant="secondary"
                      onClick={handleExportData}
                      loading={isExporting}
                      icon={
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M4 14v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
                          <polyline points="7 10 10 13 13 10" />
                          <line x1="10" y1="3" x2="10" y2="13" />
                        </svg>
                      }
                    >
                      Export All Data (JSON)
                    </Button>
                  </div>
                  <span className="settings-field__hint">
                    Includes all telemetry logs, incident records, and alert audit entries.
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Third-Party Integrations & Data Sharing */}
        <Card>
          <CardHeader
            title="Third-Party Integrations & Telemetry Pipes"
            subtitle="Control which connected services can ingest or sync telemetry data streams."
          />
          <CardBody>
            <div className="settings-toggle-list">
              {sharingConfig.map((item) => (
                <ToggleRow
                  key={item.id}
                  id={`share-${item.id}`}
                  title={item.title}
                  description={item.desc}
                  checked={item.enabled}
                  onChange={(checked) => handleToggleSharing(item.id, checked)}
                />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Audit Log Preview */}
        <Card>
          <CardHeader
            title="Settings Audit Log"
            subtitle="Immutable change history recording configuration modifications and credentials access."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullLogOpen(true)}
              >
                View Full Log ({AUDIT_LOGS.length})
              </Button>
            }
          />
          <CardBody padding="none">
            <div className="settings-table-wrapper">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_LOGS.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="settings-table__main-text">{log.user}</span>
                      </td>
                      <td>
                        <Badge variant="violet" size="sm">
                          {log.action}
                        </Badge>
                      </td>
                      <td>
                        <span className="settings-table__meta-val">{log.details}</span>
                      </td>
                      <td>
                        <span className="settings-table__sub-text">{log.timestamp}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Danger Zone: Delete Business */}
        <Card variant="danger">
          <CardHeader
            title="Danger Zone"
            subtitle="Irreversible workspace actions that impact production telemetry and billing."
          />
          <CardBody>
            <div className="danger-zone-box">
              <div className="danger-zone-box__text">
                <h4 className="danger-zone-box__title">Delete Account & Business Workspace</h4>
                <p className="danger-zone-box__desc">
                  Once deleted, all telemetry history, connected Shopify webhooks, FRIDAY AI tuning data, and employee seats will be immediately wiped. This action cannot be reversed.
                </p>
              </div>
              <div className="danger-zone-box__action">
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete Business
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Full Audit Log Modal */}
      <Modal
        isOpen={isFullLogOpen}
        onClose={() => setIsFullLogOpen(false)}
        title="Complete Audit & Compliance Log"
        subtitle="All administrative actions recorded in the last 30 days."
        maxWidth="680px"
        footer={
          <Button variant="primary" onClick={() => setIsFullLogOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="settings-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Source</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="settings-table__main-text">{log.user}</span>
                  </td>
                  <td>
                    <Badge variant="violet" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td>
                    <span className="settings-table__meta-val">{log.details}</span>
                  </td>
                  <td>
                    <code className="settings-code-token" style={{ fontSize: '11px' }}>{log.ip}</code>
                  </td>
                  <td>
                    <span className="settings-table__sub-text">{log.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Two-step Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteBusiness}
        title="Delete Organization & Purge Data"
        message={`This action will permanently delete all telemetry history, revoke all API keys, terminate webhooks, and remove all team members from "${businessNameTarget}".`}
        confirmLabel="I understand the consequences, delete this business"
        variant="danger"
        requireText={businessNameTarget}
        requireTextLabel={
          <>
            To verify, type <strong style={{ color: 'var(--color-status-error)' }}>{businessNameTarget}</strong> below:
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}
