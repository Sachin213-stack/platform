import React, { useState } from 'react';
import './BillingPage.css';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import { useToast } from '../../shared/components/Toast';

// Child Components
import { UsageOverview } from './components/UsageOverview';
import { TierCards } from './components/TierCards';
import { PaymentMethods } from './components/PaymentMethods';
import { BillingHistory } from './components/BillingHistory';
import { UsageAlerts } from './components/UsageAlerts';
import { DangerZone } from './components/DangerZone';

// Modals
import { PlanChangeModal } from './components/PlanChangeModal';
import { AddCardModal } from './components/AddCardModal';
import { ContactSalesModal } from './components/ContactSalesModal';
import { CancelSubscriptionModal } from './components/CancelSubscriptionModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { RetryPaymentModal } from './components/RetryPaymentModal';

const INITIAL_CARDS = [
  {
    id: 'card_1',
    brand: 'Visa',
    last4: '4242',
    expMonth: '12',
    expYear: '2028',
    holderName: 'Alex Vance',
    isPrimary: true,
  },
  {
    id: 'card_2',
    brand: 'Mastercard',
    last4: '8821',
    expMonth: '09',
    expYear: '2027',
    holderName: 'Apex Engineering Corp',
    isPrimary: false,
  },
  {
    id: 'card_3',
    brand: 'American Express',
    last4: '1009',
    expMonth: '04',
    expYear: '2029',
    holderName: 'DevOps Cloud Vault',
    isPrimary: false,
  },
];

const INITIAL_INVOICES = [
  {
    id: 'INV-2026-08',
    date: 'Aug 01, 2026',
    description: 'AI-CTO Enterprise Plan (10M Events / 2,500 Actions)',
    subtotal: 799.0,
    tax: 143.82,
    total: 942.82,
    amount: 942.82,
    status: 'Paid',
    cardLast4: '4242',
  },
  {
    id: 'INV-2026-07',
    date: 'Jul 01, 2026',
    description: 'AI-CTO Enterprise Plan (10M Events / 2,500 Actions)',
    subtotal: 799.0,
    tax: 143.82,
    total: 942.82,
    amount: 942.82,
    status: 'Paid',
    cardLast4: '4242',
  },
  {
    id: 'INV-2026-06',
    date: 'Jun 01, 2026',
    description: 'AI-CTO Enterprise Plan (10M Events / 2,500 Actions)',
    subtotal: 799.0,
    tax: 143.82,
    total: 942.82,
    amount: 942.82,
    status: 'Paid',
    cardLast4: '4242',
  },
  {
    id: 'INV-2026-05',
    date: 'May 14, 2026',
    description: 'On-Demand Autonomous Agent Burst (1,000 Invocations)',
    subtotal: 120.0,
    tax: 21.6,
    total: 141.6,
    amount: 141.6,
    status: 'Failed',
    cardLast4: '8821',
  },
];

