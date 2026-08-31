import React, { useState, useEffect } from 'react';
import './IntegrationStepsSection.css';
import { Button } from '../../../shared/components/Button';

const FRAMEWORK_SNIPPETS = {
  html: {
    label: 'Standard HTML / Head',
    code: `<script src="https://cdn.aicto.io/tracker.js" data-business-id="biz_acme_8921" async></script>`,
    hint: 'Add inside the <head> tag of your main layout or index.html template.',
  },
  react: {
    label: 'Next.js / React',
    code: `<Script src="https://cdn.aicto.io/tracker.js" data-business-id="biz_acme_8921" strategy="afterInteractive" />`,
    hint: 'Place inside app/layout.jsx or _app.js using Next.js Script component.',
  },
  shopify: {
    label: 'Shopify Theme',
    code: `<!-- Insert into theme.liquid before </head> -->\n<script src="https://cdn.aicto.io/tracker.js" data-business-id="biz_acme_8921" async></script>`,
    hint: 'Paste directly into Online Store > Themes > Edit Code > theme.liquid.',
  },
};

const REASSURANCE_POINTS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Universal Compatibility',
    description: 'Works with any site or framework — HTML, React, Next.js, Shopify, WordPress, and custom SPAs.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Zero Performance Lag',
    description: '<1.2 KB async edge script loaded from Cloudflare CDN with zero render-blocking delay.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Built-in Privacy & Masking',
    description: 'Automatic PII masking and token redacting on client events with encrypted edge transport.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: 'Self-Calibrating ML',
    description: 'Autonomous models baseline seasonal traffic patterns without manual alert threshold rules.',
  },
];

