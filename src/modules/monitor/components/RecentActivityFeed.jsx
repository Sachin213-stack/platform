import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { RECENT_ACTIVITY_FEED } from '../dashboardData';

export function RecentActivityFeed({
  activities = RECENT_ACTIVITY_FEED,
  initialExpanded = false,
}) {
  const [isOpen, setIsOpen] = useState(initialExpanded);

  return (
    <Card className="activity-feed-card" padding="compact">
      <button
        type="button"
        className="activity-feed-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="activity-feed-trigger__left">
          <span className="activity-feed-trigger__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          </span>
          <div>
            <h4 className="activity-feed-trigger__title">Recent Activity & Audit Timeline</h4>
            <p className="activity-feed-trigger__desc">Deployments, WAF adjustments, config diffs ({activities.length} recent)</p>
          </div>
        </div>

        <div className="activity-feed-trigger__right">
          <span className="activity-feed-trigger__state-label">{isOpen ? 'Collapse' : 'Expand Feed'}</span>
          <svg
            className={`activity-feed-trigger__chevron ${isOpen ? 'activity-feed-trigger__chevron--open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="activity-feed-body">
          <div className="activity-timeline">
            {activities.map((act) => (
              <div key={act.id} className="activity-timeline-item">
                {/* Timeline node */}
                <div className="activity-timeline-node">
                  <div className="activity-actor-avatar" title={`${act.actor} (${act.role})`}>
                    {act.avatar}
                  </div>
                  <div className="activity-timeline-line" />
                </div>

                {/* Content */}
                <div className="activity-timeline-content">
                  <div className="activity-timeline-header">
                    <div className="activity-timeline-actor-info">
                      <span className="activity-actor-name">{act.actor}</span>
                      <span className="activity-actor-role">· {act.role}</span>
                    </div>
                    <span className="activity-timestamp">{act.timestamp}</span>
                  </div>

                  <div className="activity-action-row">
                    <span className="activity-action-desc">{act.action}</span>
                    <Badge variant={act.badgeVariant || 'neutral'} size="sm">
                      {act.badge}
                    </Badge>
                  </div>

                  <div className="activity-target-row">
                    <span className="activity-target-label">Target:</span>
                    <code className="activity-target-code">{act.target}</code>
                    {act.hash && (
                      <span className="activity-hash-badge">{act.hash}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