export default function BillingPage({ onNavigate }) {
  const { addToast } = useToast();

  // Primary State
  const [currentPlan, setCurrentPlan] = useState('Enterprise');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [autoRenew, setAutoRenew] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    companyName: 'Apex Retail Labs Inc.',
    street: '104 Tech Boulevard, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
    taxId: '29ABCDE1234F1Z5',
  });

  // Modals state
  const [planChangeModal, setPlanChangeModal] = useState({
    isOpen: false,
    targetPlan: null,
    changeType: 'upgrade',
  });
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isContactSalesOpen, setIsContactSalesOpen] = useState(false);
  const [isCancelSubscriptionOpen, setIsCancelSubscriptionOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState(null);
  const [isPurgeCardsOpen, setIsPurgeCardsOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [selectedInvoiceForRetry, setSelectedInvoiceForRetry] = useState(null);

  // ── Handlers ────────────────────────────────────────────────

  // Scroll smoothly to Tier Cards
  const handleScrollToTiers = () => {
    const el = document.getElementById('tier-cards-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Promo Code Validation
  const handleApplyPromo = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AICTO20' || clean === 'OCTO20') {
      setAppliedPromo({ code: clean, discountPercent: 20 });
      addToast(`Promo code ${clean} applied: 20% discount on all plans!`, 'success');
      return true;
    }
    if (clean === 'STARTUP50' || clean === 'OCTO50') {
      setAppliedPromo({ code: clean, discountPercent: 50 });
      addToast(`Promo code ${clean} applied: 50% discount activated!`, 'success');
      return true;
    }
    if (clean === 'SAVE10') {
      setAppliedPromo({ code: clean, discountPercent: 10 });
      addToast(`Promo code ${clean} applied: 10% discount activated!`, 'success');
      return true;
    }
    return false;
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    addToast('Promo discount removed.', 'info');
  };

  // Plan Selection (Upgrade / Downgrade)
  const handleSelectPlan = (plan, changeType) => {
    setPlanChangeModal({
      isOpen: true,
      targetPlan: plan,
      changeType,
    });
  };

  const handleConfirmPlanChange = (targetPlan) => {
    setCurrentPlan(targetPlan.name);
    setPlanChangeModal({ isOpen: false, targetPlan: null, changeType: 'upgrade' });
    addToast(`Successfully changed plan to ${targetPlan.name}!`, 'success');
  };

  // Contact Sales Submit
  const handleContactSalesSubmit = (data) => {
    addToast('Enterprise inquiry received. A solutions engineer will reach out within 2 hours.', 'success');
  };

  // Payment Methods Handlers
  const handleAddCard = (newCard) => {
    setCards((prev) => {
      let updated = prev;
      if (newCard.isPrimary) {
        updated = updated.map((c) => ({ ...c, isPrimary: false }));
      }
      return [newCard, ...updated];
    });
    addToast(`Added ${newCard.brand} ending in •••• ${newCard.last4}`, 'success');
  };

  const handleSetPrimaryCard = (cardId) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === cardId,
      }))
    );
    const card = cards.find((c) => c.id === cardId);
    addToast(`Set ${card?.brand || 'card'} (•••• ${card?.last4 || ''}) as primary payment method`, 'success');
  };

  const handleRemoveCardClick = (card) => {
    if (cards.length === 1 && currentPlan.toLowerCase() !== 'starter') {
      addToast('Cannot remove the only payment method while having an active paid subscription.', 'error');
      return;
    }
    setCardToRemove(card);
  };

  const handleConfirmRemoveCard = () => {
    if (!cardToRemove) return;
    const isRemovingPrimary = cardToRemove.isPrimary;
    setCards((prev) => {
      const remaining = prev.filter((c) => c.id !== cardToRemove.id);
      if (isRemovingPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
    addToast(`Removed ${cardToRemove.brand} •••• ${cardToRemove.last4}`, 'info');
    setCardToRemove(null);
  };

  const handleToggleAutoRenew = (newVal) => {
    setAutoRenew(newVal);
    addToast(`Automatic renewal ${newVal ? 'enabled' : 'disabled'}.`, newVal ? 'success' : 'warning');
  };

  const handleSaveBillingAddress = (updatedAddress) => {
    setBillingAddress(updatedAddress);
    addToast('Billing address and tax identification saved.', 'success');
  };

  // Invoices Handlers
  const handleDownloadInvoice = (inv) => {
    addToast(`Downloading invoice ${inv.id} (${inv.total ? `$${inv.total.toFixed(2)}` : `$${inv.amount.toFixed(2)}`})...`, 'info');
    // Simulated receipt text download
    const receiptContent = `AI-CTO PLATFORM TAX INVOICE\n-----------------------------\nInvoice ID: ${inv.id}\nDate: ${inv.date}\nDescription: ${inv.description}\nSubtotal: $${inv.subtotal || inv.amount}\nTax (18%): $${inv.tax || 0}\nTotal: $${inv.total || inv.amount}\nStatus: ${inv.status}\nBilled To: ${billingAddress.companyName}\nGSTIN/Tax ID: ${billingAddress.taxId || 'N/A'}\n-----------------------------\nThank you for choosing AI-CTO.`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.id}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllInvoices = async (invoiceList) => {
    addToast(`Packaging ${invoiceList.length} invoice receipts into download bundle...`, 'info');
    await new Promise((r) => setTimeout(r, 600));
    invoiceList.forEach((inv) => {
      handleDownloadInvoice(inv);
    });
    addToast(`Downloaded all ${invoiceList.length} invoices successfully.`, 'success');
  };

  const handleConfirmRetryPayment = (invoiceId, cardId) => {
    const card = cards.find((c) => c.id === cardId);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: 'Paid', cardLast4: card ? card.last4 : '4242' }
          : inv
      )
    );
    addToast(`Payment retry succeeded! Invoice ${invoiceId} marked as Paid.`, 'success');
  };

  // Usage Alerts Save
  const handleSaveAlertSettings = (settings) => {
    addToast(`Alert preferences saved: threshold set at ${settings.threshold}%.`, 'success');
  };

  // Danger Zone Handlers
  const handleAcceptRetentionDiscount = () => {
    setAppliedPromo({ code: 'RETENTION30', discountPercent: 30 });
    addToast('🎉 30% retention discount successfully applied for the next 3 cycles!', 'success');
  };

  const handleConfirmCancelSubscription = (reason) => {
    setCurrentPlan('Starter');
    setAutoRenew(false);
    addToast('Subscription cancelled. Workspace scheduled to revert to Starter on Sep 01, 2026.', 'warning');
  };

  const handlePurgeAllCards = () => {
    if (currentPlan.toLowerCase() !== 'starter') {
      addToast('Cannot remove all payment methods while an active paid subscription is ongoing. Cancel subscription first.', 'error');
      setIsPurgeCardsOpen(false);
      return;
    }
    setCards([]);
    setIsPurgeCardsOpen(false);
    addToast('All stored payment methods have been safely purged.', 'info');
  };

  return (
    <div className="billing-page">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="billing-header">
        <div>
          <div className="billing-header__title-row">
            <h2 className="billing-header__title">
              Billing & Subscriptions
            </h2>
            <Badge variant="violet" size="md">
              {currentPlan} Plan
            </Badge>
          </div>
          <p className="billing-header__subtitle">
            Manage compute quotas, autonomous agent credits, multiple payment methods, and tax invoices.
          </p>
        </div>

        <div className="billing-header__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            ← Return to Dashboard
          </Button>
        </div>
      </div>

      {/* ── Section 1: Usage Overview & Trend Mini-Chart ───────── */}
      <UsageOverview
        currentPlan={currentPlan}
        onUpgradeClick={handleScrollToTiers}
      />

      {/* ── Section 2: Subscription Plans & Tier Cards ─────────── */}
      <TierCards
        currentPlan={currentPlan}
        billingInterval={billingInterval}
        onBillingIntervalChange={setBillingInterval}
        onSelectPlan={handleSelectPlan}
        onContactSales={() => setIsContactSalesOpen(true)}
        appliedPromo={appliedPromo}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
      />

      {/* ── Middle Two-Column Grid: Payment & Usage Alerts ─────── */}
      <div className="billing-split-grid">
        {/* Section 3 & 7: Payment Methods, Auto-Renew & Billing Address with GST */}
        <PaymentMethods
          cards={cards}
          onAddCardClick={() => setIsAddCardOpen(true)}
          onSetPrimaryCard={handleSetPrimaryCard}
          onRemoveCard={handleRemoveCardClick}
          billingAddress={billingAddress}
          onSaveBillingAddress={handleSaveBillingAddress}
          autoRenew={autoRenew}
          onToggleAutoRenew={handleToggleAutoRenew}
        />

        {/* Section 5: Usage Alerts Configuration */}
        <UsageAlerts
          initialThreshold={80}
          initialChannels={['email', 'slack']}
          initialEmail="cto-office@apexretail.io"
          onSaveAlertSettings={handleSaveAlertSettings}
        />
      </div>

      {/* ── Section 4: Billing History & Invoices ───────────────── */}
      <BillingHistory
        invoices={invoices}
        onDownloadInvoice={handleDownloadInvoice}
        onDownloadAllInvoices={handleDownloadAllInvoices}
        onRetryPayment={(inv) => setSelectedInvoiceForRetry(inv)}
        onViewInvoiceDetail={(inv) => setSelectedInvoiceForDetail(inv)}
      />

      {/* ── Section 8: Danger Zone ──────────────────────────────── */}
      <DangerZone
        currentPlan={currentPlan}
        hasActiveSubscription={currentPlan.toLowerCase() !== 'starter'}
        onCancelSubscriptionClick={() => setIsCancelSubscriptionOpen(true)}
        onRemoveAllPaymentMethodsClick={() => setIsPurgeCardsOpen(true)}
      />

      {/* ── Modals & Dialogs ──────────────────────────────────── */}
      <PlanChangeModal
        isOpen={planChangeModal.isOpen}
        onClose={() => setPlanChangeModal({ isOpen: false, targetPlan: null, changeType: 'upgrade' })}
        targetPlan={planChangeModal.targetPlan}
        currentPlan={currentPlan}
        changeType={planChangeModal.changeType}
        billingInterval={billingInterval}
        appliedPromo={appliedPromo}
        onConfirmPlanChange={handleConfirmPlanChange}
      />

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onAddCard={handleAddCard}
      />

      <ContactSalesModal
        isOpen={isContactSalesOpen}
        onClose={() => setIsContactSalesOpen(false)}
        onSubmitInquiry={handleContactSalesSubmit}
      />

      <CancelSubscriptionModal
        isOpen={isCancelSubscriptionOpen}
        onClose={() => setIsCancelSubscriptionOpen(false)}
        currentPlan={currentPlan}
        onAcceptRetentionDiscount={handleAcceptRetentionDiscount}
        onConfirmCancelSubscription={handleConfirmCancelSubscription}
      />

      {/* Remove Single Card Confirm */}
      <ConfirmModal
        isOpen={Boolean(cardToRemove)}
        onClose={() => setCardToRemove(null)}
        onConfirm={handleConfirmRemoveCard}
        title="Remove Saved Card"
        message={`Are you sure you want to remove ${cardToRemove?.brand} ending in •••• ${cardToRemove?.last4}?`}
        confirmLabel="Remove Card"
        variant="danger"
      />

      {/* Purge All Payment Methods Confirm */}
      <ConfirmModal
        isOpen={isPurgeCardsOpen}
        onClose={() => setIsPurgeCardsOpen(false)}
        onConfirm={handlePurgeAllCards}
        title="Purge All Payment Methods"
        message={
          currentPlan.toLowerCase() !== 'starter'
            ? `Cannot remove payment methods while having an active ${currentPlan} subscription. Please cancel your subscription first.`
            : 'Are you sure you want to purge all stored credit cards from this workspace vault?'
        }
        confirmLabel={currentPlan.toLowerCase() !== 'starter' ? 'I Understand' : 'Purge All Cards'}
        variant="danger"
      />

      {/* Invoice Details & Tax Line Items Modal */}
      <InvoiceDetailModal
        isOpen={Boolean(selectedInvoiceForDetail)}
        onClose={() => setSelectedInvoiceForDetail(null)}
        invoice={selectedInvoiceForDetail}
        onDownloadReceipt={handleDownloadInvoice}
      />

      {/* Retry Failed Payment Modal */}
      <RetryPaymentModal
        isOpen={Boolean(selectedInvoiceForRetry)}
        onClose={() => setSelectedInvoiceForRetry(null)}
        invoice={selectedInvoiceForRetry}
        cards={cards}
        onConfirmRetry={handleConfirmRetryPayment}
      />
    </div>
  );
}
