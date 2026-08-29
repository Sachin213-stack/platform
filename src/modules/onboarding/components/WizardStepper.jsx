import React from 'react';

const STEPS = [
  { id: 1, label: 'Business Details', shortLabel: 'Details' },
  { id: 2, label: 'Tracking Snippet', shortLabel: 'Snippet' },
  { id: 3, label: 'KPI Selection', shortLabel: 'KPIs' },
  { id: 4, label: 'Integrations', shortLabel: 'Integrations' },
  { id: 5, label: 'Review & Launch', shortLabel: 'Launch' },
];

export function WizardStepper({ currentStep, onStepClick, completedSteps = [] }) {
  const currentStepObj = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="onboarding-stepper" aria-label="Onboarding Progress">
      {/* Mobile Compact Stepper */}
      <div className="onboarding-stepper__mobile">
        <div className="onboarding-stepper__mobile-meta">
          <span className="onboarding-stepper__mobile-step">Step {currentStep} of {STEPS.length}</span>
          <span className="onboarding-stepper__mobile-title">{currentStepObj.label}</span>
        </div>
        <div className="onboarding-stepper__mobile-bar">
          <div
            className="onboarding-stepper__mobile-progress"
            style={{ width: `${((currentStep) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper Bar */}
      <div className="onboarding-stepper__desktop">
        <div className="onboarding-stepper__track">
          <div
            className="onboarding-stepper__line-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="onboarding-stepper__steps-row">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = isCompleted || step.id < currentStep;

            let stateClass = 'onboarding-step--pending';
            if (isCurrent) stateClass = 'onboarding-step--active';
            else if (isCompleted) stateClass = 'onboarding-step--completed';

            return (
              <button
                key={step.id}
                type="button"
                className={`onboarding-step ${stateClass}`}
                onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                disabled={!isClickable && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="onboarding-step__node">
                  {isCompleted ? (
                    <svg className="onboarding-step__check" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="4 10 8 14 16 6" />
                    </svg>
                  ) : (
                    <span className="onboarding-step__num">{step.id}</span>
                  )}
                </div>
                <div className="onboarding-step__text">
                  <span className="onboarding-step__index">Step {step.id}</span>
                  <span className="onboarding-step__label">{step.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
