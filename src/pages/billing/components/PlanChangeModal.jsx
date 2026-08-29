import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export function PlanChangeModal({
  isOpen,
  onClose,
  targetPlan,
  currentPlan,
  changeType = 'upgrade', // 'upgrade' | 'downgrade'
  billingInterval = 'monthly',
  onConfirmPlanChange,
  appliedPromo,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !targetPlan) return null;

  const rawPrice = billingInterval === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;
  const finalPrice = appliedPromo && rawPrice > 0
    ? Math.round(rawPrice * (1 - appliedPromo.discountPercent / 100))
    : rawPrice;

  // Mock proration calculation
  const prorationAmount = changeType === 'upgrade' ? Math.round(finalPrice * 0.45) : 0;
  const refundCredit = changeType === 'downgrade' ? 120 : 0;
  const effectiveDate = changeType === 'upgrade' ? 'Immediately' : 'At end of current cycle (Sep 01, 2026)';

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirmPlanChange(targetPlan);
    setIsProcessing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={changeType === 'upgrade' ? `Upgrade to ${targetPlan.name}` : `Downgrade to ${targetPlan.name}`}
      subtitle={`Review billing adjustment, proration estimate, and feature scope changes.`}
      maxWidth="500px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant={changeType === 'upgrade' ? 'primary' : 'danger'}
            onClick={handleConfirm}
            loading={isProcessing}
          >
            {changeType === 'upgrade' ? 'Confirm & Upgrade Now' : 'Confirm Plan Downgrade'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Plan Transition Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Current Tier</div>
            <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{currentPlan}</div>
          </div>
          <div style={{ color: 'var(--color-accent)' }}>➔</div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Target Tier</div>
            <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{targetPlan.name}</div>
          </div>
        </div>

        {/* Pricing & Proration Box */}
        <div style={{
          background: changeType === 'upgrade' ? 'rgba(139, 92, 246, 0.06)' : 'rgba(239, 68, 68, 0.05)',
          border: `1px solid ${changeType === 'upgrade' ? 'var(--color-accent-border)' : 'var(--color-status-error-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>New Recurring Rate:</span>
            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              ${finalPrice} / {billingInterval === 'annual' ? 'month (billed annually)' : 'month'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Effective Timestamp:</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>
              {effectiveDate}
            </span>
          </div>

          {changeType === 'upgrade' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Immediate Prorated Charge:</span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'var(--weight-bold)' }}>
                ${prorationAmount}.00
              </span>
            </div>
          )}

          {changeType === 'downgrade' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Unused Balance Credit:</span>
              <span style={{ color: 'var(--color-status-success)', fontWeight: 'var(--weight-bold)' }}>
                +${refundCredit}.00 (Applied to next invoice)
              </span>
            </div>
          )}
        </div>

        {/* Scope Change List */}
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
            {changeType === 'upgrade' ? 'Unlocked Capabilities:' : 'Quota Reductions After Cycle End:'}
          </span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            {targetPlan.features.slice(0, 4).map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: changeType === 'upgrade' ? 'var(--color-status-success)' : 'var(--color-status-warning)' }}>
                  {changeType === 'upgrade' ? '✓' : '⚠️'}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
