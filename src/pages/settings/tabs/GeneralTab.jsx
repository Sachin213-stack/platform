import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { useToast } from '../../../shared/components/Toast';

const INITIAL_GENERAL_STATE = {
  businessName: 'Acme Global Commerce',
  businessId: 'biz_live_948a291cf673e04',
  businessType: 'ecommerce',
  timezone: 'America/New_York',
  autoRefreshInterval: '30s',
  currency: 'USD',
  supportEmail: 'cto-ops@acmeglobal.com',
};

export function GeneralTab() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState(INITIAL_GENERAL_STATE);
  const [savedData, setSavedData] = useState(INITIAL_GENERAL_STATE);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(formData.businessId);
    setCopiedId(true);
    addToast('Business ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSavedData(formData);
      setSaving(false);
      addToast('General settings saved successfully', 'success');
    }, 600);
  };

  const handleDiscard = () => {
    setFormData(savedData);
    addToast('Unsaved changes discarded', 'info');
  };

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">General Settings</h2>
        <p className="settings-tab-pane__subtitle">
          Manage your organization profile, default timezone, live data refresh cadence, and base currency.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Business Identity */}
        <Card>
          <CardHeader
            title="Business Identity"
            subtitle="Your primary store identification and enterprise classification."
          />
          <CardBody>
            <div className="settings-fields-stack">
              <div className="settings-field">
                <label className="settings-field__label" htmlFor="business-name">
                  Business Name
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="e.g. Acme Global"
                />
                <span className="settings-field__hint">
                  The display name shown across all CTO intelligence dashboards and executive reports.
                </span>
              </div>

              <div className="settings-field">
                <label className="settings-field__label" htmlFor="business-id">
                  Business ID (Read-only)
                </label>
                <div className="settings-input-action-group">
                  <input
                    id="business-id"
                    type="text"
                    value={formData.businessId}
                    readOnly
                    className="settings-input--mono"
                  />
                  <Button variant="secondary" size="sm" onClick={handleCopyId}>
                    {copiedId ? 'Copied!' : 'Copy ID'}
                  </Button>
                </div>
                <span className="settings-field__hint">
                  Unique immutable tenant identifier used for API requests and webhook payloads.
                </span>
              </div>

              <div className="settings-field-row">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="business-type">
                    Business Type
                  </label>
                  <select
                    id="business-type"
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                  >
                    <option value="ecommerce">E-commerce / Direct-to-Consumer</option>
                    <option value="marketplace">Multi-vendor Marketplace</option>
                    <option value="saas">SaaS / Subscription Service</option>
                    <option value="enterprise">Enterprise Omni-Channel</option>
                    <option value="agency">Agency / Managed Merchant</option>
                  </select>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="support-email">
                    CTO Operations Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Regional & System Preferences */}
        <Card>
          <CardHeader
            title="System & Regional Defaults"
            subtitle="Configure timestamp formatting, dashboard auto-polling, and accounting currency."
          />
          <CardBody>
            <div className="settings-fields-stack">
              <div className="settings-field-row">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="timezone">
                    System Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time (US & Canada) — UTC-5</option>
                    <option value="America/Chicago">Central Time (US & Canada) — UTC-6</option>
                    <option value="America/Denver">Mountain Time (US & Canada) — UTC-7</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada) — UTC-8</option>
                    <option value="Europe/London">London, Edinburgh — UTC+0</option>
                    <option value="Europe/Berlin">Berlin, Paris, Amsterdam — UTC+1</option>
                    <option value="Asia/Tokyo">Tokyo, Osaka — UTC+9</option>
                    <option value="Asia/Kolkata">Mumbai, New Delhi — UTC+5:30</option>
                    <option value="Australia/Sydney">Sydney, Melbourne — UTC+11</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="currency">
                    Platform Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                  >
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="CAD">CAD — Canadian Dollar ($)</option>
                    <option value="AUD">AUD — Australian Dollar ($)</option>
                    <option value="JPY">JPY — Japanese Yen (¥)</option>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                  </select>
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-field__label" htmlFor="refresh-interval">
                  Dashboard Auto-Refresh Interval
                </label>
                <select
                  id="refresh-interval"
                  value={formData.autoRefreshInterval}
                  onChange={(e) => handleChange('autoRefreshInterval', e.target.value)}
                >
                  <option value="10s">Real-time Stream (Every 10 seconds - High telemetry rate)</option>
                  <option value="30s">30 seconds (Recommended for live operations)</option>
                  <option value="1m">1 minute (Balanced bandwidth)</option>
                  <option value="5m">5 minutes (Low network usage)</option>
                  <option value="manual">Manual Refresh Only</option>
                </select>
                <span className="settings-field__hint">
                  Controls how frequently vitals, throughput meters, and FRIDAY anomaly detectors poll the backend.
                </span>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button
              variant="ghost"
              onClick={handleDiscard}
              disabled={!isDirty || saving}
            >
              Discard Changes
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isDirty}
              loading={saving}
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
