import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { BUSINESS_TYPES, COMMON_TIMEZONES, validateUrl, getDetectedTimezone } from '../onboardingConfig';

export function Step1BusinessDetails({
  formData,
  onChange,
  onNext,
  onCancel,
}) {
  const [touched, setTouched] = useState({
    businessName: false,
    websiteUrl: false,
  });

  // Ensure timezone has default if empty
  useEffect(() => {
    if (!formData.timezone) {
      onChange('timezone', getDetectedTimezone());
    }
  }, [formData.timezone, onChange]);

  const urlValidation = validateUrl(formData.websiteUrl);
  const isNameValid = Boolean(formData.businessName && formData.businessName.trim().length >= 2);
  const isTypeValid = Boolean(formData.businessType);
  const isUrlValid = Boolean(formData.websiteUrl && urlValidation.valid);
  const isFormValid = isNameValid && isTypeValid && isUrlValid;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const selectedTypeObj = BUSINESS_TYPES.find((t) => t.id === formData.businessType) || BUSINESS_TYPES[0];

  return (
    <div className="onboarding-step-content">
      <div className="onboarding-step-header">
        <Badge variant="violet" size="sm">Step 1 of 5</Badge>
        <h2 className="onboarding-step-title">Business Profile & Domain</h2>
        <p className="onboarding-step-subtitle">
          Configure the primary identity and web presence for this new business tenant.
          AI-CTO will calibrate incident monitoring and anomaly detection to your business model.
        </p>
      </div>

      <Card className="onboarding-card">
        <CardHeader
          title="Organization Details"
          subtitle="Essential identification parameters used across telemetry channels."
        />
        <CardBody>
          <div className="onboarding-form-grid">
            {/* Business Name */}
            <div className="onboarding-field">
              <label className="onboarding-field__label" htmlFor="ob-biz-name">
                Business / Brand Name <span className="onboarding-required">*</span>
              </label>
              <input
                id="ob-biz-name"
                type="text"
                className={`onboarding-input ${touched.businessName && !isNameValid ? 'onboarding-input--error' : ''}`}
                value={formData.businessName || ''}
                onChange={(e) => onChange('businessName', e.target.value)}
                onBlur={() => handleBlur('businessName')}
                placeholder="e.g. Acme Global Commerce, Apex SaaS"
                autoFocus
              />
              {touched.businessName && !isNameValid ? (
                <span className="onboarding-field__error">Please enter a valid business name (minimum 2 characters).</span>
              ) : (
                <span className="onboarding-field__hint">This name is displayed in the executive dashboard and reports.</span>
              )}
            </div>

            {/* Business Type */}
            <div className="onboarding-field">
              <label className="onboarding-field__label" htmlFor="ob-biz-type">
                Business Type / Model <span className="onboarding-required">*</span>
              </label>
              <select
                id="ob-biz-type"
                className="onboarding-select"
                value={formData.businessType || 'ecommerce'}
                onChange={(e) => onChange('businessType', e.target.value)}
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="onboarding-type-pill-info">
                <span className="onboarding-type-pill-info__tag">{selectedTypeObj.badge}</span>
                <span className="onboarding-type-pill-info__desc">{selectedTypeObj.description}</span>
              </div>
            </div>

            {/* Website URL */}
            <div className="onboarding-field">
              <label className="onboarding-field__label" htmlFor="ob-website-url">
                Website URL <span className="onboarding-required">*</span>
              </label>
              <div className="onboarding-input-with-icon">
                <span className="onboarding-input-prefix">https://</span>
                <input
                  id="ob-website-url"
                  type="text"
                  className={`onboarding-input onboarding-input--with-prefix ${touched.websiteUrl && !isUrlValid ? 'onboarding-input--error' : ''}`}
                  value={(formData.websiteUrl || '').replace(/^https?:\/\//i, '')}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    onChange('websiteUrl', val ? (val.startsWith('http') ? val : `https://${val}`) : '');
                  }}
                  onBlur={() => handleBlur('websiteUrl')}
                  placeholder="store.acme.com or app.platform.io"
                />
              </div>
              {touched.websiteUrl && !isUrlValid ? (
                <span className="onboarding-field__error">{urlValidation.message || 'Please enter a valid website URL.'}</span>
              ) : (
                <span className="onboarding-field__hint">The primary domain where the AI-CTO tracking snippet will be deployed.</span>
              )}
            </div>

            {/* Timezone */}
            <div className="onboarding-field">
              <div className="onboarding-field__label-row">
                <label className="onboarding-field__label" htmlFor="ob-timezone">
                  Primary Timezone
                </label>
                <button
                  type="button"
                  className="onboarding-field__text-btn"
                  onClick={() => onChange('timezone', getDetectedTimezone())}
                >
                  Use Browser Timezone
                </button>
              </div>
              <select
                id="ob-timezone"
                className="onboarding-select"
                value={formData.timezone || getDetectedTimezone()}
                onChange={(e) => onChange('timezone', e.target.value)}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <span className="onboarding-field__hint">Used for 24-hour charts, business hour anomaly baselines, and scheduled reports.</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation actions footer */}
      <div className="onboarding-actions-footer">
        <Button variant="ghost" onClick={onCancel}>
          Exit Setup
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!isFormValid}
          iconRight={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          }
        >
          Continue to Snippet Setup
        </Button>
      </div>
    </div>
  );
}
