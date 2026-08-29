/**
 * AI-CTO Onboarding Wizard Configuration & Helper Utilities
 */

export const BUSINESS_TYPES = [
  {
    id: 'ecommerce',
    label: 'E-Commerce / Direct-to-Consumer',
    shortLabel: 'E-Commerce',
    badge: 'Storefront',
    icon: 'cart',
    description: 'Online stores, checkout funnels, catalog browsing, cart telemetry, and payment gateways.',
    defaultKpis: ['orders-min', 'checkout-failure', 'clicks-min', 'response-time', 'cart-abandonment'],
  },
  {
    id: 'saas',
    label: 'SaaS / Subscription Platform',
    shortLabel: 'SaaS Platform',
    badge: 'Software',
    icon: 'cloud',
    description: 'Web applications, multi-tenant dashboards, API invocations, user sessions, and auth services.',
    defaultKpis: ['mrr-velocity', 'churn-risk', 'active-sessions', 'api-throughput', 'js-error-rate'],
  },
  {
    id: 'content',
    label: 'Content / Media & Streaming',
    shortLabel: 'Media & Streaming',
    badge: 'Publishing',
    icon: 'media',
    description: 'High-throughput content portals, video streaming, edge caching, ad impressions, and CDN nodes.',
    defaultKpis: ['streams-min', 'buffer-stalls', 'ad-impressions', 'response-time', 'requests-min'],
  },
  {
    id: 'marketplace',
    label: 'Multi-Vendor Marketplace',
    shortLabel: 'Marketplace',
    badge: 'Multi-Vendor',
    icon: 'store',
    description: 'Buyer & seller platforms, transaction reconciliation, search indexing, and real-time listings.',
    defaultKpis: ['orders-min', 'clicks-min', 'active-sessions', 'response-time', 'http-error-rate'],
  },
  {
    id: 'other',
    label: 'Custom Web Application / Other',
    shortLabel: 'Custom Web App',
    badge: 'Custom',
    icon: 'code',
    description: 'Bespoke backend services, internal tooling, enterprise workflows, and microservice meshes.',
    defaultKpis: ['response-time', 'requests-min', 'js-error-rate', 'http-error-rate', 'cpu-load'],
  },
];

