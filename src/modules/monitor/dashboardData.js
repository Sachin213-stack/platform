/**
 * Dashboard Mock Data & Telemetry Simulation Engine
 * Multi-tenant business profiles, KPI thresholds, anomaly models, and activity feeds.
 */

export const BUSINESS_PROFILES = [
  {
    id: 'apex-retail',
    name: 'Apex Retail',
    type: 'ecommerce',
    typeLabel: 'E-Commerce',
    tierLabel: 'Enterprise Plus',
    region: 'us-east-1 (N. Virginia)',
    domain: 'apex-retail.io',
  },
  {
    id: 'nexus-cloud',
    name: 'Nexus Cloud',
    type: 'saas',
    typeLabel: 'SaaS Platform',
    tierLabel: 'Growth Scale',
    region: 'eu-west-1 (Ireland)',
    domain: 'nexuscloud.dev',
  },
  {
    id: 'vortex-media',
    name: 'Vortex Media',
    type: 'content',
    typeLabel: 'Media & Streaming',
    tierLabel: 'High Throughput',
    region: 'ap-southeast-1 (Singapore)',
    domain: 'vortexmedia.network',
  },
  {
    id: 'cyber-fin',
    name: 'CyberFin Core',
    type: 'fintech',
    typeLabel: 'FinTech Banking',
    tierLabel: 'Mission Critical',
    region: 'us-east-2 (Ohio)',
    domain: 'cyberfin.internal',
  },
];

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

export const INITIAL_ANOMALIES = [
  {
    id: 'ano-101',
    severity: 'High', // 'Critical' | 'High' | 'Medium' | 'Low'
    title: 'Checkout Microservice Latency Spike (p99 > 820ms)',
    service: 'checkout-v2.svc',
    timestamp: '3 mins ago',
    deviation: '+142% vs baseline',
    impact: 'Cart abandonment increased by 4.2%',
    aiRecommendation: 'Scale checkout-v2 deployment replica count from 4 to 8 and enable Redis session caching tier.',
    recommendedAction: 'Scale Replicas & Cache',
    actionPayload: { action: 'scale_service', service: 'checkout-v2.svc', replicas: 8 },
    status: 'active',
  },
  {
    id: 'ano-102',
    severity: 'Medium',
    title: 'Stripe Webhook Delivery Timeout',
    service: 'payment-gateway-proxy',
    timestamp: '14 mins ago',
    deviation: '18 dropped webhook events',
    impact: 'Delayed order confirmation notifications for 12 customers',
    aiRecommendation: 'Trigger automated retry queue drain and verify payment gateway TLS handshake timeouts.',
    recommendedAction: 'Drain Retry Queue',
    actionPayload: { action: 'drain_queue', service: 'payment-gateway-proxy' },
    status: 'active',
  },
  {
    id: 'ano-103',
    severity: 'Low',
    title: 'CDN Edge Cache Hit Ratio Dropped below 88%',
    service: 'edge-cloudflare-dist',
    timestamp: '42 mins ago',
    deviation: '-6.4% cache ratio',
    impact: 'Minor origin server load increase (4.1%)',
    aiRecommendation: 'Warm cache tags for top 100 catalog assets and invalidate stale marketing banners.',
    recommendedAction: 'Warm Cache Tags',
    actionPayload: { action: 'warm_cache', service: 'edge-cloudflare-dist' },
    status: 'active',
  },
];

export const RECENT_TELEMETRY_EVENTS = [
  {
    id: 'tel-01',
    time: '18:24:10',
    type: 'HEARTBEAT',
    level: 'info',
    message: 'Health probe acknowledged across 12 node clusters.',
    latency: '34ms',
  },
  {
    id: 'tel-02',
    time: '18:22:45',
    type: 'AUTOSCALE',
    level: 'warning',
    message: 'Pod autoscaler spawned 2 additional instances in us-east-1a.',
    latency: '1.2s',
  },
  {
    id: 'tel-03',
    time: '18:19:30',
    type: 'CIRCUIT_BREAKER',
    level: 'warning',
    message: 'Circuit breaker half-opened on inventory-search-api.',
    latency: '112ms',
  },
  {
    id: 'tel-04',
    time: '18:15:02',
    type: 'TLS_RENEWAL',
    level: 'info',
    message: 'Zero-downtime certificate rotation verified for *.apex-retail.io.',
    latency: '45ms',
  },
];

