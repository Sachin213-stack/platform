/**
 * Analytics & Capacity Forecasting Studio Datasets & Generation Engine
 * Clean baseline exports: genuine telemetry will populate models dynamically.
 */

// ── 1. Anomaly Timeline & Log Dataset ─────────────────────────────
export const INITIAL_ANOMALIES_HISTORY = [];

// ── 2. Model Confidence & Accuracy Metrics ───────────────────────
export const INITIAL_MODEL_METRICS = null;

// ── 3. Resource Runway & Capacity Projection ─────────────────────
export const INITIAL_RESOURCE_RUNWAY = null;

// ── 4. Multi-Metric Correlation Preset Pairs ─────────────────────
export const CORRELATION_PAIRS = [
  {
    id: 'latency-conversion',
    name: 'p99 Latency vs Checkout Conversion',
    metricA: { key: 'latency', label: 'p99 Latency', unit: 'ms', color: '#8b5cf6', scaleLabel: 'Latency (ms)' },
    metricB: { key: 'conversion', label: 'Conversion Rate', unit: '%', color: '#10b981', scaleLabel: 'Conversion (%)' },
    pearsonR: 0,
    relationship: 'Awaiting Telemetry Ingestion',
    insight: 'Correlation models will compute regression coefficients once sufficient telemetry is ingested.',
  },
  {
    id: 'error-revenue',
    name: 'HTTP 5xx Error Rate vs Revenue Velocity',
    metricA: { key: 'errorRate', label: '5xx Error Rate', unit: '%', color: '#ef4444', scaleLabel: '5xx Error (%)' },
    metricB: { key: 'revenue', label: 'Revenue GMV Velocity', unit: '$/min', color: '#f59e0b', scaleLabel: 'Revenue ($/m)' },
    pearsonR: 0,
    relationship: 'Awaiting Telemetry Ingestion',
    insight: 'Correlation models will compute regression coefficients once sufficient telemetry is ingested.',
  },
  {
    id: 'cpu-latency',
    name: 'CPU Utilization vs Execution Latency',
    metricA: { key: 'cpu', label: 'Cluster CPU Usage', unit: '%', color: '#06b6d4', scaleLabel: 'CPU Usage (%)' },
    metricB: { key: 'latency', label: 'p95 Execution Latency', unit: 'ms', color: '#a855f7', scaleLabel: 'Latency (ms)' },
    pearsonR: 0,
    relationship: 'Awaiting Telemetry Ingestion',
    insight: 'Correlation models will compute regression coefficients once sufficient telemetry is ingested.',
  },
];

// Generator for Correlation Dual-Axis Data Points - empty until genuine events arrive
export function generateCorrelationData(_pairId = 'latency-conversion') {
  return [];
}

// ── 5. Predictive Forecast Curve Generator ────────────────────────
// Returns empty points array until genuine telemetry has been ingested
export function generateForecastData({
  _timeRange = '24h',
  _granularity = 'hourly',
  _compareMode = 'none',
  _whatIfSpike = 0,
} = {}) {
  return [];
}
