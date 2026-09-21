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

    case 'fintech':
      return [
        {
          id: 'tx-velocity',
          label: 'Settlement Velocity',
          value: '1,840',
          unit: 'tx/s',
          delta: '+14.6%',
          deltaType: 'positive',
          progress: 84,
          state: isLive ? 'live' : 'stale',
          subtext: 'ISO-8583 settlement wire gateway',
          status: 'healthy',
        },
        {
          id: 'fraud-rate',
          label: 'AI AML / Fraud Screen',
          value: '0.02%',
          unit: '%',
          delta: '-0.01%',
          deltaType: 'positive',
          progress: 8,
          state: isLive ? 'live' : 'stale',
          subtext: 'Real-time anomaly scoring',
          status: 'healthy',
        },
        {
          id: 'ledger-sync',
          label: 'Ledger Consensus Latency',
          value: '18ms',
          unit: 'ms',
          delta: '-4.2%',
          deltaType: 'positive',
          progress: 18,
          state: isLive ? 'live' : 'stale',
          subtext: '99.999% consensus quorum',
          status: 'healthy',
        },
      ];

    case 'marketplace':
      return [
        {
          id: 'merchant-orders',
          label: 'Merchant Gross Orders',
          value: '142',
          unit: 'orders/m',
          delta: '+11.8%',
          deltaType: 'positive',
          progress: 74,
          state: isLive ? 'live' : 'stale',
          subtext: 'Cross-vendor fulfillment',
          status: 'healthy',
        },
        {
          id: 'vendor-payout',
          label: 'Payout Disbursement SLA',
          value: '99.94%',
          unit: '%',
          delta: '+0.05%',
          deltaType: 'positive',
          progress: 99,
          state: isLive ? 'live' : 'stale',
          subtext: 'Automated Stripe Connect batching',
          status: 'healthy',
        },
        {
          id: 'clicks-min',
          label: 'Catalog Search Velocity',
          value: '4,280',
          unit: 'queries/m',
          delta: '+8.4%',
          deltaType: 'positive',
          progress: 71,
          state: isLive ? 'live' : 'stale',
          subtext: 'OpenSearch index cluster',
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
  hasLiveData = false,
  liveTierMetrics = null,
}) {
  const baseMetrics = getBusinessTierMetrics(businessType, isLive);

  // If live data exists from backend tier_metrics, inject real values
  const metrics = React.useMemo(() => {
    if (!hasLiveData || !liveTierMetrics) return baseMetrics;
    return baseMetrics.map((m) => {
      if (m.id === 'orders-min') {
        const val = liveTierMetrics.orders_min !== undefined ? String(liveTierMetrics.orders_min) : m.value;
        return { ...m, value: val, subtext: 'Calculated from live transaction events', state: 'live' };
      }
      if (m.id === 'mrr-velocity') {
        const val = liveTierMetrics.mrr_velocity !== undefined ? String(liveTierMetrics.mrr_velocity) : m.value;
        return { ...m, value: val, subtext: 'Calculated from live signup events', state: 'live' };
      }
      if (m.id === 'tx-velocity') {
        const val = liveTierMetrics.tx_velocity !== undefined ? Number(liveTierMetrics.tx_velocity).toLocaleString() : m.value;
        return { ...m, value: val, subtext: 'Live settlement throughput', state: 'live' };
      }
      if (m.id === 'fraud-rate') {
        const val = liveTierMetrics.fraud_rate !== undefined ? `${liveTierMetrics.fraud_rate}%` : m.value;
        return { ...m, value: val, subtext: 'Real-time AML screen', state: 'live' };
      }
      if (m.id === 'ledger-sync') {
        const val = liveTierMetrics.ledger_latency !== undefined ? `${liveTierMetrics.ledger_latency}ms` : m.value;
        return { ...m, value: val, subtext: 'Consensus quorum ping', state: 'live' };
      }
      if (m.id === 'merchant-orders') {
        const val = liveTierMetrics.merchant_orders !== undefined ? String(liveTierMetrics.merchant_orders) : m.value;
        return { ...m, value: val, subtext: 'Multi-vendor gross orders', state: 'live' };
      }
      if (m.id === 'churn-risk' || m.id === 'cart-abandon') {
        const val = liveTierMetrics.auth_failure_rate !== undefined ? `${liveTierMetrics.auth_failure_rate}%` : m.value;
        return { ...m, value: val, subtext: 'Live HTTP failure rate', state: 'live' };
      }
      if (m.id === 'active-sessions') {
        const val = liveTierMetrics.active_sessions !== undefined ? Number(liveTierMetrics.active_sessions).toLocaleString() : m.value;
        return { ...m, value: val, subtext: 'Real-time telemetry event sessions', state: 'live' };
      }
      if (m.id === 'streams-min') {
        const val = liveTierMetrics.streams_min !== undefined ? Number(liveTierMetrics.streams_min).toLocaleString() : m.value;
        return { ...m, value: val, subtext: 'Live stream ingestion rate', state: 'live' };
      }
      if (m.id === 'clicks-min') {
        const val = liveTierMetrics.clicks_min !== undefined ? Number(liveTierMetrics.clicks_min).toLocaleString() : m.value;
        return { ...m, value: val, subtext: 'Live catalog event rate', state: 'live' };
      }
      return m;
    });
  }, [baseMetrics, hasLiveData, liveTierMetrics]);

  return (
    <div className="business-metrics-section">
      <div className="business-metrics-header">
        <h3 className="business-metrics-header__title">Business Domain Metrics</h3>
        <span className="business-metrics-header__tag">
          {hasLiveData ? '⚡ Live Ingested Telemetry Stream' : 'Demo Baseline Telemetry'}
        </span>
      </div>

      <div className="business-metrics-grid">
        {metrics.map((metric) => {
          const liveLabel = isSyncing
            ? 'SYNCING'
            : hasLiveData
            ? 'LIVE'
            : 'DEMO';

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
                  className={`biz-live-badge biz-live-badge--${hasLiveData ? 'live' : 'stale'}`}
                  title={hasLiveData ? 'Real-time website stream active' : 'Starter demo model'}
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
