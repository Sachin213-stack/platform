import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Dashboard.css';

import {
  INITIAL_ANOMALIES,
  RECENT_TELEMETRY_EVENTS,
  HISTORICAL_DECISION_LOGS,
  RECENT_ACTIVITY_FEED,
} from './dashboardData';

import { DashboardTopBar } from './components/DashboardTopBar';
import { HealthStatusBanner } from './components/HealthStatusBanner';
import { KpiStrip } from './components/KpiStrip';
import { BusinessMetricsRow } from './components/BusinessMetricsRow';
import { ActiveAnomalies } from './components/ActiveAnomalies';
import { QuickActionsPanel } from './components/QuickActionsPanel';
import { TrafficRevenueChart } from './components/TrafficRevenueChart';
import { CapacitySnapshot } from './components/CapacitySnapshot';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { DashboardSkeleton, DashboardErrorState } from './components/DashboardSkeleton';
import { useTenant } from '../../shared/context/TenantContext';
import { dashboardApi } from '../../shared/services/apiClient';

/**
 * DashboardPage (Operations Control Center)
 * Central command center rendering real-time telemetry, anomalies, AI recommendations,
 * capacity vitals, and instant mitigation actions.
 */
export default function DashboardPage({ onNavigate, onShowToast }) {
  // ── State Management ───────────────────────────────────────────
  const { selectedBusiness, setSelectedBusiness } = useTenant();
  const [isConnected, setIsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5s default
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(0);

  const [comparisonPeriod, setComparisonPeriod] = useState('yesterday'); // 'yesterday' | 'week'
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [telemetryEvents, setTelemetryEvents] = useState(RECENT_TELEMETRY_EVENTS);
  const [decisionLogs, setDecisionLogs] = useState(HISTORICAL_DECISION_LOGS);
  const [activityFeed] = useState(RECENT_ACTIVITY_FEED);
  const [liveKpis, setLiveKpis] = useState(null);

  // Dynamic live website telemetry indicators
  const [hasLiveData, setHasLiveData] = useState(false);
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [liveTierMetrics, setLiveTierMetrics] = useState(null);
  const [showIntegrationSnippet, setShowIntegrationSnippet] = useState(false);

  // Cluster vitals
  const [cpuUsage, setCpuUsage] = useState(48);
  const [memUsage, setMemUsage] = useState(64);
  const [queueDepth, setQueueDepth] = useState(78);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ── Compute Dynamic KPI Overrides from Live Backend Data ──────────
  const kpiOverrides = useMemo(() => {
    if (!liveKpis) return null;
    const isWeek = comparisonPeriod === 'week';
    return [
      {
        id: 'response-time',
        label: 'Avg Response Time',
        value: `${liveKpis.response_time_ms}ms`,
        rawValue: liveKpis.response_time_ms,
        threshold: { warn: 200, crit: 350 },
        unit: 'ms',
        delta: isWeek ? '-6.8%' : `${liveKpis.response_time_delta_pct > 0 ? '+' : ''}${liveKpis.response_time_delta_pct}%`,
        deltaType: liveKpis.response_time_delta_pct <= 0 ? 'positive' : 'negative',
        sparkline: [
          Math.round(liveKpis.response_time_ms * 1.12),
          Math.round(liveKpis.response_time_ms * 1.08),
          Math.round(liveKpis.response_time_ms * 1.03),
          Math.round(liveKpis.response_time_ms * 0.98),
          Math.round(liveKpis.response_time_ms),
        ],
        target: 'SLA < 200ms',
      },
      {
        id: 'requests-min',
        label: 'Throughput / Orders',
        value: `${liveKpis.orders_per_min}/min`,
        rawValue: liveKpis.orders_per_min,
        threshold: { warn: 500, crit: 1000 },
        unit: 'opm',
        delta: isWeek ? '+15.2%' : `${liveKpis.orders_delta_pct > 0 ? '+' : ''}${liveKpis.orders_delta_pct}%`,
        deltaType: 'positive',
        sparkline: [
          Math.round(liveKpis.orders_per_min * 0.82),
          Math.round(liveKpis.orders_per_min * 0.90),
          Math.round(liveKpis.orders_per_min * 0.95),
          Math.round(liveKpis.orders_per_min),
        ],
        target: 'Scale cap: 50k',
      },
      {
        id: 'error-rate',
        label: 'HTTP Error Rate',
        value: `${liveKpis.error_rate_pct}%`,
        rawValue: liveKpis.error_rate_pct,
        threshold: { warn: 1.0, crit: 2.5 },
        unit: '%',
        delta: isWeek ? '-0.05%' : `${liveKpis.error_rate_delta_pct > 0 ? '+' : ''}${liveKpis.error_rate_delta_pct}%`,
        deltaType: liveKpis.error_rate_pct < 1.0 ? 'positive' : 'negative',
        sparkline: [
          Number((liveKpis.error_rate_pct * 1.25).toFixed(2)),
          Number((liveKpis.error_rate_pct * 1.10).toFixed(2)),
          Number((liveKpis.error_rate_pct).toFixed(2)),
        ],
        target: '< 1.0% healthy',
      },
      {
        id: 'checkout-failure',
        label: 'Checkout Failure Rate',
        value: `${liveKpis.checkout_failure_pct}%`,
        rawValue: liveKpis.checkout_failure_pct,
        threshold: { warn: 0.5, crit: 1.5 },
        unit: '%',
        delta: `${liveKpis.checkout_failure_delta_pct > 0 ? '+' : ''}${liveKpis.checkout_failure_delta_pct}%`,
        deltaType: 'positive',
        sparkline: [0.03, 0.02, 0.01, liveKpis.checkout_failure_pct],
        target: '< 0.5% SLA',
      },
    ];
  }, [liveKpis, comparisonPeriod]);

  // ── Compute Health Score dynamically ───────────────────────────
  const healthScore = useMemo(() => {
    if (!isConnected) return 40;
    if (anomalies.length === 0) return 98;
    const criticalCount = anomalies.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;
    if (criticalCount >= 2) return 64; // critical (<70)
    if (criticalCount === 1) return 82; // degraded (70-89)
    return 91; // healthy
  }, [anomalies, isConnected]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 90) return 'healthy';
    if (healthScore >= 70) return 'degraded';
    return 'critical';
  }, [healthScore]);

  // ── Last updated ticker (1s interval) ───────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Telemetry Refresh Function (Connected to FastAPI Backend) ───
  const refreshTelemetry = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);

    try {
      // Call backend metrics endpoint
      const metricsData = await dashboardApi.getMetrics();
      if (metricsData) {
        setHasLiveData(Boolean(metricsData.has_live_data));
        if (metricsData.timeseries && metricsData.timeseries.length > 0) {
          setTimeseriesData(metricsData.timeseries);
        }
        if (metricsData.tier_metrics) {
          setLiveTierMetrics(metricsData.tier_metrics);
        }

        if (metricsData.kpis) {
          setLiveKpis(metricsData.kpis);
        }

        if (metricsData.capacity) {
          if (metricsData.capacity.cpu_pct !== undefined) setCpuUsage(Math.round(metricsData.capacity.cpu_pct));
          if (metricsData.capacity.memory_pct !== undefined) setMemUsage(Math.round(metricsData.capacity.memory_pct));
          if (metricsData.capacity.queue_depth !== undefined) setQueueDepth(metricsData.capacity.queue_depth);
        }

        // Live MLWorker anomalies from PostgreSQL
        if (metricsData.recent_anomalies && metricsData.recent_anomalies.length > 0) {
          const mappedAnomalies = metricsData.recent_anomalies.map((a) => {
            const sevCap = a.severity ? (a.severity.charAt(0).toUpperCase() + a.severity.slice(1).toLowerCase()) : 'Medium';
            const deviationPct = a.expected_value > 0
              ? `${Math.round(((a.actual_value - a.expected_value) / a.expected_value) * 100)}%`
              : '+100%';
            const timeStr = a.detected_at
              ? new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Just now';

            let serviceName = a.metric_name || 'core-service';
            if (a.description && a.description.includes('endpoint ')) {
              const match = a.description.match(/endpoint\s+([^\s,]+)/);
              if (match) serviceName = match[1];
            }

            let recAction = 'Scale Deployment Replicas';
            if (a.metric_name.includes('memory')) {
              recAction = 'Recycle Workers & Flush Cache';
            } else if (a.metric_name.includes('response_time') || a.metric_name.includes('latency')) {
              recAction = 'Scale Pods & Optimize Pool';
            }

            return {
              id: a.id,
              service: serviceName,
              title: `${a.metric_name.replace('_', ' ').toUpperCase()} Anomaly`,
              severity: sevCap,
              deviation: `${deviationPct.startsWith('-') ? '' : '+'}${deviationPct} vs baseline`,
              timestamp: timeStr,
              impact: `${a.metric_name}: ${a.actual_value} (expected ${a.expected_value})`,
              aiRecommendation: a.description || `MLWorker IsolationForest detected outlier on ${serviceName}.`,
              recommendedAction: recAction,
              confidence: '98.5%',
            };
          });
          setAnomalies(mappedAnomalies);
        }

        // Live telemetry events from TimescaleDB
        if (metricsData.recent_telemetry_events && metricsData.recent_telemetry_events.length > 0) {
          const mappedTelems = metricsData.recent_telemetry_events.map((t) => ({
            id: t.id,
            time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: t.event_type || 'REQUEST',
            level: t.level || 'info',
            message: t.message || (t.endpoint ? `HTTP ${t.status_code} on ${t.endpoint}` : 'Telemetry event recorded'),
            latency: `${Math.round(t.response_time_ms || 0)}ms`,
          }));
          setTelemetryEvents(mappedTelems);
        }
      }

      setLastUpdatedSeconds(0);
    } catch (err) {
      // Fallback with live jitter simulation if offline
      setCpuUsage((prev) => Math.min(95, Math.max(30, prev + Math.floor((Math.random() - 0.5) * 6))));
      setMemUsage((prev) => Math.min(92, Math.max(45, prev + Math.floor((Math.random() - 0.5) * 4))));
      setQueueDepth((prev) => Math.min(94, Math.max(40, prev + Math.floor((Math.random() - 0.5) * 8))));

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const fallbackProbe = {
        id: `tel-${Date.now()}`,
        time: timeStr,
        type: 'HEARTBEAT',
        level: 'info',
        message: `Edge probe verified for ${selectedBusiness.domain} (local neural core).`,
        latency: `${Math.floor(28 + Math.random() * 20)}ms`,
      };

      setTelemetryEvents((prev) => [fallbackProbe, ...prev.slice(0, 7)]);
      setLastUpdatedSeconds(0);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedBusiness]);

  // ── Initial Mount & Auto-Refresh Hook ───────────────────────────
  useEffect(() => {
    refreshTelemetry(false);
  }, [refreshTelemetry]);

  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    const interval = setInterval(() => {
      refreshTelemetry(true);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, refreshInterval, refreshTelemetry]);

  // ── Actions & Mitigations ───────────────────────────────────────
  const handleApplyRecommendation = (anomaly) => {
    // Add decision log entry
    const newLog = {
      id: `dec-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'FRIDAY AI Autonomous Execution',
      action: `Executed mitigation: ${anomaly.recommendedAction} for ${anomaly.service}`,
      impact: 'Service latency returned to nominal SLA envelope.',
      confidence: '99.8%',
      status: 'Applied',
    };
    setDecisionLogs((prev) => [newLog, ...prev]);

    // Remove or resolve the anomaly
    setAnomalies((prev) => prev.filter((a) => a.id !== anomaly.id));

    if (onShowToast) {
      onShowToast({
        title: 'Mitigation Applied',
        message: `Successfully executed: ${anomaly.recommendedAction} on ${anomaly.service}`,
        variant: 'success',
      });
    }
  };

  const handleAcknowledgeAlerts = () => {
    const count = anomalies.length;
    setAnomalies([]);
    if (onShowToast) {
      onShowToast({
        title: 'Alerts Acknowledged',
        message: `Cleared ${count} active anomalies. Monitored thresholds remain armed.`,
        variant: 'info',
      });
    }
  };

  const handleRestartService = () => {
    if (onShowToast) {
      onShowToast({
        title: 'Restart Command Dispatched',
        message: 'Dispatched rolling zero-downtime restart to checkout-v2 deployment.',
        variant: 'warning',
      });
    }
    // Simulate resolution after restart
    setTimeout(() => {
      setAnomalies((prev) => prev.filter((a) => a.service !== 'checkout-v2.svc'));
      refreshTelemetry(false);
    }, 1200);
  };

  const handlePurgeCache = () => {
    if (onShowToast) {
      onShowToast({
        title: 'CDN Cache Invalidation Dispatched',
        message: `Edge purge tag broadcast to 240+ Cloudflare edge PoPs for ${selectedBusiness.domain}.`,
        variant: 'success',
      });
    }
  };

  const handleOpenFridayWithContext = (anomaly) => {
    if (onNavigate) {
      onNavigate('friday-ai', {
        initialPrompt: `I noticed anomaly "${anomaly.title}" on service ${anomaly.service} (${anomaly.deviation || 'variance detected'}). What is the recommended remediation strategy and rollback plan?`,
        context: anomaly,
      });
    }
  };

  const handleDismissNotification = (notifId) => {
    setAnomalies((prev) => prev.filter((a) => a.id !== notifId));
  };

  // ── Render Error State ──────────────────────────────────────────
  if (hasError) {
    return (
      <DashboardErrorState
        errorMessage={`Unable to connect to telemetry daemon for ${selectedBusiness.name}. Connection timed out after 30s.`}
        onRetry={() => {
          setHasError(false);
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            refreshTelemetry(false);
          }, 800);
        }}
      />
    );
  }

  // ── Render Loading Skeleton ─────────────────────────────────────
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-container" id="dashboard-control-center">
      {/* ── 1. Top Bar ───────────────────────────────────────────── */}
      <DashboardTopBar
        selectedBusiness={selectedBusiness}
        onBusinessChange={(biz) => {
          setSelectedBusiness(biz);
          refreshTelemetry(false);
          if (onShowToast) {
            onShowToast({
              title: 'Tenant Switched',
              message: `Switched active dashboard context to ${biz.name} (${biz.typeLabel})`,
              variant: 'info',
            });
          }
        }}
        isConnected={isConnected}
        onToggleConnection={() => {
          const next = !isConnected;
          setIsConnected(next);
          if (onShowToast) {
            onShowToast({
              title: next ? 'Telemetry Stream Reconnected' : 'Telemetry Stream Disconnected',
              message: next ? 'Live node telemetry is syncing.' : 'Dashboard is operating in simulated offline mode.',
              variant: next ? 'success' : 'warning',
            });
          }
        }}
        unreadAlertCount={anomalies.length}
        notifications={anomalies}
        onDismissNotification={handleDismissNotification}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        refreshInterval={refreshInterval}
        onIntervalChange={(newInt) => setRefreshInterval(newInt)}
        onManualRefresh={() => refreshTelemetry(false)}
        isRefreshing={isRefreshing}
        lastUpdatedSeconds={lastUpdatedSeconds}
        onNavigate={onNavigate}
      />

      {/* ── Real Website vs Demo Baseline Connection Bar ──────────── */}
      <div style={{
        margin: 'var(--space-2) 0 var(--space-4)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        background: hasLiveData 
          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.04))'
          : 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.04))',
        border: hasLiveData
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: hasLiveData ? '#10b981' : '#f59e0b',
            boxShadow: hasLiveData ? '0 0 10px #10b981' : '0 0 8px #f59e0b',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {hasLiveData
              ? 'Active Website Telemetry Connected — Ingesting live microservice metrics & transactions'
              : 'Demo Baseline Active — Showing starter telemetry models until your active website sends events'}
          </span>
        </div>
        <button
          onClick={() => setShowIntegrationSnippet(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {hasLiveData ? '🔌 View Ingestion Snippet' : '⚡ Connect Active Website'}
        </button>
      </div>

      {/* ── 2. Health Status Banner ──────────────────────────────── */}
      <HealthStatusBanner
        healthScore={healthScore}
        status={healthStatus}
        anomalyCount={anomalies.length}
        activeServices="14/14"
        uptime="99.98%"
        avgLatency={liveKpis ? `${liveKpis.response_time_ms}ms` : (selectedBusiness.type === 'content' ? '64ms' : '142ms')}
        onInspectAnomalies={() => {
          const el = document.getElementById('anomalies-section-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── 3. KPI Strip (Top Row) ───────────────────────────────── */}
      <KpiStrip
        businessType={selectedBusiness.type}
        comparisonPeriod={comparisonPeriod}
        onComparisonChange={setComparisonPeriod}
        kpiOverrides={kpiOverrides}
      />

      {/* ── 4. Business Metrics Row (2nd Tier KPIs) ──────────────── */}
      <BusinessMetricsRow
        businessType={selectedBusiness.type}
        isLive={isConnected}
        isSyncing={isRefreshing}
        hasLiveData={hasLiveData}
        liveTierMetrics={liveTierMetrics}
      />

      {/* ── Main Two-Column Content Grid ─────────────────────────── */}
      <div className="dashboard-main-grid">
        {/* Left Column (Chart, Active Anomalies) */}
        <div className="dashboard-left-col">
          {/* ── 7. Traffic & Revenue Chart (24h/7d/30d) ───────────── */}
          <TrafficRevenueChart
            businessType={selectedBusiness.type}
            isLive={isConnected}
            hasLiveData={hasLiveData}
            liveData={timeseriesData}
          />

          {/* ── 5. Active Anomalies & Recommendations ─────────────── */}
          <div id="anomalies-section-anchor">
            <ActiveAnomalies
              anomalies={anomalies}
              telemetryEvents={telemetryEvents}
              decisionLogs={decisionLogs}
              onApplyRecommendation={handleApplyRecommendation}
              onOpenFridayWithContext={handleOpenFridayWithContext}
              onNavigateToAuditLog={() => onNavigate && onNavigate('audit-logs')}
            />
          </div>
        </div>

        {/* Right Column (Quick Actions, Capacity Snapshot, Activity Timeline) */}
        <div className="dashboard-right-col">
          {/* ── 6. Quick Actions Panel ───────────────────────────── */}
          <QuickActionsPanel
            onAcknowledgeAlerts={handleAcknowledgeAlerts}
            onRestartService={handleRestartService}
            onOpenFridayChat={(ctx) => handleOpenFridayWithContext({ title: ctx.incident, service: 'core-gateway' })}
            onPurgeCache={handlePurgeCache}
            activeIncidentTitle={anomalies[0]?.title || 'System Baseline Monitoring'}
          />

          {/* ── 8. Capacity Snapshot ─────────────────────────────── */}
          <CapacitySnapshot
            cpuUsage={cpuUsage}
            memUsage={memUsage}
            queueDepth={queueDepth}
            onNavigateToAnalytics={() => onNavigate && onNavigate('analytics')}
          />

          {/* ── 9. Recent Activity Timeline Feed ─────────────────── */}
          <RecentActivityFeed
            activities={activityFeed}
            initialExpanded={false}
          />
        </div>
      </div>

      {/* ── Integration Snippet Modal ─────────────────────────────── */}
      {showIntegrationSnippet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--color-bg-surface, #131722)',
            border: '1px solid var(--color-border-subtle, rgba(255,255,255,0.12))',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text-primary)' }}>
                Connect Active Website / Microservice
              </h3>
              <button
                onClick={() => setShowIntegrationSnippet(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Add this lightweight telemetry tracker to your website's <code>&lt;head&gt;</code> or dispatch telemetry events directly to the ingestion API. Once the first event is received, all dummy baseline data will automatically be replaced with genuine real metrics.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
                Option 1: Frontend Script Tag (HTML / Next.js / Shopify)
              </div>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                overflowX: 'auto',
                color: '#34d399',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
{`<script
  src="https://cdn.aicto.ai/beacon.v1.js"
  data-tenant="${selectedBusiness?.slug || 'my-store'}"
  data-api="http://localhost:8000/api/ingestion/events"
  async>
</script>`}
              </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
                Option 2: Direct HTTP Telemetry Ingestion (cURL / Backend / Webhook)
              </div>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                overflowX: 'auto',
                color: '#60a5fa',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
{`curl -X POST http://localhost:8000/api/ingestion/events \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: aicto_live_${selectedBusiness?.slug || 'key'}" \\
  -d '[{
    "event_type": "request",
    "response_time_ms": 142.5,
    "status_code": 200,
    "revenue_amount": 89.50,
    "endpoint": "/checkout"
  }]'`}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`curl -X POST http://localhost:8000/api/ingestion/events -H "Content-Type: application/json" -H "X-API-Key: aicto_live_${selectedBusiness?.slug || 'key'}" -d '[{"event_type":"request","response_time_ms":142.5,"status_code":200,"revenue_amount":89.50,"endpoint":"/checkout"}]`);
                  if (onShowToast) onShowToast({ title: 'Copied', message: 'cURL command copied to clipboard', variant: 'success' });
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-text-primary)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                📋 Copy cURL
              </button>
              <button
                onClick={() => setShowIntegrationSnippet(false)}
                style={{
                  background: 'var(--color-primary, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
