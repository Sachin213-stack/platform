import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LogsPage.css';

import { LogTopBar } from './components/LogTopBar';
import { LogFilterBar } from './components/LogFilterBar';
import { LogStreamPanel } from './components/LogStreamPanel';
import { LogDetailDrawer } from './components/LogDetailDrawer';
import { LogShippingModal } from './components/LogShippingModal';

import { useTenant } from '../../../shared/context/TenantContext';
import { logsApi, apiKeysApi } from '../../../shared/services/apiClient';

const MAX_DOM_LINES = 800;

export default function LogsPage({ onNavigate, initialContext }) {
  const { selectedBusiness } = useTenant();

  // ── Stream & Logs State ──────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // ── Credentials & Test Probe State ──────────────────────────────
  const [dashboardApiKey, setDashboardApiKey] = useState('');
  const [isSendingTestLog, setIsSendingTestLog] = useState(false);

  // ── Detail Drawer & Modal State ─────────────────────────────────
  const [selectedLog, setSelectedLog] = useState(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // ── Filter State ────────────────────────────────────────────────
  const [timePreset, setTimePreset] = useState('1h');
  const [logType, setLogType] = useState('all');
  const [selectedLevels, setSelectedLevels] = useState(['error', 'warn', 'info', 'debug']);
  const [source, setSource] = useState('all');
  const [sources, setSources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Deep-Linked Anomaly Context ──────────────────────────────────
  const [anomalyContext, setAnomalyContext] = useState(null);
  const [correlatedEntryIds, setCorrelatedEntryIds] = useState([]);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 0. Fetch API key for snippet generator
  useEffect(() => {
    let isMounted = true;
    async function loadKey() {
      if (!selectedBusiness?.id) return;
      const cached = localStorage.getItem(`aicto_api_key_${selectedBusiness.id}`);
      if (cached) {
        if (isMounted) setDashboardApiKey(cached);
        return;
      }
      try {
        const keys = await apiKeysApi.getKeys();
        if (keys && keys.length > 0 && keys[0].api_key && isMounted) {
          setDashboardApiKey(keys[0].api_key);
          localStorage.setItem(`aicto_api_key_${selectedBusiness.id}`, keys[0].api_key);
        }
      } catch (err) {
        console.debug('Could not load api keys for logs page:', err);
      }
    }
    loadKey();
    return () => { isMounted = false; };
  }, [selectedBusiness?.id]);

  // 1. Fetch available sources on mount
  useEffect(() => {
    logsApi.getSources()
      .then((res) => {
        if (res?.sources) setSources(res.sources);
      })
      .catch((err) => console.warn('Could not fetch log sources:', err));
  }, []);

  // 2. Handle initialContext from Anomaly Deep-Link
  useEffect(() => {
    if (initialContext?.anomalyId || initialContext?.anomaly) {
      const anom = initialContext.anomaly || {};
      const anomId = initialContext.anomalyId || anom.id;

      setAnomalyContext({
        id: anomId,
        title: anom.title || `${anom.service || 'System'} Anomaly`,
        service: anom.service,
        severity: anom.severity,
        detectedAt: anom.timestamp || anom.detected_at,
      });

      // Pause live-tail when investigating a specific historical anomaly window
      setIsLive(false);
      setIsLoading(true);

      logsApi.getLogsAroundAnomaly(anomId)
        .then((res) => {
          if (res?.entries) {
            setLogs(res.entries);
            setTotalCount(res.entries.length);
            setCorrelatedEntryIds(res.root_cause_entry_ids || []);
          }
        })
        .catch((err) => {
          console.warn('Failed to load anomaly correlated logs:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialContext]);

  // 3. Query historical logs when not deep-linked or when filters change while paused
  const fetchQueryLogs = useCallback(async () => {
    if (anomalyContext) return; // Don't overwrite anomaly window
    setIsLoading(true);

    let timeFrom = null;
    const now = new Date();
    if (timePreset === '15m') timeFrom = new Date(now.getTime() - 15 * 60000);
    else if (timePreset === '1h') timeFrom = new Date(now.getTime() - 60 * 60000);
    else if (timePreset === '24h') timeFrom = new Date(now.getTime() - 24 * 3600000);

    try {
      const res = await logsApi.queryLogs({
        timeFrom,
        logType,
        level: selectedLevels.length === 4 ? 'all' : selectedLevels.join(','),
        source,
        search: searchQuery,
        limit: 100,
        offset: 0,
      });

      if (res?.entries) {
        // Reverse so newest is at bottom in terminal stream view
        const ordered = [...res.entries].reverse();
        setLogs(ordered);
        setTotalCount(res.total || ordered.length);
      }
    } catch (err) {
      console.warn('Failed to query logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [anomalyContext, timePreset, logType, selectedLevels, source, searchQuery]);

  // Trigger query on filter change if paused
  useEffect(() => {
    if (!isLive && !anomalyContext) {
      fetchQueryLogs();
    }
  }, [fetchQueryLogs, isLive, anomalyContext]);

  // 4. Connect SSE Live-Tail Stream when isLive is true
  useEffect(() => {
    if (!isLive || anomalyContext) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Load initial logs first if empty
    fetchQueryLogs();

    const streamUrl = logsApi.getStreamUrl({
      level: selectedLevels.length === 4 ? 'all' : selectedLevels.join(','),
      source,
      logType,
      search: searchQuery,
    });

    let es;
    try {
      es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsReconnecting(false);
      };

      es.addEventListener('log', (e) => {
        try {
          const entry = JSON.parse(e.data);
          setLogs((prev) => {
            // Append and cap to MAX_DOM_LINES
            const next = [...prev, entry];
            return next.length > MAX_DOM_LINES ? next.slice(-MAX_DOM_LINES) : next;
          });
          setTotalCount((c) => c + 1);
        } catch (parseErr) {
          console.debug('Failed to parse SSE log message:', parseErr);
        }
      });

      es.onerror = () => {
        setIsReconnecting(true);
        es.close();
        // Automatic reconnection attempt after 3s
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isLive) {
            setIsLive(true);
          }
        }, 3000);
      };
    } catch (streamErr) {
      console.warn('Could not initialize SSE connection:', streamErr);
      setIsReconnecting(true);
    }

    return () => {
      if (es) es.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isLive, anomalyContext, selectedLevels, source, logType, searchQuery, fetchQueryLogs]);

  // Level filter toggle handler
  const handleToggleLevel = (lvl) => {
    setSelectedLevels((prev) => {
      if (prev.includes(lvl)) {
        // Keep at least one
        return prev.length > 1 ? prev.filter((x) => x !== lvl) : prev;
      } else {
        return [...prev, lvl];
      }
    });
  };

  // Clear all filters handler
  const handleClearFilters = () => {
    setTimePreset('1h');
    setLogType('all');
    setSelectedLevels(['error', 'warn', 'info', 'debug']);
    setSource('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    timePreset !== '1h' ||
    logType !== 'all' ||
    selectedLevels.length < 4 ||
    source !== 'all' ||
    searchQuery.trim().length > 0;

  // Clear anomaly context handler
  const handleClearAnomalyContext = () => {
    setAnomalyContext(null);
    setCorrelatedEntryIds([]);
    setIsLive(true);
  };

  // Send test verification log probe
  const handleSendTestLog = async () => {
    setIsSendingTestLog(true);
    try {
      const nowIso = new Date().toISOString();
      await logsApi.ingestLogs([
        {
          timestamp: nowIso,
          level: 'info',
          source: 'dashboard-probe',
          log_type: 'application',
          format: 'json',
          content: `[VERIFICATION PROBE] Live telemetry stream verified at ${new Date().toLocaleTimeString()} from Dashboard.`,
          parsed_fields: {
            probe: 'manual_verification',
            status: 'operational',
            business_id: selectedBusiness?.id || 'default',
            agent: 'aicto-observability-engine',
          },
        },
      ]);
      // If paused, fetch logs immediately
      if (!isLive) {
        fetchQueryLogs();
      }
    } catch (err) {
      console.error('Failed to send test log probe:', err);
    } finally {
      setIsSendingTestLog(false);
    }
  };

  // Ask FRIDAY about this log entry
  const handleAskFriday = (log) => {
    if (onNavigate) {
      onNavigate('friday-ai', {
        initialPrompt: `Analyze this log entry for root cause and suggest mitigation:\n\nTimestamp: ${log.timestamp}\nLevel: ${log.level}\nService: ${log.source}\nContent: "${log.content}"\n\nParsed fields: ${JSON.stringify(log.parsed_fields || {})}`,
        incident: log.source,
      });
    }
  };

  return (
    <div className="logs-page">
      {/* Top Bar */}
      <LogTopBar
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
        activeCount={logs.length}
        totalCount={totalCount}
        isReconnecting={isReconnecting}
        anomalyContext={anomalyContext}
        onClearAnomalyContext={handleClearAnomalyContext}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        onOpenShippingModal={() => setIsShippingModalOpen(true)}
        businessName={selectedBusiness?.name || 'Acme E-Commerce'}
      />

      {/* Filter Bar */}
      <LogFilterBar
        timePreset={timePreset}
        onTimePresetChange={setTimePreset}
        logType={logType}
        onLogTypeChange={setLogType}
        selectedLevels={selectedLevels}
        onToggleLevel={handleToggleLevel}
        source={source}
        sources={sources}
        onSourceChange={setSource}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Terminal-Style Log Stream Panel */}
      <LogStreamPanel
        logs={logs}
        isLive={isLive}
        isLoading={isLoading}
        searchQuery={searchQuery}
        correlatedEntryIds={correlatedEntryIds}
        selectedLog={selectedLog}
        onSelectLog={setSelectedLog}
        onOpenShippingModal={() => setIsShippingModalOpen(true)}
        onSendTestLog={handleSendTestLog}
        isSendingTestLog={isSendingTestLog}
        apiKey={dashboardApiKey}
        businessId={selectedBusiness?.id}
      />

      {/* Expand-on-Click Detail Drawer */}
      {selectedLog && (
        <LogDetailDrawer
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onAskFriday={handleAskFriday}
          isCorrelated={correlatedEntryIds.includes(selectedLog.id)}
        />
      )}

      {/* Log Shipping Instructions Modal */}
      <LogShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onNavigateToSettings={() => onNavigate && onNavigate('settings')}
        apiKey={dashboardApiKey}
        businessId={selectedBusiness?.id}
      />
    </div>
  );
}
