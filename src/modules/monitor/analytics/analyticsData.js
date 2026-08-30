/**
 * Analytics & Capacity Forecasting Studio Mock Datasets & Generation Engine
 * Includes typed anomaly log history, ML root-cause breakdowns, model confidence metrics,
 * multi-metric correlation datasets, capacity curves, and What-If simulation math.
 */

// ── 1. Anomaly Timeline & Log Dataset ─────────────────────────────
export const INITIAL_ANOMALIES_HISTORY = [
  {
    id: 'ano-101',
    timestamp: 'Today 18:21 UTC (3m ago)',
    metric: 'p99 Response Latency',
    service: 'checkout-v2.svc',
    severity: 'Critical', // 'Critical' | 'High' | 'Medium' | 'Low'
    status: 'Active', // 'Active' | 'Resolved'
    baselineValue: '185 ms',
    observedValue: '840 ms',
    deviation: '+354% vs baseline',
    impact: 'Checkout conversion dropped by 4.2%; 14 transactions failed',
    title: 'Checkout Microservice Latency Spike & Lock Contention',
    aiRecommendation: 'Scale checkout-v2 deployment from 4 to 8 replicas and apply memory cache tier to relieve lock contention.',
    recommendedAction: 'Scale checkout-v2 to 8 replicas',
    actionPayload: { action: 'scale_deployment', service: 'checkout-v2.svc', replicas: 8 },
    rootCauses: [
      {
        factor: 'DB Connection Pool Exhaustion',
        importance: 62,
        category: 'Database',
        description: 'Active PostgreSQL pool saturated at 100% capacity due to unindexed join on customer_orders_v2.',
      },
      {
        factor: 'Elevated Ingress Request Volume',
        importance: 24,
        category: 'Traffic',
        description: 'Concurrent checkout initiation traffic surged by +68% above seasonal Friday baseline.',
      },
      {
        factor: 'Redis Session Lock Contention',
        importance: 14,
        category: 'Cache',
        description: 'Distributed cart mutex locks causing thread queuing in Node.js worker event loop.',
      },
    ],
  },
  {
    id: 'ano-102',
    timestamp: 'Today 17:42 UTC (42m ago)',
    metric: 'HTTP 504 Gateway Timeout Rate',
    service: 'payment-gateway-proxy',
    severity: 'High',
    status: 'Active',
    baselineValue: '0.02%',
    observedValue: '2.18%',
    deviation: '+108x normal error rate',
    impact: '18 Stripe webhook callbacks delayed; customer receipts queued',
    title: 'Payment Gateway Proxy TLS Handshake Latency',
    aiRecommendation: 'Trigger automated retry queue drain and rotate upstream payment gateway connection keep-alive pool.',
    recommendedAction: 'Drain Webhook Queue & Refresh Keep-Alive',
    actionPayload: { action: 'drain_queue', service: 'payment-gateway-proxy' },
    rootCauses: [
      {
        factor: 'Upstream Partner Gateway Latency',
        importance: 54,
        category: 'External Dependency',
        description: 'Stripe regional endpoint p95 acknowledgment delay spiked to 1,800ms.',
      },
      {
        factor: 'Webhook Ingestion Queue Backlog',
        importance: 31,
        category: 'Message Queue',
        description: 'RabbitMQ partition #3 unacknowledged consumer messages exceeded 10,000 threshold.',
      },
      {
        factor: 'Worker Memory Pressure',
        importance: 15,
        category: 'Compute',
        description: 'Garbage collection pause times elevated across 2 proxy worker pods.',
      },
    ],
  },
  {
    id: 'ano-103',
    timestamp: 'Today 16:15 UTC (2.5h ago)',
    metric: 'Edge Cache Hit Ratio',
    service: 'edge-cloudflare-dist',
    severity: 'Medium',
    status: 'Resolved',
    resolvedAt: 'Today 16:38 UTC',
    resolutionNote: 'Automated cache warming tag triggered by FRIDAY AI Shield.',
    baselineValue: '94.2%',
    observedValue: '81.4%',
    deviation: '-12.8% cache efficiency',
    impact: 'Origin server egress bandwidth increased by +220 Mbps',
    title: 'CDN Edge Static Asset Cache Degradation',
    aiRecommendation: 'Warm cache tags for top 100 catalog assets and invalidate stale marketing banners.',
    recommendedAction: 'Warm Edge Cache Tags',
    actionPayload: { action: 'warm_cache', service: 'edge-cloudflare-dist' },
    rootCauses: [
      {
        factor: 'Marketing Asset Cache Busting Invalidation',
        importance: 70,
        category: 'Configuration',
        description: 'Recent CMS publish invalidated global wildcard asset tag across all 240+ edge PoPs.',
      },
      {
        factor: 'Origin Ingress Congestion',
        importance: 20,
        category: 'Network',
        description: 'Concurrent origin asset fetch requests during mid-day campaign push.',
      },
      {
        factor: 'Brotli Compression Re-encoding Delay',
        importance: 10,
        category: 'Compute',
        description: 'Dynamic asset re-compression on cold cache edge nodes.',
      },
    ],
  },
  {
    id: 'ano-104',
    timestamp: 'Today 14:02 UTC (4.5h ago)',
    metric: 'Search API P95 Execution Time',
    service: 'catalog-search-engine',
    severity: 'Low',
    status: 'Resolved',
    resolvedAt: 'Today 14:20 UTC',
    resolutionNote: 'Elasticsearch shard rebalancing completed automatically.',
    baselineValue: '45 ms',
    observedValue: '112 ms',
    deviation: '+148% search latency',
    impact: 'Sub-optimal search typeahead auto-complete responsiveness',
    title: 'Catalog Search Shard Rebalancing Contention',
    aiRecommendation: 'Increase replica count for hot product catalog Elasticsearch indices.',
    recommendedAction: 'Re-index Hot Shards',
    actionPayload: { action: 'rebalance_shards', service: 'catalog-search-engine' },
    rootCauses: [
      {
        factor: 'Elasticsearch Index Compaction',
        importance: 58,
        category: 'Storage',
        description: 'Background Lucene segment merges consuming I/O bandwidth on node-3.',
      },
      {
        factor: 'Uncached Fuzzy Filter Queries',
        importance: 28,
        category: 'Query Optimization',
        description: 'Surge in complex multi-field wildcards from international crawlers.',
      },
      {
        factor: 'JVM Heap Fragmentation',
        importance: 14,
        category: 'Compute',
        description: 'Garbage collection minor pause spike.',
      },
    ],
  },
  {
    id: 'ano-105',
    timestamp: 'Yesterday 22:10 UTC (20h ago)',
    metric: 'Authentication Token Verification Failure',
    service: 'auth-jwt-service',
    severity: 'Critical',
    status: 'Resolved',
    resolvedAt: 'Yesterday 22:28 UTC',
    resolutionNote: 'JWKS public key rotation synced across all auth cluster pods.',
    baselineValue: '0.01%',
    observedValue: '4.85%',
    deviation: '+480x auth failures',
    impact: 'Users on legacy mobile clients required token refresh',
    title: 'JWKS Public Key Secret Cache Desynchronization',
    aiRecommendation: 'Force JWKS secret sync across all regional auth instances and purge stale Redis token cache.',
    recommendedAction: 'Sync JWKS Keys & Flush Token Cache',
    actionPayload: { action: 'sync_jwks', service: 'auth-jwt-service' },
    rootCauses: [
      {
        factor: 'JWKS Certificate Rotation Race Condition',
        importance: 76,
        category: 'Security / Auth',
        description: 'Stale cached public signing key on 3 worker nodes rejected valid client tokens.',
      },
      {
        factor: 'Regional CDN Cache Inconsistency',
        importance: 18,
        category: 'Network',
        description: 'Slight replication delay between US and EU secret distribution points.',
      },
      {
        factor: 'Client Retry Stampede',
        importance: 6,
        category: 'Traffic',
        description: 'Mobile app retry storms amplifying verification load.',
      },
    ],
  },
];

