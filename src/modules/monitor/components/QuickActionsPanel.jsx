import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export function QuickActionsPanel({
  onAcknowledgeAlerts,
  onRestartService,
  onOpenFridayChat,
  onPurgeCache,
  activeIncidentTitle = 'Checkout Latency Spike',
}) {
  const [lastActionStatus, setLastActionStatus] = useState(null);

  const handleAction = async (actionName, callback) => {
    setLastActionStatus({ name: actionName, time: 'Executing...' });
    if (callback) {
      await callback();
    }
    setLastActionStatus({ name: actionName, time: 'Completed just now' });
    setTimeout(() => setLastActionStatus(null), 4000);
  };

  return (
    <Card className="quick-actions-card" padding="compact">
      <div className="quick-actions-header">
        <div className="quick-actions-header__left">
          <span className="quick-actions-header__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <div>
            <h4 className="quick-actions-header__title">Incident Quick Actions</h4>
            <p className="quick-actions-header__desc">Immediate mitigation controls for active anomalies</p>
          </div>
        </div>

        {lastActionStatus && (
          <Badge variant="success" size="sm">
            {lastActionStatus.name}: {lastActionStatus.time}
          </Badge>
        )}
      </div>

      <div className="quick-actions-grid">
        {/* Acknowledge All Alerts */}
        <Button
          variant="secondary"
          size="sm"
          className="quick-action-btn"
          onClick={() => handleAction('Alerts Acknowledged', onAcknowledgeAlerts)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        >
          Acknowledge Alerts
        </Button>

        {/* Restart Degraded Service */}
        <Button
          variant="danger"
          size="sm"
          className="quick-action-btn"
          onClick={() => handleAction('Service Restart Scheduled', onRestartService)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          }
        >
          Restart Service
        </Button>

        {/* Deep link into FRIDAY AI Chat */}
        <Button
          variant="primary"
          size="sm"
          className="quick-action-btn quick-action-btn--ai"
          onClick={() => onOpenFridayChat && onOpenFridayChat({ incident: activeIncidentTitle })}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          }
        >
          Consult FRIDAY AI
        </Button>

        {/* Purge Edge CDN */}
        <Button
          variant="secondary"
          size="sm"
          className="quick-action-btn"
          onClick={() => handleAction('CDN Cache Invalidation Sent', onPurgeCache)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          }
        >
          Purge Edge CDN
        </Button>
      </div>
    </Card>
  );
}
