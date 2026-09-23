import React from 'react';
import './FeatureGridSection.css';

const FEATURES = [
  {
    id: 'dashboard',
    category: 'Operations Control Center',
    title: 'Authentic Telemetry & Incident Triage',
    description:
      'Monitor multi-tenant infrastructure with sub-second health scores, p95 latency heatmaps, and 1-click anomaly mitigation backed by genuine telemetry.',
    tag: 'Live Telemetry',
    mockupType: 'dashboard',
    preview: {
      stat: '99.99% Uptime',
      metric: '142ms Avg Latency',
      badge: '0 Active Incidents',
    },
  },
  {
    id: 'logs',
    category: 'Real-Time Observability',
    title: 'Live-Tail Log Streaming & Client Error Bridging',
    description:
      'High-throughput Redis Stream log ingestion, Server-Sent Events (SSE) live-tail, automatic frontend JS crash capture, and 1-click test probes.',
    tag: 'Redis Streams',
    mockupType: 'logs',
    preview: {
      stat: 'Sub-Second Tail',
      metric: 'Redis Stream Active',
      badge: 'Live Log Ingestion',
    },
  },
  {
    id: 'analytics',
    category: 'Capacity Forecasting',
    title: 'Predictive 7-Day Traffic & Compute Projections',
    description:
      'Machine learning forecasts upcoming surge events, models resource bottlenecks, and recommends exact container replica scaling.',
    tag: 'Predictive ML',
    mockupType: 'analytics',
    preview: {
      stat: '+142% Surge Forecast',
      metric: '8 Pods Needed',
      badge: '100% Headroom',
    },
  },
  {
    id: 'friday-ai',
    category: 'Autonomous AI-CTO & Partner',
    title: 'FRIDAY Neural Voice & Engineering Intelligence',
    description:
      'Powered by Moonshot AI (Kimi K3) via NVIDIA NIM. Converse via fluid, low-latency two-way voice for system design, code analysis, debugging, and 1-click autonomous operational mitigations.',
    tag: 'Voice & Kimi K3',
    mockupType: 'friday',
    preview: {
      stat: 'Two-Way Voice',
      metric: 'Kimi K3 MoE Engine',
      badge: 'Zero Hallucination',
    },
  },
  {
    id: 'integrations',
    category: 'Universal Ingestion',
    title: '2-Minute Snippet & Framework Integrations',
    description:
      'Deploy zero-overhead tracker.js, or connect Shopify, Stripe, Cloudflare, Next.js, and Kubernetes webhooks in minutes.',
    tag: '2-Min Snippet',
    mockupType: 'integrations',
    preview: {
      stat: 'Universal Edge',
      metric: '< 1.2 KB Script',
      badge: 'Zero Client Overhead',
    },
  },
  {
    id: 'audit-logs',
    category: 'Governance & Auditing',
    title: 'Tamper-Evident Decision & Mitigation Log',
    description:
      'Complete audit trail of every AI-suggested mitigation, automated script execution, and engineer sign-off for compliance.',
    tag: 'SOC-2 Ready',
    mockupType: 'audit',
    preview: {
      stat: 'Immutable Record',
      metric: '14 Actions Signed',
      badge: '100% Compliant',
    },
  },
  {
    id: 'settings',
    category: 'Platform Security',
    title: 'Granular API Keys & Multi-Tenant Isolation',
    description:
      'Manage tenant API keys, role-based access control (RBAC), webhook subscriptions, and encrypted telemetry pipelines.',
    tag: 'Enterprise Isolation',
    mockupType: 'security',
    preview: {
      stat: '256-bit Encryption',
      metric: 'Multi-Tenant Shield',
      badge: 'RBAC Active',
    },
  },
  {
    id: 'billing',
    category: 'Usage & Transparency',
    title: 'Real-Time Event Metering & Tier Management',
    description:
      'Granular telemetry event tracking, automated business tier upgrades, invoice logs, and complete cloud ROI visibility.',
    tag: 'Metering & Tiers',
    mockupType: 'billing',
    preview: {
      stat: '74% Event Quota',
      metric: 'Enterprise Plan',
      badge: 'Zero Overage Shock',
    },
  },
];

