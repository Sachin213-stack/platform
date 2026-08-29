import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

export function AddCardModal({
  isOpen,
  onClose,
  onAddCard,
}) {
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Detect card brand
  const detectBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'American Express';
    return 'Credit Card';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 15) {
      setFormError('Please enter a valid 15 or 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setFormError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setFormError('Please enter a 3 or 4 digit CVC security code.');
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const [expMonth, expYear] = expiry.split('/');
    const newCard = {
      id: `card_${Date.now()}`,
      brand: detectBrand(),
      last4: cleanNumber.slice(-4),
      expMonth,
      expYear: expYear.length === 2 ? `20${expYear}` : expYear,
      holderName: holderName.trim() || 'Workspace Admin',
      isPrimary,
    };

    onAddCard(newCard);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment Method"
      subtitle="Safely store encrypted card credentials for automated compute renewals."
      maxWidth="480px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSaving}
          >
            Save & Authorize Card
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {formError && (
          <div style={{
            background: 'var(--color-status-error-bg)',
            border: '1px solid var(--color-status-error-border)',
            color: 'var(--color-status-error)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
          }}>
            {formError}
          </div>
        )}

        <div>
          <label className="field-label">Cardholder Name</label>
          <input
            type="text"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Name on card"
            required
            autoFocus
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="field-label">Card Number</label>
            <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 'var(--weight-semibold)' }}>
              {detectBrand()}
            </span>
          </div>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="4242 •••• •••• ••••"
            maxLength={19}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="field-label">Expiry (MM/YY)</label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="12/28"
              maxLength={5}
              required
            />
          </div>

          <div>
            <label className="field-label">CVC / CVV</label>
            <input
              type="password"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              maxLength={4}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <input
            type="checkbox"
            id="make-primary-check"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
          />
          <label htmlFor="make-primary-check" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            Set as primary billing payment source
          </label>
        </div>
      </form>
    </Modal>
  );
}