// ── 2. Model Confidence & Accuracy Metrics ───────────────────────
export const INITIAL_MODEL_METRICS = {
  version: 'v3.2.4-prod',
  modelType: 'Hybrid LSTM-Transformer Telemetry Predictor',
  precision: 96.4,
  recall: 94.8,
  falsePositiveRate: 1.8,
  f1Score: 95.6,
  driftScore: 0.018,
  status: 'Optimal Calibration',
  lastRetrained: 'Today, 04:30 UTC',
  datasetVectors: '42.8M vectors',
  retrainFrequency: 'Nightly (24h)',
  latencyScore: '12ms inference',
};

// ── 3. Resource Runway & Capacity Projection ─────────────────────
export const INITIAL_RESOURCE_RUNWAY = {
  growthRatePct: 8.4, // % weekly growth
  runwayDays: 42,
  runwayWeeks: 6,
  exhaustionDate: 'April 11, 2026',
  bottleneck: 'Redis Session Cache Memory Headroom',
  bottleneckCurrentPct: 68,
  bottleneckLimitPct: 90,
  recommendedAction: 'Provision 2 additional MemoryDB shard replicas (+64GB RAM)',
  currentMonthlyCost: 4200,
  estimatedScaleCost: 5020,
  costDeltaMonthly: 820,
  costBreakdown: {
    computeNodes: 2800,
    redisMemory: 950,
    dataTransfer: 450,
  },
};