export function FeatureGridSection({ onExploreFeature }) {
  return (
    <section className="feat-grid" id="features">
      <div className="feat-grid__container">
        {/* Section Header */}
        <div className="feat-grid__header">
          <div className="feat-grid__pill">Complete Product Suite</div>
          <h2 className="feat-grid__title">
            Built for Modern Engineering Teams
          </h2>
          <p className="feat-grid__subtitle">
            From sub-second operational monitoring to autonomous voice diagnostics and predictive capacity forecasting — all in one unified control center.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="feat-grid__cards">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="feat-grid__card"
              onClick={() => onExploreFeature && onExploreFeature(f.id)}
            >
              {/* Card Top / Category */}
              <div className="feat-grid__card-top">
                <span className="feat-grid__category">{f.category}</span>
                <span className="feat-grid__tag">{f.tag}</span>
              </div>

              {/* Title & Description */}
              <h3 className="feat-grid__card-title">{f.title}</h3>
              <p className="feat-grid__card-desc">{f.description}</p>

              {/* Illustrative Preview Mockup Box */}
              <div className={`feat-grid__preview feat-grid__preview--${f.mockupType}`}>
                <div className="feat-grid__preview-header">
                  <div className="feat-grid__preview-dots">
                    <span className="feat-grid__p-dot" />
                    <span className="feat-grid__p-dot" />
                    <span className="feat-grid__p-dot" />
                  </div>
                  <span className="feat-grid__preview-badge">{f.preview.badge}</span>
                </div>

                <div className="feat-grid__preview-content">
                  {f.mockupType === 'dashboard' && (
                    <div className="feat-grid__mock-dash">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.metric}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--green">Stable</span>
                      </div>
                      <div className="feat-grid__mock-bar">
                        <div className="feat-grid__mock-fill" style={{ width: '85%' }} />
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'logs' && (
                    <div className="feat-grid__mock-logs">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--green">SSE Live Tail</span>
                      </div>
                      <div className="feat-grid__mock-log-line">
                        <span className="feat-grid__mock-log-badge feat-grid__mock-log-badge--stream">STREAM</span>
                        <span>[INFO] /api/checkout 200 OK (38ms)</span>
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'analytics' && (
                    <div className="feat-grid__mock-analytics">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--violet">7-Day Model</span>
                      </div>
                      <div className="feat-grid__mock-sparkline">
                        <svg viewBox="0 0 160 30" preserveAspectRatio="none">
                          <path d="M0,25 Q30,22 60,18 T110,8 T160,4" fill="none" stroke="#a855f7" strokeWidth="2" />
                          <path d="M0,25 Q30,22 60,18 T110,8 T160,4 L160,30 L0,30 Z" fill="rgba(168,85,247,0.15)" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'friday' && (
                    <div className="feat-grid__mock-friday">
                      <div className="feat-grid__mock-bubble">
                        <span className="feat-grid__mock-ai-icon">✨</span>
                        <span>"Checked checkout-v2: Thread contention resolved."</span>
                      </div>
                      <div className="feat-grid__mock-wave">
                        <span /><span /><span /><span /><span /><span />
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'integrations' && (
                    <div className="feat-grid__mock-integrations">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--blue">&lt;head&gt; Async</span>
                      </div>
                      <div className="feat-grid__mock-code">
                        &lt;script src=".../tracker.js" async&gt;
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'billing' && (
                    <div className="feat-grid__mock-billing">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--gold">4.2M Events</span>
                      </div>
                      <div className="feat-grid__mock-meter">
                        <div className="feat-grid__mock-meter-fill" style={{ width: '74%' }} />
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'audit' && (
                    <div className="feat-grid__mock-audit">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--green">Verified</span>
                      </div>
                      <div className="feat-grid__mock-code">
                        [08:42:19] AUTO_SCALE: checkout-v2 replica 4-&gt;8 OK
                      </div>
                    </div>
                  )}

                  {f.mockupType === 'security' && (
                    <div className="feat-grid__mock-sec">
                      <div className="feat-grid__mock-row">
                        <span className="feat-grid__mock-val">{f.preview.stat}</span>
                        <span className="feat-grid__mock-pill feat-grid__mock-pill--blue">TLS 1.3</span>
                      </div>
                      <div className="feat-grid__mock-key">
                        aicto_live_89f02a... [Active]
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Link */}
              <div className="feat-grid__action-row">
                <span className="feat-grid__explore-link">
                  Explore Feature
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
