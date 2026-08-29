import React from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { HISTORICAL_DECISION_LOGS } from '../monitor/dashboardData';

export default function AuditLogPage({ onNavigate }) {

  const auditEntries = [
    ...HISTORICAL_DECISION_LOGS,
    {
      id: 'dec-86',
      timestamp: '2 days ago',
      actor: 'Sarah Jenkins (SRE Lead)',
      action: 'Rotated API Key & Token for Stripe Production Webhooks',
      impact: 'Zero failed webhook calls across 14,000 transactions.',
      confidence: 'Verified',
      status: 'Resolved',
    },
    {
      id: 'dec-85',
      timestamp: '3 days ago',
      actor: 'FRIDAY AI Optimizer',
      action: 'Auto-scaled SQS processing worker pods from 6 to 18 during flash sale peak',
      impact: 'Queue backlog eliminated within 90 seconds.',
      confidence: '99.9%',
      status: 'Applied',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'dashboardFadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Audit & Autonomous Decision Log
            </h2>
            <Badge variant="violet" size="sm">Immutable Ledger</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Complete historical audit trail of all automated AI mitigations and engineer actions.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => onNavigate && onNavigate('dashboard')}>
          ← Return to Dashboard
        </Button>
      </div>

      <Card padding="normal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {auditEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {entry.actor}
                  </span>
                  <Badge variant="violet" size="sm">{entry.status}</Badge>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {entry.timestamp}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {entry.action}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                Outcome: {entry.impact}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