// ── 4. Multi-Metric Correlation Preset Pairs ─────────────────────
export const CORRELATION_PAIRS = [
  {
    id: 'latency-conversion',
    name: 'p99 Latency vs Checkout Conversion',
    metricA: { key: 'latency', label: 'p99 Latency', unit: 'ms', color: '#8b5cf6', scaleLabel: 'Latency (ms)' },
    metricB: { key: 'conversion', label: 'Conversion Rate', unit: '%', color: '#10b981', scaleLabel: 'Conversion (%)' },
    pearsonR: -0.87,
    relationship: 'Strong Inverse Correlation',
    insight: 'Every +100ms latency increase beyond 250ms threshold reduces checkout conversion by ~3.4%.',
  },
  {
    id: 'error-revenue',
    name: 'HTTP 5xx Error Rate vs Revenue Velocity',
    metricA: { key: 'errorRate', label: '5xx Error Rate', unit: '%', color: '#ef4444', scaleLabel: '5xx Error (%)' },
    metricB: { key: 'revenue', label: 'Revenue GMV Velocity', unit: '$/min', color: '#f59e0b', scaleLabel: 'Revenue ($/m)' },
    pearsonR: -0.92,
    relationship: 'Severe Inverse Correlation',
    insight: 'Elevated 5xx errors above 0.5% cause immediate drop in gross merchandise velocity of ~$620/min.',
  },
  {
    id: 'cpu-latency',
    name: 'CPU Utilization vs Execution Latency',
    metricA: { key: 'cpu', label: 'Cluster CPU Usage', unit: '%', color: '#06b6d4', scaleLabel: 'CPU Usage (%)' },
    metricB: { key: 'latency', label: 'p95 Execution Latency', unit: 'ms', color: '#a855f7', scaleLabel: 'Latency (ms)' },
    pearsonR: 0.89,
    relationship: 'Strong Direct Correlation',
    insight: 'CPU saturation beyond 75% creates exponential thread queueing, adding +280ms to p95 response time.',
  },
];

