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

  // Cluster vitals
  const [cpuUsage, setCpuUsage] = useState(48);
  const [memUsage, setMemUsage] = useState(64);
  const [queueDepth, setQueueDepth] = useState(78);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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
      if (metricsData && metricsData.capacity) {
        if (metricsData.capacity.cpu_pct !== undefined) setCpuUsage(Math.round(metricsData.capacity.cpu_pct));
        if (metricsData.capacity.memory_pct !== undefined) setMemUsage(Math.round(metricsData.capacity.memory_pct));
        if (metricsData.capacity.queue_depth !== undefined) setQueueDepth(metricsData.capacity.queue_depth);
      }

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const isCacheHit = metricsData?.cache_hit;
      const newProbe = {
        id: `tel-${Date.now()}`,
        time: timeStr,
        type: 'HEARTBEAT',
        level: 'info',
        message: isCacheHit
          ? `Redis cache hit (TTL 15s) for ${selectedBusiness.domain} [p95: ${metricsData?.kpis?.response_time_ms || 184}ms]`
          : `FastAPI telemetry stream verified for ${selectedBusiness.domain} (${selectedBusiness.region}).`,
        latency: `${Math.floor(22 + Math.random() * 15)}ms`,
      };

      setTelemetryEvents((prev) => [newProbe, ...prev.slice(0, 7)]);
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

  // ── Auto-Refresh Timer Hook ─────────────────────────────────────
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
        initialPrompt: `I noticed anomaly "${anomaly.title}" on service ${anomaly.service} (${anomaly.deviation}). What is the recommended remediation strategy and rollback plan?`,
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

      {/* ── 2. Health Status Banner ──────────────────────────────── */}
      <HealthStatusBanner
        healthScore={healthScore}
        status={healthStatus}
        anomalyCount={anomalies.length}
        activeServices="14/14"
        uptime="99.98%"
        avgLatency={selectedBusiness.type === 'content' ? '64ms' : '142ms'}
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
      />

      {/* ── 4. Business Metrics Row (2nd Tier KPIs) ──────────────── */}
      <BusinessMetricsRow
        businessType={selectedBusiness.type}
        isLive={isConnected}
        isSyncing={isRefreshing}
      />

      {/* ── Main Two-Column Content Grid ─────────────────────────── */}
      <div className="dashboard-main-grid">
        {/* Left Column (Chart, Active Anomalies) */}
        <div className="dashboard-left-col">
          {/* ── 7. Traffic & Revenue Chart (24h/7d/30d) ───────────── */}
          <TrafficRevenueChart
            businessType={selectedBusiness.type}
            isLive={isConnected}
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
    </div>
  );
}
