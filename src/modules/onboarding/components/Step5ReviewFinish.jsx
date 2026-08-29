import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { BUSINESS_TYPES, KPI_CATALOG, INTEGRATIONS_LIST } from '../onboardingConfig';

export function Step5ReviewFinish({
  formData,
  onFinish,
  onBack,
  onCancel,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypeObj =
    BUSINESS_TYPES.find((t) => t.id === formData.businessType) || BUSINESS_TYPES[0];

  const selectedKpis = formData.selectedKpis || businessTypeObj.defaultKpis;
  const connectedIntegrations = formData.connectedIntegrations || [];
  const isVerified = formData.verificationStatus === 'success';

  const handleLaunch = () => {
    setIsSubmitting(true);
    // Simulate brief tenant initialization handshake
    setTimeout(() => {
      onFinish();
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="onboarding-step-content">
      <div className="onboarding-step-header">
        <Badge variant="violet" size="sm">Step 5 of 5</Badge>
        <h2 className="onboarding-step-title">Review & Launch Business Tenant</h2>
        <p className="onboarding-step-subtitle">
          Confirm your configuration details. Once launched, AI-CTO will initialize the dedicated telemetry
          pipeline, anomaly baselines, and FRIDAY AI assistant context for this business.
        </p>
      </div>

      {/* ── Summary Overview Grid ── */}
      <div className="onboarding-review-grid">
        {/* Organization & Domain Card */}
        <Card className="onboarding-card">
          <CardHeader
            title="Business Identity"
            subtitle="Tenant registration metadata"
          />
          <CardBody>
            <div className="onboarding-review-list">
              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Business Name</span>
                <span className="onboarding-review-item__val font-semibold">
                  {formData.businessName || 'Unnamed Business'}
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Business Model</span>
                <span className="onboarding-review-item__val">
                  <Badge variant="violet" size="sm">{businessTypeObj.label}</Badge>
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Target Domain</span>
                <span className="onboarding-review-item__val onboarding-review-item__val--mono">
                  {formData.websiteUrl || 'https://example.com'}
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Business ID</span>
                <span className="onboarding-review-item__val onboarding-review-item__val--mono">
                  {formData.businessId || 'biz_live_...'}
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Timezone</span>
                <span className="onboarding-review-item__val">
                  {formData.timezone || 'UTC'}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tracking Snippet & Telemetry Status Card */}
        <Card className="onboarding-card">
          <CardHeader
            title="Telemetry Connection"
            subtitle="JS Snippet verification status"
          />
          <CardBody>
            <div className="onboarding-review-list">
              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Snippet Installation</span>
                <span className="onboarding-review-item__val">
                  {isVerified ? (
                    <Badge variant="success" size="sm">✓ Verified & Live</Badge>
                  ) : formData.verificationStatus === 'skipped' ? (
                    <Badge variant="warning" size="sm">Skipped (Manual Install Pending)</Badge>
                  ) : (
                    <Badge variant="subtle" size="sm">Not Yet Verified</Badge>
                  )}
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Cluster Region</span>
                <span className="onboarding-review-item__val">
                  us-east-1 (N. Virginia Edge Shield)
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Active KPI Monitors</span>
                <span className="onboarding-review-item__val">
                  <Badge variant="info" size="sm">{selectedKpis.length} Selected</Badge>
                </span>
              </div>

              <div className="onboarding-review-item">
                <span className="onboarding-review-item__label">Integrations</span>
                <span className="onboarding-review-item__val">
                  {connectedIntegrations.length > 0 ? (
                    <Badge variant="success" size="sm">{connectedIntegrations.length} Active</Badge>
                  ) : (
                    <span className="text-secondary text-sm">None configured</span>
                  )}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Active KPIs Summary Badges ── */}
      <Card className="onboarding-card">
        <CardHeader
          title="Monitored KPI Thresholds"
          subtitle="Real-time telemetry indicators primed for your dashboard"
        />
        <CardBody>
          <div className="onboarding-review-kpi-chips">
            {selectedKpis.map((kpiId) => {
              const kpi = KPI_CATALOG[kpiId];
              return (
                <div key={kpiId} className="onboarding-kpi-chip">
                  <span className="onboarding-kpi-chip__dot" />
                  <span className="onboarding-kpi-chip__title">{kpi ? kpi.name : kpiId}</span>
                  {kpi && <span className="onboarding-kpi-chip__unit">({kpi.unit})</span>}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* ── Connected Integrations Row if any ── */}
      {connectedIntegrations.length > 0 && (
        <Card className="onboarding-card">
          <CardHeader
            title="Linked Platform Integrations"
            subtitle="Enabled data pipelines and webhook hooks"
          />
          <CardBody>
            <div className="onboarding-review-integrations-row">
              {connectedIntegrations.map((intId) => {
                const intObj = INTEGRATIONS_LIST.find((i) => i.id === intId);
                return (
                  <div key={intId} className="onboarding-review-integration-badge">
                    <span className="onboarding-review-integration-badge__icon">✓</span>
                    <span>{intObj ? intObj.name : intId}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Navigation actions footer */}
      <div className="onboarding-actions-footer">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Edit
        </Button>
        <div className="onboarding-actions-footer__right">
          <Button variant="ghost" onClick={onCancel}>
            Exit Setup
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleLaunch}
            loading={isSubmitting}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            }
          >
            Launch & Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
