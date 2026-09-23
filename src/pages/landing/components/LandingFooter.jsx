import React from 'react';
import './LandingFooter.css';

export function LandingFooter({ onExploreApp, onStartFree, onLogin }) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        {/* Main Columns Grid */}
        <div className="landing-footer__grid">
          {/* Brand Column */}
          <div className="landing-footer__brand-col">
            <div className="landing-footer__logo">
              <div className="landing-footer__logo-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="16" height="16" rx="3.5" />
                  <path d="M6 7h8M6 11h5M6 15h3" />
                </svg>
              </div>
              <span className="landing-footer__brand-name">AI-CTO</span>
            </div>

            <p className="landing-footer__tagline">
              Autonomous engineering platform engineered for 100% authentic telemetry monitoring, live Redis log streaming, predictive capacity forecasting, and FRIDAY AI-CTO neural voice orchestration.
            </p>

            <div className="landing-footer__system-status">
              <span className="landing-footer__status-dot" />
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Platform & Core</h4>
            <ul className="landing-footer__links">
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('dashboard')}>
                  Operations Dashboard
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('logs')}>
                  Live Logs & Observability
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('analytics')}>
                  Capacity & Forecasting
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('friday-ai')}>
                  FRIDAY AI-CTO Voice
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('integrations')}>
                  Telemetry & Integrations
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('billing')}>
                  Usage & Subscriptions
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={() => onExploreApp('audit-logs')}>
                  Audit & Decision Log
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Solutions</h4>
            <ul className="landing-footer__links">
              <li><span className="landing-footer__static-link">E-Commerce & Retail</span></li>
              <li><span className="landing-footer__static-link">B2B SaaS & APIs</span></li>
              <li><span className="landing-footer__static-link">Real-Time Marketplaces</span></li>
              <li><span className="landing-footer__static-link">Media & High Throughput</span></li>
              <li><span className="landing-footer__static-link">FinTech Core</span></li>
            </ul>
          </div>

          {/* Resources & Account */}
          <div className="landing-footer__col">
            <h4 className="landing-footer__col-title">Access & Account</h4>
            <ul className="landing-footer__links">
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={onStartFree}>
                  Start Free Onboarding
                </button>
              </li>
              <li>
                <button type="button" className="landing-footer__link-btn" onClick={onLogin}>
                  Customer Log In
                </button>
              </li>
              <li><span className="landing-footer__static-link">Architecture Docs</span></li>
              <li><span className="landing-footer__static-link">API & Webhook Reference</span></li>
              <li><span className="landing-footer__static-link">Security & SOC-2</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Bar */}
        <div className="landing-footer__bottom">
          <div className="landing-footer__copyright">
            © {new Date().getFullYear()} AI-CTO Autonomous Ops Platform. All rights reserved.
          </div>

          <div className="landing-footer__legal">
            <span className="landing-footer__legal-link">Privacy Policy</span>
            <span className="landing-footer__legal-sep">•</span>
            <span className="landing-footer__legal-link">Terms of Service</span>
            <span className="landing-footer__legal-sep">•</span>
            <span className="landing-footer__legal-link">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
