import React, { useState } from 'react';
import './IntegrationsStripSection.css';
import { generateTrackingSnippet } from '../../../modules/onboarding/onboardingConfig';

const INTEGRATIONS = [
  {
    name: 'Shopify',
    category: 'E-Commerce & Orders',
    desc: 'Cart events & checkout webhooks',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    status: 'Ready',
  },
  {
    name: 'Stripe',
    category: 'Payment Infrastructure',
    desc: 'Auth failure & webhook monitoring',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    status: 'Ready',
  },
  {
    name: 'Google Analytics',
    category: 'Traffic & Funnels',
    desc: 'Funnel drop-off correlation',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    status: 'Ready',
  },
  {
    name: 'Slack',
    category: 'Incident Orchestration',
    desc: 'FRIDAY alerts & 1-click triage',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="13" y="2" width="3" height="8" rx="1.5" />
        <path d="M19 8.5a1.5 1.5 0 0 1-1.5 1.5H16V7a1.5 1.5 0 0 1 3 1.5z" />
        <rect x="8" y="14" width="3" height="8" rx="1.5" />
        <path d="M5 15.5A1.5 1.5 0 0 1 6.5 14H8v3a1.5 1.5 0 0 1-3-1.5z" />
      </svg>
    ),
    status: 'Ready',
  },
  {
    name: 'Cloudflare',
    category: 'CDN & Edge Cache',
    desc: 'Cache hit ratio & DDoS stream',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
    status: 'Ready',
  },
  {
    name: 'AWS & Kubernetes',
    category: 'Compute & Containers',
    desc: 'Pod scaling & resource telemetry',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
      </svg>
    ),
    status: 'Ready',
  },
];

export function IntegrationsStripSection() {
  const [copied, setCopied] = useState(false);
  const snippetCode = generateTrackingSnippet('11111111-1111-1111-1111-111111111111', 'sk_live_sample_telemetry_key');

  const handleCopy = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="integrations" id="integrations">
      <div className="integrations__container">
        {/* Section Header */}
        <div className="integrations__header">
          <div className="integrations__pill">Seamless Ecosystem</div>
          <h2 className="integrations__title">
            Integrates with your stack in minutes
          </h2>
          <p className="integrations__subtitle">
            Connect your stores, payment gateways, analytics providers, and communication channels without rewriting backend services.
          </p>
        </div>

        {/* Integration Badges Grid */}
        <div className="integrations__grid">
          {INTEGRATIONS.map((item, idx) => (
            <div key={idx} className="integrations__card">
              <div className="integrations__icon-wrap">{item.icon}</div>
              <div className="integrations__info">
                <div className="integrations__card-head">
                  <span className="integrations__name">{item.name}</span>
                  <span className="integrations__status-tag">{item.status}</span>
                </div>
                <span className="integrations__category">{item.category}</span>
                <p className="integrations__desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Minute Snippet Card */}
        <div className="integrations__snippet-box">
          <div className="integrations__snippet-header">
            <div className="integrations__snippet-title-group">
              <span className="integrations__snippet-pulse" />
              <span className="integrations__snippet-title">Instant 2-Minute Telemetry Snippet</span>
            </div>
            <button
              type="button"
              className="integrations__copy-btn"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="5" width="9" height="9" rx="1.5" />
                    <path d="M3 11V3a1 1 0 0 1 1-1h8" />
                  </svg>
                  Copy Snippet
                </>
              )}
            </button>
          </div>

          <div className="integrations__code-wrap">
            <code>{snippetCode}</code>
          </div>

          <div className="integrations__snippet-footer">
            <span>⚡ Paste into your &lt;head&gt; tag • Automatic DOM performance metrics & error capturing initialized immediately.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
