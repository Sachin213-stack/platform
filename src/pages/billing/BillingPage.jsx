import React from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';

export default function BillingPage({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'dashboardFadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Billing & Usage Subscriptions
            </h2>
            <Badge variant="violet" size="sm">Enterprise Plan</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage compute quotas, autonomous agent credits, and invoice history.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => onNavigate && onNavigate('dashboard')}>
          ← Return to Dashboard
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <Card padding="normal">
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            Monthly Telemetry Compute
          </h4>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            4.2M / 10M Events
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: '42%', height: '100%', background: 'var(--color-accent)', borderRadius: '999px' }} />
          </div>
        </Card>

        <Card padding="normal">
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            FRIDAY AI Agent Invocations
          </h4>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            842 / 2,500 Actions
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: '33.6%', height: '100%', background: 'var(--color-status-success)', borderRadius: '999px' }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
