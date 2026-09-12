import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { useToast } from '../../../shared/components/Toast';
import { useTenant } from '../../../shared/context/TenantContext';
import { userApi, getStoredUser } from '../../../shared/services/apiClient';

export function GeneralTab() {
  const { addToast } = useToast();
  const { selectedBusiness, updateSelectedBusiness, openOnboarding } = useTenant();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    const stored = getStoredUser() || {};
    return {
      fullName: stored.name || stored.full_name || '',
      email: stored.email || '',
      avatarUrl: stored.avatar_url || null,
      businessName: stored.business_name || selectedBusiness?.name || '',
      businessId: stored.business_id ? String(stored.business_id) : (selectedBusiness?.id || ''),
      businessType: stored.business_type || selectedBusiness?.type || 'ecommerce',
      timezone: stored.timezone || selectedBusiness?.timezone || 'America/New_York',
      autoRefreshInterval: stored.auto_refresh_interval || '30s',
      currency: stored.currency || 'USD',
      supportEmail: stored.ops_email || stored.email || '',
    };
  });

  const [savedData, setSavedData] = useState(formData);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Avatar upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch real current user & org profile from backend
  useEffect(() => {
    userApi.getMe().then((user) => {
      if (user && user.email) {
        const loaded = {
          fullName: user.name || user.full_name || '',
          email: user.email || '',
          avatarUrl: user.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : null,
          businessName: user.business_name || '',
          businessId: user.business_id ? String(user.business_id) : '',
          businessType: user.business_type || 'ecommerce',
          timezone: user.timezone || 'America/New_York',
          autoRefreshInterval: user.auto_refresh_interval || '30s',
          currency: user.currency || 'USD',
          supportEmail: user.ops_email || user.email || '',
        };
        setFormData(loaded);
        setSavedData(loaded);
      }
    }).catch(() => {});
  }, []);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyId = () => {
    if (!formData.businessId) return;
    navigator.clipboard.writeText(formData.businessId);
    setCopiedId(true);
    addToast('Business ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Avatar file selection & validation
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      addToast('Only JPEG, PNG, and WebP images are supported', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Avatar image file size must be less than 2MB', 'error');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // Avatar upload action
  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setUploadingAvatar(true);
    try {
      const res = await userApi.uploadAvatar(selectedFile);
      addToast(res.message || 'Avatar uploaded successfully', 'success');
      setSelectedFile(null);
      if (res.avatar_url) {
        const freshUrl = `${res.avatar_url}?t=${Date.now()}`;
        setFormData((prev) => ({ ...prev, avatarUrl: freshUrl }));
        setSavedData((prev) => ({ ...prev, avatarUrl: freshUrl }));
      }
    } catch (err) {
      addToast(err.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({
        name: formData.fullName,
        full_name: formData.fullName,
        business_name: formData.businessName,
        business_type: formData.businessType,
        ops_email: formData.supportEmail,
        timezone: formData.timezone,
        currency: formData.currency,
        auto_refresh_interval: formData.autoRefreshInterval,
      });

      if (updateSelectedBusiness) {
        updateSelectedBusiness({
          name: formData.businessName,
          type: formData.businessType,
          ops_email: formData.supportEmail,
        });
      }

      setSavedData(formData);
      addToast('General settings saved successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData(savedData);
    setSelectedFile(null);
    setAvatarPreview(null);
    addToast('Unsaved changes discarded', 'info');
  };

  const initials = (formData.fullName || formData.email || 'U')[0]?.toUpperCase() || 'U';

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <div>
          <h2 className="settings-tab-pane__title">General Settings</h2>
          <p className="settings-tab-pane__subtitle">
            Manage your user identity, organization profile, default timezone, and operational preferences.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => openOnboarding()}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Connect a New Business
        </Button>
      </div>

      <div className="settings-form-grid">
        {/* User Profile & Avatar */}
        <Card>
          <CardHeader
            title="Profile & Avatar"
            subtitle="Your personal avatar and display name across workspaces."
          />
          <CardBody>
            <div className="settings-fields-stack">
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
                <div
                  className="profile-avatar-container"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    flexShrink: 0,
                  }}
                  title="Click to choose avatar photo"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.fullName || 'Avatar'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setFormData((prev) => ({ ...prev, avatarUrl: null }))}
                    />
                  ) : (
                    initials
                  )}
                  <div
                    className="avatar-hover-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      gap: '2px',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span style={{ fontSize: '0.62rem', color: '#fff', fontWeight: 600 }}>CHANGE</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Photo
                    </Button>
                    {selectedFile && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUploadAvatar}
                        loading={uploadingAvatar}
                      >
                        Save Photo
                      </Button>
                    )}
                    {selectedFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setAvatarPreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  <span className="settings-field__hint">
                    Supported formats: JPEG, PNG, WebP. Maximum file size: 2MB. Saved securely in PostgreSQL.
                  </span>
                </div>
              </div>

              <div className="settings-field-row">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="user-full-name">
                    Full Name
                  </label>
                  <input
                    id="user-full-name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="e.g. Test User One"
                  />
                  <span className="settings-field__hint">
                    Your real name rendered in navigation and audit logs.
                  </span>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="user-account-email">
                    Account Email (Read-only)
                  </label>
                  <input
                    id="user-account-email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="settings-input--mono"
                  />
                  <span className="settings-field__hint">
                    Primary login identity tied to your tenant account.
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

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
                  placeholder="e.g. Acme Innovations"
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
                  Unique immutable tenant identifier used for API requests and telemetry ingestion.
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
                    placeholder="cto-ops@yourdomain.com"
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
