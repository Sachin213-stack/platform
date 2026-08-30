import React, { useState } from 'react';
import './AnalyticsPage.css';
import { useAnalytics } from '../../shared/context/AnalyticsContext';
import { useToast } from '../../shared/components/Toast';
import { ConfirmModal } from '../../shared/components/ConfirmModal';

import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { ModelMetrics } from './analytics/ModelMetrics';
import { ForecastChart } from './analytics/ForecastChart';
import { CorrelationView } from './analytics/CorrelationView';
import { CapacityPlanner } from './analytics/CapacityPlanner';
import { AnomalyTimeline } from './analytics/AnomalyTimeline';
import { RootCauseBreakdown } from './analytics/RootCauseBreakdown';

export default function AnalyticsPage({ onNavigate }) {
  const {
    sensitivity,
    setSensitivity,
    anomalies,
    selectedAnomalyId,
    setSelectedAnomalyId,
    selectedAnomaly,
    modelMetrics,
    resourceRunway,
    whatIfSpike,
    setWhatIfSpike,
    liveCrashRisk,
    liveHeadroom,
    applyRecommendation,
  } = useAnalytics();

  const { addToast } = useToast();

  // ── Confirmation Modal State ─────────────────────────────────
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle "Ask FRIDAY about this" across all widgets
  const handleAskFriday = (promptText, contextObj = null) => {
    if (onNavigate) {
      onNavigate('friday-ai', {
        initialPrompt: promptText,
        context: contextObj || {
          sensitivity,
          liveCrashRisk,
          whatIfSpike,
          resourceRunway,
          anomaly: selectedAnomaly,
        },
      });
    }
  };

  // Open confirmation modal for applying recommendation
  const handleOpenRecommendationConfirm = (anomalyOrItem) => {
    setPendingAction({
      anomalyId: anomalyOrItem.id,
      title: anomalyOrItem.title || 'Mitigation Action',
      service: anomalyOrItem.service || 'Cluster Ingress',
      actionName: anomalyOrItem.recommendedAction || 'Execute Automated Mitigation',
    });
    setIsConfirmOpen(true);
  };

  // Execute confirmed recommendation
  const handleExecuteConfirmedAction = () => {
    if (!pendingAction) return;
    setIsExecutingAction(true);

    setTimeout(() => {
      applyRecommendation(pendingAction.anomalyId, pendingAction.actionName);
      setIsExecutingAction(false);
      setIsConfirmOpen(false);

      addToast(
        `Successfully applied recommendation: "${pendingAction.actionName}" on ${pendingAction.service}`,
        'success'
      );
      setPendingAction(null);
    }, 600);
  };

  // Export Analytics CSV Report
  const handleExportReport = () => {
    setIsExporting(true);
    addToast('Generating Predictive Analytics & Capacity Forecast Report...', 'info');

    setTimeout(() => {
      try {
        // Build CSV Content
        const rows = [
          ['AI-CTO Analytics & Capacity Forecasting Audit Report'],
          ['Generated At', new Date().toISOString()],
          ['Model Version', modelMetrics?.version || 'v3.2'],
          ['Precision', `${modelMetrics?.precision}%`],
          ['Recall', `${modelMetrics?.recall}%`],
          ['False Positive Rate', `${modelMetrics?.falsePositiveRate}%`],
          ['Active Sensitivity', `${sensitivity}%`],
          ['Projected 24h Crash Risk', `${liveCrashRisk}%`],
          ['Headroom Probability', `${liveHeadroom}%`],
          ['Resource Runway', `${resourceRunway?.runwayDays} days (${resourceRunway?.exhaustionDate})`],
          ['Simulated What-If Surge', `+${whatIfSpike}%`],
          [],
          ['Anomaly History Log'],
          ['ID', 'Timestamp', 'Metric', 'Service', 'Severity', 'Status', 'Deviation', 'Title', 'Recommended Action'],
          ...anomalies.map((a) => [
            a.id,
            a.timestamp,
            a.metric,
            a.service,
            a.severity,
            a.status,
            a.deviation,
            `"${a.title}"`,
            `"${a.recommendedAction}"`,
          ]),
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `aicto_analytics_forecast_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        addToast('Forecast report exported successfully (CSV download complete).', 'success');
      } catch (err) {
        setIsExporting(false);
        addToast('Failed to generate report export: ' + err.message, 'error');
      }
    }, 800);
  };

  return (
    <div className="analytics-page-container">
      {/* ── 1. Header & Studio Overview ── */}
      <AnalyticsHeader
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        liveCrashRisk={liveCrashRisk}
        liveHeadroom={liveHeadroom}
        onNavigate={onNavigate}
        onExportReport={handleExportReport}
        onApplyRecommendation={handleOpenRecommendationConfirm}
        onAskFriday={handleAskFriday}
        isExporting={isExporting}
      />

      {/* ── 2. Model Performance & Confidence Metrics ── */}
      <ModelMetrics
        modelMetrics={modelMetrics}
        onAskFriday={handleAskFriday}
      />

      {/* ── 3. Predictive Capacity Curve with Comparison Mode & Time Range ── */}
      <ForecastChart
        whatIfSpike={whatIfSpike}
        onAskFriday={handleAskFriday}
      />

      {/* ── 4. Multi-Metric Correlation View ── */}
      <CorrelationView
        onAskFriday={handleAskFriday}
      />

      {/* ── 5. Capacity Planning Deeper Tools (Runway + What-If + Cost) ── */}
      <CapacityPlanner
        resourceRunway={resourceRunway}
        whatIfSpike={whatIfSpike}
        onWhatIfChange={setWhatIfSpike}
        liveCrashRisk={liveCrashRisk}
        liveHeadroom={liveHeadroom}
        onApplyRecommendation={handleOpenRecommendationConfirm}
        onAskFriday={handleAskFriday}
      />

      {/* ── 6. Anomaly Timeline & Log ── */}
      <AnomalyTimeline
        anomalies={anomalies}
        selectedAnomalyId={selectedAnomalyId}
        onSelectAnomaly={setSelectedAnomalyId}
        onApplyRecommendation={handleOpenRecommendationConfirm}
        onAskFriday={handleAskFriday}
      />

      {/* ── 7. Root Cause Breakdown (Interactive Attribution) ── */}
      <RootCauseBreakdown
        anomaly={selectedAnomaly}
        onApplyRecommendation={handleOpenRecommendationConfirm}
        onAskFriday={handleAskFriday}
      />

      {/* ── 8. Action Confirmation Modal ── */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!isExecutingAction) {
            setIsConfirmOpen(false);
            setPendingAction(null);
          }
        }}
        onConfirm={handleExecuteConfirmedAction}
        title="Confirm Operational Mitigation"
        message={
          pendingAction ? (
            <>
              Are you sure you want to execute recommendation{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>"{pendingAction.actionName}"</strong> on service{' '}
              <code style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-mono)' }}>{pendingAction.service}</code>?
              This will update the deployment topology and resolve the flagged anomaly.
            </>
          ) : (
            'Are you sure you want to apply this recommendation?'
          )
        }
        confirmLabel={isExecutingAction ? 'Executing...' : 'Apply Mitigation'}
        cancelLabel="Cancel"
        variant="primary"
        loading={isExecutingAction}
      />
    </div>
  );
}
