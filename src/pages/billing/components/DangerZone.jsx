import React from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';

export function DangerZone({
  currentPlan = 'Enterprise',
  hasActiveSubscription = true,
  onCancelSubscriptionClick,
  onRemoveAllPaymentMethodsClick,
}) {
  return (
    <Card variant="danger" padding="normal">
      <CardHeader
        title="Danger Zone"
        subtitle="Irreversible billing adjustments, contract terminations, and payment method purges"
      />

      <CardBody>
        <div className="billing-danger-zone">
          {/* Action 1: Cancel Subscription */}
          <div className="danger-action-row">
            <div className="danger-action-row__text">
              <div className="danger-action-row__title">
                Cancel {currentPlan} Subscription
              </div>
              <div className="danger-action-row__desc">
                Immediately freeze autonomous agent remediation and downgrade workspace to Starter tier at the conclusion of the current billing cycle.
              </div>
            </div>
            <div>
              <Button
                variant="danger"
                size="sm"
                onClick={onCancelSubscriptionClick}
                disabled={currentPlan.toLowerCase() === 'starter'}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>

          {/* Action 2: Purge Payment Methods */}
          <div className="danger-action-row">
            <div className="danger-action-row__text">
              <div className="danger-action-row__title">
                Purge All Saved Payment Methods
              </div>
              <div className="danger-action-row__desc">
                Remove all credit and debit cards stored in your vault. Cannot be completed while an active paid subscription ({currentPlan}) is active.
              </div>
            </div>
            <div>
              <Button
                variant="danger"
                size="sm"
                onClick={onRemoveAllPaymentMethodsClick}
              >
                Remove All Cards
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
