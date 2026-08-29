import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';

export function UsageAlerts({
  initialThreshold = 80,
  initialChannels = ['email', 'slack'],
  initialEmail = 'cto-office@apexretail.io',
  onSaveAlertSettings,
}) {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [channels, setChannels] = useState(initialChannels);
  const [recipientEmail, setRecipientEmail] = useState(initialEmail);
  const [isSaving, setIsSaving] = useState(false);

  const availableChannels = [
    { id: 'email', label: 'Email Notification', icon: '✉' },
    { id: 'slack', label: 'Slack Webhook', icon: '#' },
    { id: 'inapp', label: 'In-app Toast & Banner', icon: '🔔' },
  ];

  const handleToggleChannel = (chId) => {
    setChannels((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    onSaveAlertSettings({
      threshold,
      channels,
      recipientEmail,
    });
    setIsSaving(false);
  };

  return (
    <Card padding="normal">
      <CardHeader
        title="Usage Alerts & Over-Capacity Notifications"
        subtitle="Trigger early warning notifications before hitting telemetry caps or incurring overage"
      />

      <CardBody>
        <form onSubmit={handleSave} className="usage-alerts-container">
          {/* Threshold Slider */}
          <div className="threshold-slider-group">
            <div className="threshold-slider-header">
              <label className="field-label" style={{ marginBottom: 0 }}>
                Notification Threshold Level:
              </label>
              <span className="threshold-value-badge">{threshold}% of quota</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="threshold-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              <span>50% (Early Warning)</span>
              <span>80% (Recommended)</span>
              <span>95% (Critical)</span>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="field-label">Alert Dispatch Channels</label>
            <div className="channels-checkbox-grid">
              {availableChannels.map((ch) => {
                const isActive = channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    className={`channel-chip-btn ${isActive ? 'channel-chip-btn--active' : ''}`}
                    onClick={() => handleToggleChannel(ch.id)}
                  >
                    <span>{ch.icon}</span>
                    <span>{ch.label}</span>
                    {isActive && <span style={{ marginLeft: 'auto', color: 'var(--color-accent)' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Email */}
          <div>
            <label className="field-label">Primary Alert Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. devops-leads@company.com"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSaving}
            >
              Save Alert Preferences
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