export function IntegrationStepsSection({
  onStartFree,
  onBookDemo,
  onExploreApp,
}) {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);
  const [liveEventCount, setLiveEventCount] = useState(24);

  // Live telemetry pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEventCount((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    const snippet = FRAMEWORK_SNIPPETS[activeTab]?.code || FRAMEWORK_SNIPPETS.html.code;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="int-steps" id="how-to-integrate">
      <div className="int-steps__container">
        {/* ── Section Header ── */}
        <div className="int-steps__header">
          <div className="int-steps__pill">
            <span className="int-steps__pill-dot" />
            Zero-Friction Integration
          </div>
          <h2 className="int-steps__title">
            Connect your website in <span className="int-steps__title-accent">3 simple steps</span>
          </h2>
          <p className="int-steps__subtitle">
            No complex setup or infrastructure rewrite. Just paste one lightweight snippet and AI-CTO begins autonomous monitoring immediately.
          </p>
        </div>

        {/* ── 3-Step Walkthrough Flow ── */}
        <div className="int-steps__flow">
          <div className="int-steps__grid">
            {/* ── STEP 1 ── */}
            <div className="int-steps__card int-steps__card--step1">
              <div className="int-steps__card-header">
                <div className="int-steps__step-badge int-steps__step-badge--pink">
                  <span className="int-steps__step-num">01</span>
                  <span className="int-steps__step-phase">PROFILE</span>
                </div>
                <div className="int-steps__icon-wrap int-steps__icon-wrap--pink">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              <div className="int-steps__card-body">
                <h3 className="int-steps__card-title">Create your business</h3>
                <p className="int-steps__card-desc">
                  Sign up and tell AI-CTO about your business (name, industry type, and website URL) to calibrate your dedicated monitoring tenant.
                </p>

                {/* Step 1 Visual Mock */}
                <div className="int-steps__visual-mock int-steps__mock-form">
                  <div className="int-steps__mock-header">
                    <span className="int-steps__mock-title">Business Profile & Domain</span>
                    <span className="int-steps__mock-badge">Auto-Configured</span>
                  </div>

                  <div className="int-steps__mock-field-group">
                    <div className="int-steps__mock-field">
                      <span className="int-steps__mock-label">Business Name</span>
                      <div className="int-steps__mock-input-preview">
                        <span className="int-steps__mock-value">Acme Retail Corp</span>
                        <span className="int-steps__mock-check">✓</span>
                      </div>
                    </div>

                    <div className="int-steps__mock-row">
                      <div className="int-steps__mock-field" style={{ flex: 1.2 }}>
                        <span className="int-steps__mock-label">Business Type</span>
                        <div className="int-steps__mock-tag-preview">
                          <span className="int-steps__mock-tag-icon">🛍️</span>
                          <span className="int-steps__mock-tag-text">E-Commerce</span>
                        </div>
                      </div>

                      <div className="int-steps__mock-field" style={{ flex: 1.5 }}>
                        <span className="int-steps__mock-label">Production Domain</span>
                        <div className="int-steps__mock-input-preview">
                          <span className="int-steps__mock-value int-steps__mock-value--mono">acmestore.io</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="int-steps__mock-footer">
                    <span className="int-steps__mock-biz-id">
                      Assigned Tenant ID: <code>biz_acme_8921</code>
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Connecting Arrow to Step 2 */}
              <div className="int-steps__connector-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* ── STEP 2 ── */}
            <div className="int-steps__card int-steps__card--step2">
              <div className="int-steps__card-header">
                <div className="int-steps__step-badge int-steps__step-badge--yellow">
                  <span className="int-steps__step-num">02</span>
                  <span className="int-steps__step-phase">SNIPPET</span>
                </div>
                <div className="int-steps__icon-wrap int-steps__icon-wrap--yellow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
              </div>

              <div className="int-steps__card-body">
                <h3 className="int-steps__card-title">Paste one snippet</h3>
                <p className="int-steps__card-desc">
                  Copy a single line of JavaScript into your site's <code>&lt;head&gt;</code> tag. It loads asynchronously with zero client overhead.
                </p>

                {/* Step 2 Visual Mock: Interactive Code Box */}
                <div className="int-steps__visual-mock int-steps__mock-code">
                  {/* Framework Selector Tabs */}
                  <div className="int-steps__snippet-tabs">
                    {Object.keys(FRAMEWORK_SNIPPETS).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`int-steps__tab-btn ${
                          activeTab === key ? 'int-steps__tab-btn--active' : ''
                        }`}
                        onClick={() => setActiveTab(key)}
                      >
                        {FRAMEWORK_SNIPPETS[key].label}
                      </button>
                    ))}
                  </div>

                  {/* Code Container */}
                  <div className="int-steps__code-container">
                    <div className="int-steps__code-window-bar">
                      <div className="int-steps__code-dots">
                        <span className="int-steps__dot int-steps__dot--pink" />
                        <span className="int-steps__dot int-steps__dot--yellow" />
                        <span className="int-steps__dot int-steps__dot--green" />
                      </div>
                      <span className="int-steps__code-filename">tracker.js (async)</span>
                    </div>

                    <pre className="int-steps__code-block">
                      <code>{FRAMEWORK_SNIPPETS[activeTab].code}</code>
                    </pre>

                    <button
                      type="button"
                      className={`int-steps__copy-btn ${copied ? 'int-steps__copy-btn--copied' : ''}`}
                      onClick={handleCopy}
                      aria-label="Copy snippet code"
                    >
                      {copied ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="int-steps__mock-footer">
                    <span className="int-steps__snippet-hint">
                      💡 {FRAMEWORK_SNIPPETS[activeTab].hint}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Connecting Arrow to Step 3 */}
              <div className="int-steps__connector-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className="int-steps__card int-steps__card--step3">
              <div className="int-steps__card-header">
                <div className="int-steps__step-badge int-steps__step-badge--coral">
                  <span className="int-steps__step-num">03</span>
                  <span className="int-steps__step-phase">TELEMETRY</span>
                </div>
                <div className="int-steps__icon-wrap int-steps__icon-wrap--coral">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
              </div>

              <div className="int-steps__card-body">
                <h3 className="int-steps__card-title">Watch data flow in</h3>
                <p className="int-steps__card-desc">
                  Telemetry appears on your Dashboard in real time, within seconds of snippet installation. Baseline AI models calibrate automatically.
                </p>

                {/* Step 3 Visual Mock: Live Telemetry Status */}
                <div className="int-steps__visual-mock int-steps__mock-telemetry">
                  <div className="int-steps__telemetry-status">
                    <div className="int-steps__telemetry-pulse-dot">
                      <span className="int-steps__pulse-ring" />
                      <span className="int-steps__pulse-core" />
                    </div>
                    <div className="int-steps__telemetry-status-text">
                      <span className="int-steps__telemetry-badge-title">
                        Snippet detected — telemetry is now live
                      </span>
                      <span className="int-steps__telemetry-meta">
                        Edge node connected • 18ms latency handshake
                      </span>
                    </div>
                  </div>

                  <div className="int-steps__telemetry-metrics-grid">
                    <div className="int-steps__telemetry-metric">
                      <span className="int-steps__metric-val">{liveEventCount}</span>
                      <span className="int-steps__metric-lbl">Live Events Ingested</span>
                    </div>
                    <div className="int-steps__telemetry-divider" />
                    <div className="int-steps__telemetry-metric">
                      <span className="int-steps__metric-val int-steps__metric-val--green">99.98%</span>
                      <span className="int-steps__metric-lbl">Health Score</span>
                    </div>
                    <div className="int-steps__telemetry-divider" />
                    <div className="int-steps__telemetry-metric">
                      <span className="int-steps__metric-val">142ms</span>
                      <span className="int-steps__metric-lbl">p95 Latency</span>
                    </div>
                  </div>

                  <div className="int-steps__mock-footer int-steps__mock-footer--success">
                    <span className="int-steps__success-text">
                      ✓ FRIDAY AI baseline shield activated & streaming
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reassurance Points Row ── */}
        <div className="int-steps__reassurance">
          <div className="int-steps__reassurance-grid">
            {REASSURANCE_POINTS.map((point, idx) => (
              <div key={idx} className="int-steps__reassurance-card">
                <div className="int-steps__reassurance-icon">{point.icon}</div>
                <div className="int-steps__reassurance-content">
                  <h4 className="int-steps__reassurance-title">{point.title}</h4>
                  <p className="int-steps__reassurance-desc">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section Action CTA ── */}
        <div className="int-steps__cta-wrap">
          <div className="int-steps__cta-box">
            <div className="int-steps__cta-content">
              <h3 className="int-steps__cta-title">Ready to protect your website from silent downtime?</h3>
              <p className="int-steps__cta-desc">
                Setup takes under 2 minutes. Start streaming real-user telemetry with zero credit card required.
              </p>
            </div>

            <div className="int-steps__cta-buttons">
              <Button
                variant="primary"
                size="lg"
                className="int-steps__cta-btn-primary"
                onClick={onStartFree}
                iconRight={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                }
              >
                Start Integrating Now
              </Button>

              <button
                type="button"
                className="int-steps__cta-btn-secondary"
                onClick={() => {
                  if (onBookDemo) {
                    onBookDemo();
                  } else if (onExploreApp) {
                    onExploreApp('dashboard');
                  }
                }}
              >
                Explore Sandbox Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
