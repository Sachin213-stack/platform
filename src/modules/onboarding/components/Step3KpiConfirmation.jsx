import React, { useEffect } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { BUSINESS_TYPES, KPI_CATALOG } from '../onboardingConfig';

export function Step3KpiConfirmation({
  formData,
  onChange,
  onNext,
  onBack,
  onCancel,
}) {
  const businessType = formData.businessType || 'ecommerce';
  const typeConfig = BUSINESS_TYPES.find((t) => t.id === businessType) || BUSINESS_TYPES[0];

  // Initialize selected KPIs from business type defaults if not already set
  useEffect(() => {
    if (!formData.selectedKpis || formData.selectedKpis.length === 0) {
      onChange('selectedKpis', typeConfig.defaultKpis);
    }
  }, [businessType, typeConfig.defaultKpis, formData.selectedKpis, onChange]);

  const selectedKpis = formData.selectedKpis || typeConfig.defaultKpis;

  const handleToggleKpi = (kpiId) => {
    const next = selectedKpis.includes(kpiId)
      ? selectedKpis.filter((id) => id !== kpiId)
      : [...selectedKpis, kpiId];
    onChange('selectedKpis', next);
  };

  const handleSelectAll = () => {
    onChange('selectedKpis', Object.keys(KPI_CATALOG));
  };

  const handleResetDefaults = () => {
    onChange('selectedKpis', typeConfig.defaultKpis);
  };

  // Group KPIs into Recommended for this Business Type vs Additional Telemetry Metrics
  const recommendedKpiIds = typeConfig.defaultKpis;
  const additionalKpiIds = Object.keys(KPI_CATALOG).filter((id) => !recommendedKpiIds.includes(id));

  return (
    <div className="onboarding-step-content">
      <div className="onboarding-step-header">
        <Badge variant="violet" size="sm">Step 3 of 5</Badge>
        <h2 className="onboarding-step-title">Dashboard KPI Configuration</h2>
        <p className="onboarding-step-subtitle">
          AI-CTO has selected recommended real-time metrics optimized for <strong>{typeConfig.label}</strong>.
          You can customize and toggle which indicators appear on your primary executive dashboard.
        </p>
      </div>

      {/* ── KPI Selection Actions & Controls ── */}
      <div className="onboarding-kpi-controls">
        <div className="onboarding-kpi-controls__left">
          <span className="onboarding-kpi-count-badge">
            <strong>{selectedKpis.length}</strong> metrics active for this tenant
          </span>
        </div>
        <div className="onboarding-kpi-controls__right">
          <button type="button" className="onboarding-link-btn" onClick={handleResetDefaults}>
            Reset to Recommended Defaults
          </button>
          <span className="onboarding-kpi-divider">·</span>
          <button type="button" className="onboarding-link-btn" onClick={handleSelectAll}>
            Select All Available
          </button>
        </div>
      </div>

      {/* ── 1. Recommended Core KPIs ── */}
      <Card className="onboarding-card">
        <CardHeader
          title={`Recommended for ${typeConfig.shortLabel}`}
          subtitle="Pre-calibrated thresholds and anomaly detection models for your industry vertical."
          action={<Badge variant="violet" size="sm">Primary Telemetry</Badge>}
        />
        <CardBody>
          <div className="onboarding-kpi-grid">
            {recommendedKpiIds.map((kpiId) => {
              const kpi = KPI_CATALOG[kpiId];
              if (!kpi) return null;
              const isChecked = selectedKpis.includes(kpiId);

              return (
                <div
                  key={kpiId}
                  className={`onboarding-kpi-item ${isChecked ? 'onboarding-kpi-item--selected' : ''}`}
                  onClick={() => handleToggleKpi(kpiId)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleKpi(kpiId);
                    }
                  }}
                >
                  <div className="onboarding-kpi-item__checkbox">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent container click
                      tabIndex={-1}
                      id={`kpi-${kpiId}`}
                    />
                  </div>

                  <div className="onboarding-kpi-item__content">
                    <div className="onboarding-kpi-item__header">
                      <span className="onboarding-kpi-item__name">{kpi.name}</span>
                      <span className="onboarding-kpi-item__badge">{kpi.badge}</span>
                    </div>
                    <p className="onboarding-kpi-item__desc">{kpi.description}</p>
                    <div className="onboarding-kpi-item__meta">
                      <span className="onboarding-kpi-item__unit">Unit: {kpi.unit}</span>
                      <span className="onboarding-kpi-item__target">Target: {kpi.defaultTarget}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* ── 2. Additional Global Indicators ── */}
      <Card className="onboarding-card">
        <CardHeader
          title="Additional Infrastructure & Quality Metrics"
          subtitle="Optional low-level vitals captured directly by edge node probes."
        />
        <CardBody>
          <div className="onboarding-kpi-grid">
            {additionalKpiIds.map((kpiId) => {
              const kpi = KPI_CATALOG[kpiId];
              if (!kpi) return null;
              const isChecked = selectedKpis.includes(kpiId);

              return (
                <div
                  key={kpiId}
                  className={`onboarding-kpi-item ${isChecked ? 'onboarding-kpi-item--selected' : ''}`}
                  onClick={() => handleToggleKpi(kpiId)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleKpi(kpiId);
                    }
                  }}
                >
                  <div className="onboarding-kpi-item__checkbox">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      tabIndex={-1}
                      id={`kpi-${kpiId}`}
                    />
                  </div>

                  <div className="onboarding-kpi-item__content">
                    <div className="onboarding-kpi-item__header">
                      <span className="onboarding-kpi-item__name">{kpi.name}</span>
                      <span className="onboarding-kpi-item__category">{kpi.category}</span>
                    </div>
                    <p className="onboarding-kpi-item__desc">{kpi.description}</p>
                    <div className="onboarding-kpi-item__meta">
                      <span className="onboarding-kpi-item__unit">Unit: {kpi.unit}</span>
                      <span className="onboarding-kpi-item__target">Target: {kpi.defaultTarget}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Navigation actions footer */}
      <div className="onboarding-actions-footer">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className="onboarding-actions-footer__right">
          <Button variant="ghost" onClick={onCancel}>
            Exit Setup
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            disabled={selectedKpis.length === 0}
            iconRight={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            }
          >
            Continue to Integrations
          </Button>
        </div>
      </div>
    </div>
  );
}
