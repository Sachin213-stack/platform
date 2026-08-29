import React, { useState, useEffect, useCallback } from 'react';
import './OnboardingWizard.css';
import { useTenant } from '../../shared/context/TenantContext';
import { useToast } from '../../shared/components/Toast';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import { WizardStepper } from './components/WizardStepper';
import { Step1BusinessDetails } from './components/Step1BusinessDetails';
import { Step2TrackingSnippet } from './components/Step2TrackingSnippet';
import { Step3KpiConfirmation } from './components/Step3KpiConfirmation';
import { Step4Integrations } from './components/Step4Integrations';
import { Step5ReviewFinish } from './components/Step5ReviewFinish';
import { BUSINESS_TYPES, getDetectedTimezone, generateBusinessId } from './onboardingConfig';

const INITIAL_FORM_DATA = {
  businessName: '',
  businessType: 'ecommerce',
  websiteUrl: '',
  timezone: '',
  businessId: '',
  verificationStatus: 'idle', // 'idle' | 'checking' | 'success' | 'failed' | 'skipped'
  verificationResult: null,
  selectedKpis: [],
  connectedIntegrations: [],
};

export function OnboardingWizard({ isOpen, onClose, onCompleted }) {
  const { addBusiness, saveWizardDraft, loadWizardDraft, clearWizardDraft } = useTenant();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load draft or initialize defaults when opening
  useEffect(() => {
    if (isOpen) {
      const draft = loadWizardDraft();
      if (draft && draft.formData && Object.keys(draft.formData).length > 0) {
        setFormData(draft.formData);
        setCurrentStep(draft.currentStep || 1);
        setCompletedSteps(draft.completedSteps || []);
      } else {
        // Initialize fresh
        const detectedTz = getDetectedTimezone();
        setFormData({
          ...INITIAL_FORM_DATA,
          timezone: detectedTz,
          businessId: generateBusinessId('store'),
        });
        setCurrentStep(1);
        setCompletedSteps([]);
      }
    }
  }, [isOpen, loadWizardDraft]);

  // Auto-save draft on changes
  useEffect(() => {
    if (isOpen && formData.businessName) {
      saveWizardDraft({
        formData,
        currentStep,
        completedSteps,
        lastSaved: new Date().toISOString(),
      });
    }
  }, [formData, currentStep, completedSteps, isOpen, saveWizardDraft]);

  // Field change handler
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // If business name changes and businessId is uncustomized, regenerate ID
      if (field === 'businessName' && value && (!prev.businessId || prev.businessId.startsWith('biz_live_store'))) {
        next.businessId = generateBusinessId(value);
      }
      return next;
    });
  }, []);

  // Navigation handlers
  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep || completedSteps.includes(targetStep - 1)) {
      setCurrentStep(targetStep);
    }
  };

  const handleExitRequest = () => {
    // If user has entered any data, ask to save progress
    if (formData.businessName || formData.websiteUrl) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = (save = true) => {
    if (save) {
      saveWizardDraft({
        formData,
        currentStep,
        completedSteps,
        lastSaved: new Date().toISOString(),
      });
      addToast('Onboarding progress saved as draft.', 'info');
    } else {
      clearWizardDraft();
      addToast('Onboarding draft discarded.', 'info');
    }
    setShowExitConfirm(false);
    onClose();
  };

  const handleFinishOnboarding = () => {
    const selectedTypeObj =
      BUSINESS_TYPES.find((t) => t.id === formData.businessType) || BUSINESS_TYPES[0];

    // Clean domain representation from websiteUrl
    const domainStr = (formData.websiteUrl || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '') || `${formData.businessId}.dev`;

    const newBusinessProfile = {
      id: formData.businessId || `biz-${Date.now()}`,
      name: formData.businessName.trim(),
      type: formData.businessType || 'ecommerce',
      typeLabel: selectedTypeObj.shortLabel,
      tierLabel: 'Growth Telemetry Tier',
      region: 'us-east-1 (N. Virginia)',
      domain: domainStr,
      websiteUrl: formData.websiteUrl,
      timezone: formData.timezone || 'UTC',
      verified: formData.verificationStatus === 'success',
      activeKpis: formData.selectedKpis,
      integrations: formData.connectedIntegrations,
      createdAt: new Date().toISOString(),
    };

    addBusiness(newBusinessProfile);
    clearWizardDraft();

    addToast(
      `Business "${newBusinessProfile.name}" connected! Telemetry stream initialized.`,
      'success'
    );

    if (onCompleted) {
      onCompleted(newBusinessProfile);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="onboarding-portal" role="dialog" aria-modal="true">
        <div className="onboarding-backdrop" onClick={handleExitRequest} />

        <div className="onboarding-container" onClick={(e) => e.stopPropagation()}>
          {/* Top Bar Header */}
          <div className="onboarding-header">
            <div className="onboarding-header__left">
              <div className="onboarding-header__logo-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="onboarding-header__title">Add New Business Tenant</h3>
                <p className="onboarding-header__subtitle">
                  AI-CTO Telemetry & Incident Intelligence Setup
                </p>
              </div>
            </div>

            <button
              type="button"
              className="onboarding-header__close-btn"
              onClick={handleExitRequest}
              aria-label="Close setup wizard"
              title="Exit setup (Ctrl+Escape)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <WizardStepper
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />

          {/* Main Step Body Content */}
          <div className="onboarding-body">
            {currentStep === 1 && (
              <Step1BusinessDetails
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
                onCancel={handleExitRequest}
              />
            )}

            {currentStep === 2 && (
              <Step2TrackingSnippet
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
                onBack={handleBack}
                onCancel={handleExitRequest}
              />
            )}

            {currentStep === 3 && (
              <Step3KpiConfirmation
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
                onBack={handleBack}
                onCancel={handleExitRequest}
              />
            )}

            {currentStep === 4 && (
              <Step4Integrations
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
                onBack={handleBack}
                onCancel={handleExitRequest}
              />
            )}

            {currentStep === 5 && (
              <Step5ReviewFinish
                formData={formData}
                onFinish={handleFinishOnboarding}
                onBack={handleBack}
                onCancel={handleExitRequest}
              />
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <ConfirmModal
        isOpen={showExitConfirm}
        title="Exit Onboarding Setup?"
        message="Your progress will be securely saved as a draft so you can resume adding this business at any time."
        confirmText="Save Draft & Exit"
        cancelText="Discard Draft"
        variant="warning"
        onConfirm={() => handleConfirmExit(true)}
        onCancel={() => handleConfirmExit(false)}
      />
    </>
  );
}
