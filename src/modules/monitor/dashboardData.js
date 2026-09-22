/**
 * Dashboard Mock Data & Telemetry Simulation Engine
 * Multi-tenant business profiles, KPI thresholds, anomaly models, and activity feeds.
 */

export const BUSINESS_PROFILES = [];

// Threshold definitions for color coding (green / amber / red)
export const THRESHOLDS = {
  responseTime: { warn: 200, crit: 350 }, // ms
  requestsPerMin: { warn: 8000, crit: 15000 },
  jsErrorRate: { warn: 0.8, crit: 2.0 }, // %
  httpErrorRate: { warn: 1.0, crit: 2.5 }, // %
  checkoutFailureRate: { warn: 1.5, crit: 3.5 }, // %
  cpuUsage: { warn: 70, crit: 90 }, // %
  memUsage: { warn: 70, crit: 90 }, // %
  queueDepth: { warn: 70, crit: 90 }, // %
};

export const INITIAL_ANOMALIES = [];
export const RECENT_TELEMETRY_EVENTS = [];
export const HISTORICAL_DECISION_LOGS = [];
export const RECENT_ACTIVITY_FEED = [];

// Helper to generate chart points - returns empty array when no real telemetry has been ingested
export function generateChartData(_timeRange = '24h', _businessType = 'ecommerce') {
  return [];
}

