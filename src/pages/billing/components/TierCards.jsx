import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export function TierCards({
  currentPlan = 'Enterprise', // 'Starter' | 'Pro' | 'Enterprise'
  billingInterval = 'monthly', // 'monthly' | 'annual'
  onBillingIntervalChange,
  onSelectPlan,
  onContactSales,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
}) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const plans = [
    {
      id: 'Starter',
      name: 'Starter',
      description: 'Ideal for small web applications and early prototyping stages.',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '1,000,000 Monthly Telemetry Events',
        '250 FRIDAY AI Invocations',
        '5 GB Vector Storage Quota',
        'Standard Email Support',
        '1 Workspace Administrator',
        '7-day Metric Retention',
      ],
      popular: false,
      tierLevel: 1,
    },
    {
      id: 'Pro',
      name: 'Pro Performance',
      description: 'Full autonomy for scaling production SaaS and e-commerce setups.',
      monthlyPrice: 199,
      annualPrice: 159, // ~20% off
      features: [
        '5,000,000 Monthly Telemetry Events',
        '1,000 FRIDAY AI Invocations',
        '15 GB Vector Storage Quota',
        'Real-time Anomaly Root Cause Analysis',
        '5 Workspace Team Seats',
        '30-day Metric Retention',
        'Priority Slack & Email Support',
      ],
      popular: true,
      tierLevel: 2,
    },
    {
      id: 'Enterprise',
      name: 'Enterprise Co-Pilot',
      description: 'Dedicated infrastructure, high-concurrency agents, and guaranteed SLAs.',
      monthlyPrice: 799,
      annualPrice: 639, // ~20% off
      features: [
        '10,000,000+ Telemetry Events',
        '2,500 FRIDAY AI Invocations',
        '50 GB High-Throughput Vector DB',
        'Dedicated Autonomous Remediation Agents',
        'Unlimited Team Members & RBAC',
        '365-day Audit Retention & Compliance',
        '99.99% SLA & Dedicated Tech Lead',
      ],
      popular: false,
      tierLevel: 3,
    },
  ];

  // Helper to determine tier level of current plan
  const currentPlanTier = plans.find((p) => p.id.toLowerCase() === currentPlan.toLowerCase())?.tierLevel || 3;

  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    const success = onApplyPromo(promoInput.trim());
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Invalid or expired promo code');
    }
  };

  return (
    <section className="tier-section" id="tier-cards-section">
      <div className="tier-section__header">
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
            Subscription Plans & Quotas
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Scale telemetry throughput and autonomous AI capacity seamlessly.
          </p>
        </div>

        {/* Monthly / Annual Toggle Switch */}
        <div className="billing-toggle-container">
          <button
            type="button"
            className={`billing-toggle-btn ${billingInterval === 'monthly' ? 'billing-toggle-btn--active' : ''}`}
            onClick={() => onBillingIntervalChange('monthly')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`billing-toggle-btn ${billingInterval === 'annual' ? 'billing-toggle-btn--active' : ''}`}
            onClick={() => onBillingIntervalChange('annual')}
          >
            <span>Annual Billing</span>
            <span className="save-pill">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Promo Code Strip */}
      <div className="promo-code-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16" style={{ color: 'var(--color-accent)' }}>
            <path d="M1 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H3a2 2 0 01-2-2v-2a2 2 0 000-4V5z" />
            <line x1="8" y1="6" x2="8" y2="10" strokeDasharray="2,2" />
          </svg>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
            Promotional & Partner Discounts:
          </span>
        </div>

        {appliedPromo ? (
          <div className="promo-applied-chip">
            <span>🎉 <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountPercent}% OFF)</span>
            <button type="button" onClick={onRemovePromo} title="Remove promo code">
              ✕
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromoCode} className="promo-code-input-group">
            <input
              type="text"
              placeholder="e.g. AICTO20, STARTUP50"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError('');
              }}
            />
            <Button variant="secondary" size="sm" type="submit">
              Apply Code
            </Button>
          </form>
        )}

        {promoError && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-error)', width: '100%' }}>
            {promoError}
          </span>
        )}
      </div>

      {/* Tier Cards Grid */}
      <div className="tier-cards-grid">
        {plans.map((plan) => {
          const isCurrent = currentPlan.toLowerCase() === plan.id.toLowerCase();
          const isUpgrade = plan.tierLevel > currentPlanTier;
          const isDowngrade = plan.tierLevel < currentPlanTier;

          let rawPrice = billingInterval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          let finalPrice = rawPrice;
          let hasPromoDiscount = false;

          if (appliedPromo && rawPrice > 0) {
            finalPrice = Math.round(rawPrice * (1 - appliedPromo.discountPercent / 100));
            hasPromoDiscount = true;
          }

          return (
            <Card
              key={plan.id}
              className={`tier-card ${isCurrent ? 'tier-card--current' : ''} ${plan.popular ? 'tier-card--popular' : ''}`}
              padding="normal"
            >
              {plan.popular && !isCurrent && (
                <div className="tier-card__popular-badge">
                  <Badge variant="violet" size="sm">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="tier-card__popular-badge">
                  <Badge variant="success" size="sm" dot>Active Plan</Badge>
                </div>
              )}

              <div className="tier-card__header">
                <div className="tier-card__name">
                  {plan.name}
                </div>
                <div className="tier-card__desc">
                  {plan.description}
                </div>

                <div className="tier-card__price-box">
                  {hasPromoDiscount && (
                    <span className="tier-card__price-old">${rawPrice}</span>
                  )}
                  <span className="tier-card__price">${finalPrice}</span>
                  <span className="tier-card__period">
                    {plan.monthlyPrice === 0 ? '/ forever' : billingInterval === 'annual' ? '/ month (billed annually)' : '/ month'}
                  </span>
                </div>
              </div>

              <ul className="tier-card__features">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="tier-card__feature-item">
                    <span className="tier-card__feature-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 8 6 11 13 4" />
                      </svg>
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="tier-card__action">
                {isCurrent ? (
                  <Button
                    variant="secondary"
                    size="md"
                    style={{ width: '100%', opacity: 0.8 }}
                    disabled
                  >
                    ✓ Current Subscription
                  </Button>
                ) : plan.id === 'Enterprise' ? (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button
                      variant={isUpgrade ? 'primary' : 'secondary'}
                      size="md"
                      style={{ flex: 1 }}
                      onClick={() => onSelectPlan(plan, isUpgrade ? 'upgrade' : 'downgrade')}
                    >
                      {isUpgrade ? 'Upgrade to Enterprise' : 'Switch to Enterprise'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={onContactSales}
                      title="Contact Enterprise Sales Team"
                    >
                      Sales ↗
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={isUpgrade ? 'primary' : 'secondary'}
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => onSelectPlan(plan, isUpgrade ? 'upgrade' : 'downgrade')}
                  >
                    {isUpgrade ? `Upgrade to ${plan.name}` : `Downgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
