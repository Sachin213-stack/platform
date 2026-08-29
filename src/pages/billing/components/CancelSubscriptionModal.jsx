import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  currentPlan = 'Enterprise',
  onAcceptRetentionDiscount,
  onConfirmCancelSubscription,
}) {
  const [step, setStep] = useState(1); // 1 = Retention Offer, 2 = Final Confirmation
  const [typedConfirm, setTypedConfirm] = useState('');
  const [reason, setReason] = useState('switching_tools');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setTypedConfirm('');
    onClose();
  };

  const handleApplyRetentionDiscount = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    onAcceptRetentionDiscount();
    setIsProcessing(false);
    handleClose();
  };

  const handleFinalCancel = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirmCancelSubscription(reason);
    setIsProcessing(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? `Cancel ${currentPlan} Subscription?` : 'Final Cancellation Confirmation'}
      subtitle={step === 1 ? 'Please review your active capabilities and special retention benefits.' : 'This action is irreversible upon current cycle completion.'}
      maxWidth="500px"
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onClick={() => setStep(2)}
              disabled={isProcessing}
            >
              Continue to Cancel →
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep(1)} disabled={isProcessing}>
              ← Back
            </Button>
            <Button
              variant="danger"
              onClick={handleFinalCancel}
              disabled={typedConfirm.trim().toUpperCase() !== 'CANCEL'}
              loading={isProcessing}
            >
              Confirm Cancellation
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="retention-box">
            <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
              Here is what your workspace will lose:
            </div>
            <ul className="retention-features-list">
              <li className="retention-features-item">
                <span style={{ color: 'var(--color-status-error)' }}>✕</span>
                <span>Real-time FRIDAY Autonomous Co-pilot & anomaly self-healing</span>
              </li>
              <li className="retention-features-item">
                <span style={{ color: 'var(--color-status-error)' }}>✕</span>
                <span>10M+ telemetry compute quota (drops to 1M events)</span>
              </li>
              <li className="retention-features-item">
                <span style={{ color: 'var(--color-status-error)' }}>✕</span>
                <span>99.99% enterprise SLA guarantee & priority Slack bridge</span>
              </li>
            </ul>

            {/* Retention Offer */}
            <div className="retention-offer-banner">
              <div>
                <div className="retention-offer-text">
                  🎁 Exclusive Offer: Stay on {currentPlan} for 30% OFF
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Apply an instant 30% credit for the next 3 consecutive billing cycles.
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyRetentionDiscount}
                loading={isProcessing}
              >
                Claim 30% Off
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label className="field-label">Why are you cancelling today?</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="switching_tools">Switching to an alternative monitoring tool</option>
              <option value="temporary_pause">Temporary project pause / budget restructuring</option>
              <option value="too_expensive">Pricing does not fit current telemetry volume</option>
              <option value="missing_features">Missing required framework integrations</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div style={{
            background: 'var(--color-status-error-bg)',
            border: '1px solid var(--color-status-error-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-error)', lineHeight: '1.5' }}>
              Your workspace will remain active on <strong>{currentPlan}</strong> until <strong>Aug 31, 2026</strong>. Afterwards, telemetry limits will revert to the free Starter tier.
            </p>
          </div>

          <div>
            <label className="field-label">
              Type <strong style={{ color: 'var(--color-status-error)' }}>CANCEL</strong> to confirm:
            </label>
            <input
              type="text"
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              placeholder='Type "CANCEL"'
              autoFocus
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
