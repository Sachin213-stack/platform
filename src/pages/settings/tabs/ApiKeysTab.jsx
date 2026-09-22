import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useToast } from '../../../shared/components/Toast';

const INITIAL_KEYS = [];

export function ApiKeysTab() {
  const { addToast } = useToast();

  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [webhookSecret, setWebhookSecret] = useState('whsec_live_9f83a812e9b042cda88319f39002a71e');
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('full_access');
  const [createdKeyData, setCreatedKeyData] = useState(null); // { name, fullKey, scope }

  const [keyToRevoke, setKeyToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [isRegeneratingWebhook, setIsRegeneratingWebhook] = useState(false);
  const [showWebhookConfirm, setShowWebhookConfirm] = useState(false);

  const handleOpenGenerate = () => {
    setNewKeyName('');
    setNewKeyScope('full_access');
    setCreatedKeyData(null);
    setIsGenerateOpen(true);
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      addToast('Please provide a key description/name', 'warning');
      return;
    }

    const randomHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const fullKey = `sk_live_${randomHex}`;
    const last4 = fullKey.slice(-4);

    const newEntry = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: 'sk_live_',
      last4,
      scope: newKeyScope,
      rateLimit: newKeyScope === 'full_access' ? '1,000 req/min' : '500 req/min',
      createdAt: 'Just now',
      lastUsed: 'Never',
    };

    setKeys((prev) => [newEntry, ...prev]);
    setCreatedKeyData({
      name: newKeyName.trim(),
      fullKey,
      scope: newKeyScope,
    });
    addToast(`API Key "${newKeyName}" generated successfully`, 'success');
  };

  const handleCopy = (text, label = 'Key') => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard`, 'info');
  };

  const handleRevokeConfirm = () => {
    if (!keyToRevoke) return;
    setIsRevoking(true);
    setTimeout(() => {
      setKeys((prev) => prev.filter((k) => k.id !== keyToRevoke.id));
      setIsRevoking(false);
      addToast(`API key "${keyToRevoke.name}" has been revoked`, 'info');
      setKeyToRevoke(null);
    }, 400);
  };

  const handleRegenerateWebhook = () => {
    setIsRegeneratingWebhook(true);
    setTimeout(() => {
      const newSecret = `whsec_live_${Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      setWebhookSecret(newSecret);
      setIsRegeneratingWebhook(false);
      setShowWebhookConfirm(false);
      setShowWebhookSecret(true);
      addToast('Shopify webhook secret regenerated', 'success');
    }, 500);
  };

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">API Keys & Webhooks</h2>
        <p className="settings-tab-pane__subtitle">
          Manage machine-to-machine credentials, telemetry pipeline keys, rate limits, and webhook signing secrets.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Active API Keys Table */}
        <Card>
          <CardHeader
            title="Active API Keys"
            subtitle="Bearer tokens used for querying telemetry, triggering automated playbooks, and external monitoring."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenGenerate}
                icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="3" x2="8" y2="13" />
                    <line x1="3" y1="8" x2="13" y2="8" />
                  </svg>
                }
              >
                Generate New Key
              </Button>
            }
          />
          <CardBody padding="none">
            {keys.length === 0 ? (
              <div style={{ padding: 'var(--space-6)' }}>
                <EmptyState
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                  title="No API Keys Generated Yet"
                  description="Generate an API key to allow external scripts, agents, or CI pipelines to connect with AI-CTO."
                  actionLabel="Generate First Key"
                  onAction={handleOpenGenerate}
                />
              </div>
            ) : (
              <div className="settings-table-wrapper">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>Key Name</th>
                      <th>Token Preview</th>
                      <th>Scope</th>
                      <th>Rate Limit</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id}>
                        <td>
                          <div className="settings-table__main-text">{k.name}</div>
                          <div className="settings-table__sub-text">Created {k.createdAt}</div>
                        </td>
                        <td>
                          <code className="settings-code-token">
                            {k.prefix}••••••••••••{k.last4}
                          </code>
                        </td>
                        <td>
                          <Badge
                            variant={k.scope === 'full_access' ? 'violet' : 'neutral'}
                            size="sm"
                          >
                            {k.scope === 'full_access' ? 'Full Access' : 'Read-only'}
                          </Badge>
                        </td>
                        <td>
                          <span className="settings-table__meta-val">{k.rateLimit}</span>
                        </td>
                        <td>
                          <span className="settings-table__sub-text">{k.lastUsed}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setKeyToRevoke(k)}
                            style={{ color: 'var(--color-status-error)' }}
                          >
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Webhook Secret Card */}
        <Card>
          <CardHeader
            title="Shopify Webhook Secret"
            subtitle="HMAC signing secret used to verify incoming events from Shopify and Stripe webhooks."
          />
          <CardBody>
            <div className="settings-fields-stack">
              <div className="settings-field">
                <label className="settings-field__label">HMAC Signing Secret</label>
                <div className="settings-input-action-group">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={webhookSecret}
                    readOnly
                    className="settings-input--mono"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? 'Hide' : 'Reveal'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(webhookSecret, 'Webhook Secret')}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWebhookConfirm(true)}
                    style={{ color: 'var(--color-status-warning)' }}
                  >
                    Regenerate
                  </Button>
                </div>
                <span className="settings-field__hint">
                  Do not share this secret in public repos. If regenerated, all active Shopify webhooks must be updated.
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Generate Key Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title={createdKeyData ? 'New API Key Created' : 'Generate New API Key'}
        subtitle={
          createdKeyData
            ? 'Copy your secret token now. For security reasons, you will never be shown this again.'
            : 'Create an authentication key for backend scripts or FRIDAY CLI sidecars.'
        }
        footer={
          createdKeyData ? (
            <Button variant="primary" onClick={() => setIsGenerateOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsGenerateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleGenerateKey}>
                Generate Key
              </Button>
            </>
          )
        }
      >
        {createdKeyData ? (
          <div className="settings-created-key-view">
            <div className="settings-alert-banner settings-alert-banner--warning">
              <span className="settings-alert-banner__icon">⚠️</span>
              <div>
                <strong>Important:</strong> Store this key securely in your secrets manager. Once this dialog closes, it cannot be recovered.
              </div>
            </div>

            <div className="settings-field" style={{ marginTop: 'var(--space-4)' }}>
              <label className="settings-field__label">Secret Token for "{createdKeyData.name}"</label>
              <div className="settings-input-action-group">
                <input
                  type="text"
                  value={createdKeyData.fullKey}
                  readOnly
                  className="settings-input--mono settings-input--highlight"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCopy(createdKeyData.fullKey, 'API Key')}
                >
                  Copy Key
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="settings-fields-stack">
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="key-name">
                Key Description / Identifier <span style={{ color: 'var(--color-status-error)' }}>*</span>
              </label>
              <input
                id="key-name"
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Lambda Anomaly Consumer"
                autoFocus
              />
              <span className="settings-field__hint">
                A human-readable label to identify where this key is deployed.
              </span>
            </div>

            <div className="settings-field">
              <label className="settings-field__label" htmlFor="key-scope">
                Scope / Permissions
              </label>
              <select
                id="key-scope"
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value)}
              >
                <option value="full_access">Full Access (Read telemetry + Trigger AI Playbooks)</option>
                <option value="read_only">Read-only (Query Vitals & Dashboards only)</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      {/* Revoke Confirm Dialog */}
      <ConfirmModal
        isOpen={Boolean(keyToRevoke)}
        onClose={() => setKeyToRevoke(null)}
        onConfirm={handleRevokeConfirm}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${keyToRevoke?.name}"? Any automated pipeline or script using this key will immediately be denied access.`}
        confirmLabel="Revoke Key"
        variant="danger"
        loading={isRevoking}
      />

      {/* Regenerate Webhook Confirm Dialog */}
      <ConfirmModal
        isOpen={showWebhookConfirm}
        onClose={() => setShowWebhookConfirm(false)}
        onConfirm={handleRegenerateWebhook}
        title="Regenerate Webhook Signing Secret"
        message="Regenerating the HMAC secret will invalidate the current signature. Incoming Shopify webhook events will fail validation until you update your Shopify admin with the new secret."
        confirmLabel="Regenerate Secret"
        variant="warning"
        loading={isRegeneratingWebhook}
      />
    </div>
  );
}