export const HISTORICAL_DECISION_LOGS = [
  {
    id: 'dec-89',
    timestamp: 'Today 17:45',
    actor: 'FRIDAY AI Autonomous Shield',
    action: 'Throttled Bad Bot Traffic on /api/v1/auth/login',
    impact: 'Blocked 24,000 scraping requests with zero false positives.',
    confidence: '99.4%',
    status: 'Applied',
  },
  {
    id: 'dec-88',
    timestamp: 'Today 16:10',
    actor: 'DevOps Lead (Alex C.)',
    action: 'Merged Hotfix #419 — Database Connection Pool Increase',
    impact: 'Postgres active connection limit bumped from 200 to 450.',
    confidence: 'Verified',
    status: 'Completed',
  },
  {
    id: 'dec-87',
    timestamp: 'Yesterday 21:30',
    actor: 'FRIDAY AI Optimizer',
    action: 'Re-routed EU traffic to Dublin edge cluster during Frankfurt fiber maintenance',
    impact: 'Preserved p95 latency under 120ms throughout window.',
    confidence: '98.8%',
    status: 'Resolved',
  },
];

export const RECENT_ACTIVITY_FEED = [
  {
    id: 'act-01',
    actor: 'Alex Chen',
    avatar: 'AC',
    role: 'Staff Infrastructure Engineer',
    action: 'Deployed v2.14.0 to production',
    target: 'core-api & checkout-svc',
    timestamp: '18 mins ago',
    badge: 'Deploy',
    badgeVariant: 'violet',
    hash: 'git #8f921bc',
  },
  {
    id: 'act-02',
    actor: 'FRIDAY AI Shield',
    avatar: 'FR',
    role: 'Autonomous Ops Agent',
    action: 'Adjusted WAF rate limiting rule for search crawler bypass',
    target: 'Cloudflare WAF Ruleset #12',
    timestamp: '46 mins ago',
    badge: 'Security',
    badgeVariant: 'warning',
    hash: 'rule_waf_99',
  },
  {
    id: 'act-03',
    actor: 'Sarah Jenkins',
    avatar: 'SJ',
    role: 'Principal SRE',
    action: 'Updated Alerting thresholds for p99 response time',
    target: 'PagerDuty + Slack #alerts-critical',
    timestamp: '2 hours ago',
    badge: 'Config',
    badgeVariant: 'info',
    hash: 'config-rev-41',
  },
  {
    id: 'act-04',
    actor: 'System Autonomous Bot',
    avatar: 'SY',
    role: 'Auto-Remediation Daemon',
    action: 'Executed automated snapshot backup of primary Aurora DB cluster',
    target: 'db-aurora-prod-cluster-01',
    timestamp: '4 hours ago',
    badge: 'Backup',
    badgeVariant: 'success',
    hash: 'snap-8829104',
  },
];

// Helper to generate dynamic chart points for 24h, 7d, 30d
export function generateChartData(timeRange = '24h', businessType = 'ecommerce') {
  if (timeRange === '24h') {
    const points = [];
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];
    const baseTraffic = businessType === 'ecommerce' ? 4200 : businessType === 'saas' ? 8400 : 12000;
    const baseRev = businessType === 'ecommerce' ? 1850 : businessType === 'saas' ? 3200 : 750;

    hours.forEach((time, index) => {
      const curve = Math.sin((index / 12) * Math.PI);
      const randomJitter = (Math.random() - 0.5) * 0.15;
      const traffic = Math.round(baseTraffic * (0.6 + curve * 0.8 + randomJitter));
      const revenue = Math.round(baseRev * (0.5 + curve * 0.9 + randomJitter * 0.8));
      const conversion = +(2.8 + curve * 1.4 + (Math.random() - 0.5) * 0.3).toFixed(2);

      points.push({
        time,
        label: time,
        traffic,
        revenue,
        conversion,
      });
    });
    return points;
  }

  if (timeRange === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseTraffic = businessType === 'ecommerce' ? 52000 : 96000;
    const baseRev = businessType === 'ecommerce' ? 24000 : 38000;

    return days.map((day, idx) => {
      const isWeekend = idx >= 5;
      const factor = isWeekend ? 1.35 : 1.0;
      const jitter = (Math.random() - 0.5) * 0.1;
      return {
        time: day,
        label: day,
        traffic: Math.round(baseTraffic * (factor + jitter)),
        revenue: Math.round(baseRev * (factor * 1.1 + jitter)),
        conversion: +(3.2 + (Math.random() - 0.5) * 0.4).toFixed(2),
      };
    });
  }

  // 30d
  const points = [];
  const baseTraffic = businessType === 'ecommerce' ? 220000 : 410000;
  const baseRev = businessType === 'ecommerce' ? 98000 : 165000;

  for (let i = 1; i <= 30; i += 3) {
    const label = `Day ${i}`;
    const growth = 1 + (i / 30) * 0.28;
    const jitter = (Math.random() - 0.5) * 0.08;
    points.push({
      time: label,
      label,
      traffic: Math.round(baseTraffic * (growth + jitter)),
      revenue: Math.round(baseRev * (growth * 1.05 + jitter)),
      conversion: +(3.1 + (i / 30) * 0.5 + (Math.random() - 0.5) * 0.2).toFixed(2),
    });
  }
  return points;
}
