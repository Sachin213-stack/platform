import React from 'react';
import { Card } from '../../../shared/components/Card';

/**
 * Business-Specific 2nd Tier Metrics Generator
 * Dynamic for E-Commerce, SaaS, Media/Streaming, FinTech.
 */
export function getBusinessTierMetrics(businessType = 'ecommerce', isLive = true) {
  switch (businessType) {
    case 'saas':
      return [
        {
          id: 'mrr-velocity',
          label: 'Active Signups / Hour',
          value: '184',
          unit: 'signups/h',
          delta: '+12.4%',
          deltaType: 'positive',
          progress: 82,
          state: isLive ? 'live' : 'stale',
          subtext: '48 paid upgrades converted',
          status: 'healthy',
        },
        {
          id: 'churn-risk',
          label: 'Auth / Token Failure Rate',
          value: '0.42%',
          unit: '%',
          delta: '-0.18%',
          deltaType: 'positive',
          progress: 14,
          state: isLive ? 'live' : 'stale',
          subtext: 'Threshold: < 1.0%',
          status: 'healthy',
        },
        {
          id: 'active-sessions',
          label: 'Concurrent Active Orgs',
          value: '3,840',
          unit: 'tenants',
          delta: '+7.6%',
          deltaType: 'positive',
          progress: 76,
          state: isLive ? 'live' : 'stale',
          subtext: '99.4% websocket pool capacity',
          status: 'healthy',
        },
      ];

    case 'content':
      return [
        {
          id: 'streams-min',
          label: 'Concurrent Video Streams',
          value: '34,920',
          unit: 'streams',
          delta: '+18.9%',
          deltaType: 'positive',
          progress: 88,
          state: isLive ? 'live' : 'stale',
          subtext: 'Peak bandwidth: 48.2 Gbps',
          status: 'healthy',
        },
        {
          id: 'buffer-stalls',
          label: 'Playback Re-buffer Ratio',
          value: '0.28%',
          unit: '%',
          delta: '-0.06%',
          deltaType: 'positive',
          progress: 12,
          state: isLive ? 'live' : 'stale',
          subtext: 'SLA target: < 0.5%',
          status: 'healthy',
        },
        {
          id: 'ad-impressions',
          label: 'Ad Impression Fill Rate',
          value: '98.6%',
          unit: '%',
          delta: '+1.2%',
          deltaType: 'positive',
          progress: 98,
          state: isLive ? 'live' : 'stale',
          subtext: 'CPM Realized: $14.20',
          status: 'healthy',
        },
      ];

    case 'ecommerce':
    default:
      return [
        {
          id: 'orders-min',
          label: 'Orders / Minute',
          value: '38.4',
          unit: 'orders/m',
          delta: '+14.2%',
          deltaType: 'positive',
          progress: 78,
          state: isLive ? 'live' : 'stale',
          subtext: 'Peak today: 64 orders/min',
          status: 'healthy',
        },
        {
          id: 'checkout-failure',
          label: 'Checkout Failure Rate',
          value: '1.84%',
          unit: '%',
          delta: '+0.42%',
          deltaType: 'negative',
          progress: 38,
          state: isLive ? 'live' : 'stale',
          subtext: 'Trigger: > 1.5% warning',
          status: 'warning',
        },
        {
          id: 'clicks-min',
          label: 'Catalog Clicks / Min',
          value: '1,420',
          unit: 'clicks/m',
          delta: '+8.9%',
          deltaType: 'positive',
          progress: 68,
          state: isLive ? 'live' : 'stale',
          subtext: 'Avg cart add velocity: 210/min',
          status: 'healthy',
        },
      ];
  }
}

export function BusinessMetricsRow({
  businessType = 'ecommerce',
  isLive = true,
  isSyncing = false,
}) {
  const metrics = getBusinessTierMetrics(businessType, isLive);

  return (
    <div className="business-metrics-section">
      <div className="business-metrics-header">
        <h3 className="business-metrics-header__title">Business Domain Metrics</h3>
        <span className="business-metrics-header__tag">Tier 2 Conversion & Revenue Telemetry</span>
      </div>

      <div className="business-metrics-grid">
        {metrics.map((metric) => {
          const liveLabel = isSyncing
            ? 'SYNCING'
            : isLive
            ? 'LIVE'
            : 'STALE';

          const statusClass = metric.status === 'warning' ? 'biz-card--warning' : '';

          return (
            <Card
              key={metric.id}
              className={`biz-card ${statusClass}`}
              padding="compact"
            >
              <div className="biz-card__top">
                <span className="biz-card__label">{metric.label}</span>
                <span
                  className={`biz-live-badge biz-live-badge--${liveLabel.toLowerCase()}`}
                  title={isLive ? 'Real-time telemetry stream active' : 'Offline stream'}
                >
                  <span className="biz-live-badge__dot" />
                  {liveLabel}
                </span>
              </div>

              <div className="biz-card__content">
                <div className="biz-card__value-row">
                  <div className="biz-card__val">{metric.value}</div>
                  <span
                    className={`biz-card__delta ${metric.deltaType === 'positive' ? 'biz-card__delta--pos' : 'biz-card__delta--neg'}`}
                  >
                    {metric.delta}
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="biz-card__progress-track">
                  <div
                    className={`biz-card__progress-fill ${metric.status === 'warning' ? 'biz-card__progress-fill--warning' : ''}`}
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>

                <div className="biz-card__subtext">{metric.subtext}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