// Generator for Correlation Dual-Axis Data Points
export function generateCorrelationData(pairId = 'latency-conversion') {
  const points = [];
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];

  if (pairId === 'latency-conversion') {
    hours.forEach((time, idx) => {
      const peak = Math.sin((idx / 12) * Math.PI);
      const latency = Math.round(180 + peak * 420 + (Math.random() - 0.5) * 40);
      // Inverse conversion
      const conversion = +(4.8 - (latency - 180) / 160 + (Math.random() - 0.5) * 0.2).toFixed(2);
      points.push({
        time,
        label: time,
        valA: Math.max(120, latency),
        valB: Math.max(0.8, conversion),
      });
    });
  } else if (pairId === 'error-revenue') {
    hours.forEach((time, idx) => {
      const errorSpike = idx === 9 || idx === 10 ? 2.4 : 0.05 + Math.random() * 0.15;
      const baseRev = 2200;
      const revenue = Math.round(baseRev * (1 + Math.sin((idx / 12) * Math.PI) * 0.6) * (errorSpike > 1 ? 0.35 : 1));
      points.push({
        time,
        label: time,
        valA: +errorSpike.toFixed(2),
        valB: Math.max(200, revenue),
      });
    });
  } else {
    // cpu-latency
    hours.forEach((time, idx) => {
      const curve = Math.sin((idx / 12) * Math.PI);
      const cpu = Math.round(35 + curve * 48 + (Math.random() - 0.5) * 6);
      const latency = Math.round(60 + Math.pow(cpu / 40, 2.2) * 45 + (Math.random() - 0.5) * 15);
      points.push({
        time,
        label: time,
        valA: Math.min(96, Math.max(25, cpu)),
        valB: Math.max(40, latency),
      });
    });
  }

  return points;
}

// ── 5. Predictive Forecast Curve Generator with Comparison & What-If ───
export function generateForecastData({
  timeRange = '24h',
  granularity = 'hourly',
  compareMode = 'none', // 'none' | 'last_week' | 'previous_deploy'
  whatIfSpike = 0,
}) {
  let labels = [];
  let basePointsCount = 13;

  if (timeRange === '24h') {
    labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];
    basePointsCount = labels.length;
  } else if (timeRange === '7d') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    basePointsCount = labels.length;
  } else if (timeRange === '30d') {
    labels = ['Day 1', 'Day 4', 'Day 8', 'Day 12', 'Day 16', 'Day 20', 'Day 24', 'Day 28', 'Day 30'];
    basePointsCount = labels.length;
  } else {
    // Custom
    labels = ['T-12h', 'T-8h', 'T-4h', 'Now', 'T+4h', 'T+8h', 'T+12h', 'T+16h', 'T+20h', 'T+24h'];
    basePointsCount = labels.length;
  }

  const spikeMultiplier = 1 + whatIfSpike / 100;
  const splitIndex = Math.floor(basePointsCount * 0.6); // Split between historical actual and ML predicted

  const points = labels.map((label, idx) => {
    const isHistorical = idx <= splitIndex;
    const progress = idx / (basePointsCount - 1);
    const wave = Math.sin(progress * Math.PI);

    // Baseline throughput
    const baseThroughput = 4200 + wave * 3600;
    const jitter = (Math.sin(idx * 1.7) * 0.5) * 280;

    // Actual historical throughput (only up to split point)
    const actual = isHistorical ? Math.round(baseThroughput + jitter) : null;

    // ML Predicted peak with What-If traffic multiplier
    const predictedBase = (baseThroughput + jitter) * (isHistorical ? 1 : spikeMultiplier);
    const predicted = Math.round(predictedBase);

    // Upper and Lower confidence bounds
    const envelopeSpread = isHistorical ? 240 : (450 + (idx - splitIndex) * 180) * Math.sqrt(spikeMultiplier);
    const upperConfidence = Math.round(predicted + envelopeSpread);
    const lowerConfidence = Math.max(1200, Math.round(predicted - envelopeSpread));

    // Comparison Mode series
    let comparisonValue = null;
    if (compareMode === 'last_week') {
      // Last week had slightly lower peak and offset
      comparisonValue = Math.round((baseThroughput * 0.88 + Math.cos(progress * Math.PI) * 400));
    } else if (compareMode === 'previous_deploy') {
      // Previous deployment baseline
      comparisonValue = Math.round((baseThroughput * 0.94 + jitter * 1.2));
    }

    return {
      label,
      actual,
      predicted,
      upperConfidence,
      lowerConfidence,
      comparisonValue,
      isHistorical,
      capacityLimit: 11000,
    };
  });

  return points;
}