export const KPI_CATALOG = {
  'orders-min': {
    id: 'orders-min',
    name: 'Orders / Minute',
    category: 'Revenue',
    unit: 'orders/m',
    defaultTarget: '> 30/min',
    description: 'Real-time successful transaction completion rate across checkout microservices.',
    badge: 'High Priority',
  },
  'checkout-failure': {
    id: 'checkout-failure',
    name: 'Checkout Failure Rate',
    category: 'Vitals',
    unit: '%',
    defaultTarget: '< 1.5%',
    description: 'Percentage of initiated checkouts ending in 4xx/5xx errors or payment drops.',
    badge: 'Critical Alert',
  },
  'clicks-min': {
    id: 'clicks-min',
    name: 'Catalog Clicks & Browse Rate',
    category: 'Traffic',
    unit: 'clicks/m',
    defaultTarget: 'Nominal',
    description: 'User clickstream velocity on product detail and catalog search pages.',
    badge: 'Telemetry',
  },
  'cart-abandonment': {
    id: 'cart-abandonment',
    name: 'Real-Time Cart Abandonment Rate',
    category: 'Conversion',
    unit: '%',
    defaultTarget: '< 65%',
    description: 'Items added to bag without progressing to payment verification within 15 mins.',
    badge: 'Conversion',
  },
  'mrr-velocity': {
    id: 'mrr-velocity',
    name: 'Active Signups / Hour & MRR Velocity',
    category: 'Growth',
    unit: 'signups/h',
    defaultTarget: '> 150/h',
    description: 'Hourly net new paid subscriptions, tier upgrades, and conversion triggers.',
    badge: 'High Priority',
  },
  'churn-risk': {
    id: 'churn-risk',
    name: 'Auth / Token Failure Rate (Churn Risk)',
    category: 'Security & Vitals',
    unit: '%',
    defaultTarget: '< 0.5%',
    description: 'Failed JWT/OAuth handshakes that block user authentication and billing flows.',
    badge: 'SLA Bound',
  },
  'active-sessions': {
    id: 'active-sessions',
    name: 'Concurrent Active Orgs & Sessions',
    category: 'Throughput',
    unit: 'tenants',
    defaultTarget: 'Scale Auto',
    description: 'Simultaneous active websocket connections across tenant clusters.',
    badge: 'Cluster Metric',
  },
  'api-throughput': {
    id: 'api-throughput',
    name: 'API Invocations / Min',
    category: 'Throughput',
    unit: 'req/m',
    defaultTarget: 'Cap 150k',
    description: 'Total p99 inbound REST and GraphQL requests through edge gateway.',
    badge: 'Infrastructure',
  },
  'streams-min': {
    id: 'streams-min',
    name: 'Concurrent Video Streams',
    category: 'Throughput',
    unit: 'streams',
    defaultTarget: '> 30k',
    description: 'Active HLS/DASH media sessions with edge segment delivery.',
    badge: 'Bandwidth',
  },
  'buffer-stalls': {
    id: 'buffer-stalls',
    name: 'Playback Re-Buffer Ratio',
    category: 'Quality of Experience',
    unit: '%',
    defaultTarget: '< 0.5%',
    description: 'Percentage of playback time lost to client-side buffer starvation.',
    badge: 'SLA Bound',
  },
  'ad-impressions': {
    id: 'ad-impressions',
    name: 'Ad Impression Fill Rate',
    category: 'Monetization',
    unit: '%',
    defaultTarget: '> 98%',
    description: 'VAST/VPAID edge delivery fill rate and bid response latency.',
    badge: 'Revenue',
  },
  'response-time': {
    id: 'response-time',
    name: 'Avg Response Time (p95 Latency)',
    category: 'Core Vital',
    unit: 'ms',
    defaultTarget: '< 200ms',
    description: 'Time from initial client SYN packet to first byte response from origin.',
    badge: 'Global SLA',
  },
  'requests-min': {
    id: 'requests-min',
    name: 'Total Requests / Minute (RPM)',
    category: 'Throughput',
    unit: 'rpm',
    defaultTarget: 'Nominal',
    description: 'Gross HTTP request volume processed through CDN edge shield.',
    badge: 'Volume',
  },
  'js-error-rate': {
    id: 'js-error-rate',
    name: 'Client-Side JS Error Rate',
    category: 'Reliability',
    unit: '%',
    defaultTarget: '< 0.5%',
    description: 'Uncaught frontend JavaScript exceptions captured by AI-CTO snippet.',
    badge: 'Critical Alert',
  },
  'http-error-rate': {
    id: 'http-error-rate',
    name: '5xx Server Error Rate',
    category: 'Reliability',
    unit: '%',
    defaultTarget: '< 0.5%',
    description: 'Percentage of requests returning 500/502/503/504 gateway or origin errors.',
    badge: 'Critical Alert',
  },
  'cpu-load': {
    id: 'cpu-load',
    name: 'Node Cluster CPU & Memory Envelope',
    category: 'Infrastructure',
    unit: '%',
    defaultTarget: '< 75%',
    description: 'Aggregate pod resource consumption across Kubernetes namespaces.',
    badge: 'Resource',
  },
};

