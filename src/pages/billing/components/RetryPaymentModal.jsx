import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export function RetryPaymentModal({
  isOpen,
  onClose,
  invoice,
  cards = [],
  onConfirmRetry,
}) {
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleRetry = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 700));
    onConfirmRetry(invoice.id, selectedCardId);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Retry Payment for ${invoice.id}`}
      subtitle="Re-attempt transaction authorization with a saved payment method."
      maxWidth="460px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRetry}
            loading={isProcessing}
          >
            Authorize & Pay ${(invoice.total || invoice.amount).toFixed(2)}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{
          background: 'var(--color-status-error-bg)',
          border: '1px solid var(--color-status-error-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-status-error)',
        }}>
          Previous payment failed due to temporary processor timeout. Please choose a payment card to charge.
        </div>

        <div>
          <label className="field-label">Select Payment Method</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {cards.map((c) => (
              <label
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  background: selectedCardId === c.id ? 'var(--color-accent-subtle)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedCardId === c.id ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <input
                    type="radio"
                    name="retryCard"
                    value={c.id}
                    checked={selectedCardId === c.id}
                    onChange={() => setSelectedCardId(c.id)}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--color-accent)' }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                    {c.brand} •••• {c.last4}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Exp {c.expMonth}/{c.expYear}</span>
                  {c.isPrimary && <Badge variant="violet" size="sm">Primary</Badge>}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
