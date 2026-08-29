import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { ToggleRow } from '../../../shared/components/ToggleRow';
import { EmptyState } from '../../../shared/components/EmptyState';

export function PaymentMethods({
  cards = [],
  onAddCardClick,
  onSetPrimaryCard,
  onRemoveCard,
  billingAddress,
  onSaveBillingAddress,
  autoRenew = true,
  onToggleAutoRenew,
}) {
  const [addressForm, setAddressForm] = useState(billingAddress || {
    companyName: 'Apex Retail Labs Inc.',
    street: '104 Tech Boulevard, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
    taxId: 'US-EIN-884920194', // Or GST / Tax ID
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleAddressChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    await new Promise((r) => setTimeout(r, 400));
    onSaveBillingAddress(addressForm);
    setIsSavingAddress(false);
  };

  // Helper for brand icon badge
  const renderBrandIcon = (brand) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('visa')) return 'VISA';
    if (b.includes('master')) return 'MC';
    if (b.includes('amex')) return 'AMEX';
    return 'CARD';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card padding="normal">
        <CardHeader
          title="Payment Methods & Invoicing"
          subtitle="Manage saved credit cards, primary billing sources, and tax credentials"
          action={
            <Button variant="secondary" size="sm" onClick={onAddCardClick}>
              + Add Card
            </Button>
          }
        />

        <CardBody>
          {/* Saved Cards List */}
          {cards.length === 0 ? (
            <EmptyState
              title="No Payment Methods Saved"
              description="Add a valid credit or debit card to ensure uninterrupted agent execution."
              actionLabel="Add Payment Method"
              onAction={onAddCardClick}
            />
          ) : (
            <div className="payment-methods-list">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`payment-card-row ${card.isPrimary ? 'payment-card-row--primary' : ''}`}
                >
                  <div className="payment-card-info">
                    <div className="payment-card-brand-icon">
                      {renderBrandIcon(card.brand)}
                    </div>
                    <div className="payment-card-details">
                      <div className="payment-card-number">
                        •••• •••• •••• {card.last4}
                        {card.isPrimary && (
                          <Badge variant="violet" size="sm">Primary</Badge>
                        )}
                      </div>
                      <div className="payment-card-meta">
                        Expires {card.expMonth}/{card.expYear} • {card.holderName || 'Workspace Admin'}
                      </div>
                    </div>
                  </div>

                  <div className="payment-card-actions">
                    {!card.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetPrimaryCard(card.id)}
                      >
                        Make Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: 'var(--color-status-error)' }}
                      onClick={() => onRemoveCard(card)}
                      title={cards.length === 1 ? 'Cannot remove the only payment method on an active plan' : 'Remove card'}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Auto-Renew Toggle */}
          <ToggleRow
            title="Automatic Subscription Renewal"
            description="Automatically renew your subscription at the beginning of each billing cycle using your primary card."
            checked={autoRenew}
            onChange={onToggleAutoRenew}
            badge={<Badge variant={autoRenew ? 'success' : 'warning'} size="sm">{autoRenew ? 'Active' : 'Disabled'}</Badge>}
          />

          {/* Billing Address & Tax / GST Form */}
          <form onSubmit={handleSaveAddress} className="billing-address-form">
            <div className="billing-address-form__full">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                Billing Address & Tax Identification
              </span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Used for generating tax-compliant VAT, GST, and corporate invoices.
              </p>
            </div>

            <div className="billing-address-form__full">
              <label className="field-label">Company / Legal Entity Name</label>
              <input
                type="text"
                value={addressForm.companyName}
                onChange={(e) => handleAddressChange('companyName', e.target.value)}
                placeholder="e.g. Acme Corp Inc."
                required
              />
            </div>

            <div className="billing-address-form__full">
              <label className="field-label">Street Address</label>
              <input
                type="text"
                value={addressForm.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="e.g. 104 Tech Boulevard, Suite 400"
                required
              />
            </div>

            <div>
              <label className="field-label">City</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="field-label">State / Province</label>
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="State"
                required
              />
            </div>

            <div>
              <label className="field-label">Postal / ZIP Code</label>
              <input
                type="text"
                value={addressForm.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="Postal Code"
                required
              />
            </div>

            <div>
              <label className="field-label">Country</label>
              <input
                type="text"
                value={addressForm.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                placeholder="Country"
                required
              />
            </div>

            <div className="billing-address-form__full">
              <label className="field-label">
                GSTIN / VAT / Corporate Tax ID <span style={{ color: 'var(--color-text-tertiary)' }}>(Optional)</span>
              </label>
              <input
                type="text"
                value={addressForm.taxId}
                onChange={(e) => handleAddressChange('taxId', e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5 or US-EIN-884920194"
              />
            </div>

            <div className="billing-address-form__full" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSavingAddress}
              >
                Save Billing Details
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