export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) — UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) — UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) — UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) — UTC-8' },
  { value: 'Europe/London', label: 'London, Dublin, Lisbon — UTC+0' },
  { value: 'Europe/Berlin', label: 'Berlin, Paris, Amsterdam — UTC+1' },
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi, Kolkata — UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore, Hong Kong — UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka — UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne — UTC+11' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export const INTEGRATIONS_LIST = [
  {
    id: 'shopify',
    name: 'Shopify Storefront Webhook',
    category: 'ecommerce',
    desc: 'Real-time order creation, inventory sync, and checkout webhook listener.',
    iconType: 'shopify',
    recommendedFor: ['ecommerce', 'marketplace'],
    available: true,
  },
  {
    id: 'stripe',
    name: 'Stripe Billing & Subscriptions',
    category: 'saas',
    desc: 'Payment intent failures, dispute alerts, and subscription renewal telemetry.',
    iconType: 'stripe',
    recommendedFor: ['saas', 'ecommerce', 'marketplace'],
    available: true,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge CDN',
    category: 'infra',
    desc: 'Edge cache hit ratios, DDoS mitigation logs, and SSL handshake telemetry.',
    iconType: 'cloudflare',
    recommendedFor: ['content', 'saas', 'ecommerce', 'other'],
    available: true,
  },
  {
    id: 'github',
    name: 'GitHub CI/CD Deployments',
    category: 'devops',
    desc: 'Correlate latency spikes and error rate jumps with git commit deployments.',
    iconType: 'github',
    recommendedFor: ['saas', 'other'],
    available: true,
  },
  {
    id: 'slack',
    name: 'Slack Incident Channel',
    category: 'alerts',
    desc: 'Instant FRIDAY AI mitigation alerts & interactive action buttons in Slack.',
    iconType: 'slack',
    recommendedFor: ['ecommerce', 'saas', 'content', 'marketplace', 'other'],
    available: true,
  },
  {
    id: 'datadog',
    name: 'Datadog APM Agent',
    category: 'observability',
    desc: 'Cross-correlate AI-CTO edge telemetry with backend APM trace spans.',
    iconType: 'datadog',
    recommendedFor: ['saas', 'content', 'other'],
    available: false, // Coming soon
  },
];

/**
 * Generate a unique Business ID consistent with the platform standard
 */
export function generateBusinessId(businessName = '') {
  const clean = businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'tenant';
  const randomHex = Math.random().toString(16).substring(2, 8);
  return `biz_live_${clean}_${randomHex}`;
}

/**
 * Generate the tracking script snippet code string
 */
export function generateTrackingSnippet(businessId) {
  return `<script src="https://cdn.aicto.io/tracker.js" data-business-id="${businessId}" async></script>`;
}

/**
 * Auto-detect user browser timezone or fallback to America/New_York
 */
export function getDetectedTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch (e) {
    console.warn('Could not detect timezone:', e);
  }
  return 'America/New_York';
}

/**
 * Validates a website URL string (accepts with or without http/https protocol)
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') return { valid: false, message: 'Website URL is required' };
  const trimmed = url.trim();
  if (trimmed.length < 3) return { valid: false, message: 'URL is too short' };

  // Check valid hostname format (e.g. domain.com or https://domain.com/path)
  const pattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
  if (!pattern.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid website address (e.g., myshop.com or https://app.acme.io)' };
  }

  // Format clean domain representation
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    return { valid: true, hostname: parsed.hostname, normalizedUrl: normalized };
  } catch (_e) {
    return { valid: false, message: 'Invalid URL syntax' };
  }
}

/**
 * Verification Engine Integration Point:
 * In production, replace the simulated setTimeout below with an actual fetch call:
 * e.g.: `return fetch('/api/v1/tenants/verify-snippet', { method: 'POST', body: JSON.stringify({ businessId, url }) })`
 */
export async function verifySnippetInstallation({ businessId, websiteUrl, simulateFailure = false }) {
  // Simulating network round-trip & edge probe check
  return new Promise((resolve) => {
    setTimeout(() => {
      if (simulateFailure) {
        resolve({
          success: false,
          error: `Snippet for ${businessId} not detected yet on ${websiteUrl}. Make sure it is installed inside the <head> tag and try again.`,
          detectedAt: null,
          httpStatus: 200,
        });
      } else {
        resolve({
          success: true,
          message: 'Snippet detected — telemetry is now live',
          businessId,
          detectedAt: new Date().toISOString(),
          firstEventLatency: `${Math.floor(22 + Math.random() * 25)}ms`,
          clusterRegion: 'us-east-1 (N. Virginia)',
          clientIp: '198.51.100.24',
          sampleEvent: {
            type: 'PAGE_VIEW',
            url: websiteUrl,
            time: 'Just now',
          },
        });
      }
    }, 1500);
  });
}

