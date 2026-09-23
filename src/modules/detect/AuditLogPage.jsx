import React, { useState, useEffect } from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { dashboardApi } from '../../shared/services/apiClient';

export default function AuditLogPage({ onNavigate }) {
  const [liveEntries, setLiveEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.getAuditLogs();
      if (res && res.entries && res.entries.length > 0) {
        const mapped = res.entries.map((e) => ({
          id: e.id,
          timestamp: e.timestamp || (e.executed_at ? new Date(e.executed_at).toLocaleString() : 'Recent'),
          actor: e.actor || 'FRIDAY Autonomous AI',
          action: e.action || e.message || `Action executed on ${e.service || 'service'}`,
          impact: e.impact || `Confidence: ${e.confidence || '99.5%'} | Target: ${e.service || 'cluster'}`,
          status: e.status || 'Executed',
          isLive: true,
        }));
        setLiveEntries(mapped);
      }
    } catch (err) {
      console.warn('Failed to load live audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const auditEntries = liveEntries;

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

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={loadLogs} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : '🔄 Refresh Ledger'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate && onNavigate('dashboard')}>
            ← Return to Dashboard
          </Button>
        </div>
      </div>

      <Card padding="normal">
        {auditEntries.length === 0 ? (
          <div style={{ padding: 'var(--space-8) var(--space-4)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-light)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              No Autonomous Actions Recorded Yet
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
              The immutable decision ledger records autonomous AI mitigations, auto-healing directives, and configuration changes as telemetry events and anomalies are analyzed.
            </p>
          </div>
        ) : (
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
                    <Badge variant={entry.isLive ? "success" : "violet"} size="sm">
                      {entry.isLive ? `Live: ${entry.status}` : entry.status}
                    </Badge>
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
        )}
      </Card>
    </div>
  );
}
