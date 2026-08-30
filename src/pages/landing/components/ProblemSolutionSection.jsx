import React from 'react';
import './ProblemSolutionSection.css';

export function ProblemSolutionSection() {
  return (
    <section className="prob-sol" id="problem-solution">
      <div className="prob-sol__container">
        {/* Section Header */}
        <div className="prob-sol__header">
          <div className="prob-sol__pill">Shift from Reactive to Autonomous</div>
          <h2 className="prob-sol__title">
            Stop firefighting outages after your customers notice them.
          </h2>
          <p className="prob-sol__subtitle">
            Traditional observability tools dump thousands of noisy alerts on your on-call engineers.
            AI-CTO monitors every microservice, models dynamic seasonal baselines, and intervenes before incidents spiral.
          </p>
        </div>

        {/* 2-Column Comparative Split */}
        <div className="prob-sol__grid">
          {/* Left Column: Without AI-CTO (The Problem) */}
          <div className="prob-sol__card prob-sol__card--problem">
            <div className="prob-sol__card-header">
              <div className="prob-sol__status-icon prob-sol__status-icon--problem">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div>
                <span className="prob-sol__card-tag prob-sol__card-tag--problem">Traditional Observability</span>
                <h3 className="prob-sol__card-title">Without AI-CTO</h3>
              </div>
            </div>

            <ul className="prob-sol__list">
              <li className="prob-sol__item prob-sol__item--problem">
                <div className="prob-sol__bullet prob-sol__bullet--gray">✕</div>
                <div>
                  <strong>Alert fatigue & noisy dashboards:</strong> Over 1,000+ alerts flood Slack channels daily. Engineers miss the critical 1% that actually causes downtime.
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--problem">
                <div className="prob-sol__bullet prob-sol__bullet--gray">✕</div>
                <div>
                  <strong>Delayed detection (15–45 min MTTR):</strong> By the time static thresholds trigger alarms, users have already abandoned carts and transactions have failed.
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--problem">
                <div className="prob-sol__bullet prob-sol__bullet--gray">✕</div>
                <div>
                  <strong>High-stress manual war rooms:</strong> 4+ senior engineers pull logs across 10 tabs guessing whether the DB pool, Redis cache, or third-party API is failing.
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--problem">
                <div className="prob-sol__bullet prob-sol__bullet--gray">✕</div>
                <div>
                  <strong>Guesswork on capacity planning:</strong> Overprovisioning cloud infrastructure by 35–50% out of fear of Black Friday or flash sale crashes.
                </div>
              </li>
            </ul>

            {/* Negative Metric Callout */}
            <div className="prob-sol__kpi-mockup prob-sol__kpi-mockup--problem">
              <div className="prob-sol__kpi-top">
                <span className="prob-sol__kpi-label">Average Incident Triage Delay</span>
                <span className="prob-sol__badge-gray">+38 mins to diagnose</span>
              </div>
              <div className="prob-sol__kpi-value-row">
                <span className="prob-sol__kpi-value prob-sol__kpi-value--gray">42.8 min</span>
                <span className="prob-sol__kpi-sub">Customer checkout churn spike (+14.2%)</span>
              </div>
            </div>
          </div>

          {/* Right Column: With AI-CTO (The Solution with Pink & Yellow) */}
          <div className="prob-sol__card prob-sol__card--solution">
            <div className="prob-sol__card-header">
              <div className="prob-sol__status-icon prob-sol__status-icon--solution">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <span className="prob-sol__card-tag prob-sol__card-tag--solution">Autonomous Intelligence</span>
                <h3 className="prob-sol__card-title">With AI-CTO</h3>
              </div>
            </div>

            <ul className="prob-sol__list">
              <li className="prob-sol__item prob-sol__item--solution">
                <div className="prob-sol__bullet prob-sol__bullet--pink">✓</div>
                <div>
                  <strong>Sub-second telemetry & anomaly detection:</strong> AI evaluates multi-variate deviations in &lt;180ms, catching subtle degradation before customers notice.
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--solution">
                <div className="prob-sol__bullet prob-sol__bullet--pink">✓</div>
                <div>
                  <strong>Instant AI root-cause diagnostics:</strong> FRIDAY analyzes telemetry correlations and gives precise diagnosis: "Thread starvation in checkout-v2 pod replica 3".
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--solution">
                <div className="prob-sol__bullet prob-sol__bullet--pink">✓</div>
                <div>
                  <strong>1-Click & automated remediation:</strong> Pre-validated mitigation actions (auto-scaling pods, clearing deadlocks, cache warming) executed in milliseconds.
                </div>
              </li>
              <li className="prob-sol__item prob-sol__item--solution">
                <div className="prob-sol__bullet prob-sol__bullet--pink">✓</div>
                <div>
                  <strong>Predictive capacity forecasting:</strong> ML models project traffic & compute needs 7 days ahead, ensuring 100% capacity headroom at optimal cloud cost.
                </div>
              </li>
            </ul>

            {/* Positive Product Metric Cards with Pink and Gold */}
            <div className="prob-sol__solution-kpis">
              <div className="prob-sol__kpi-mockup prob-sol__kpi-mockup--solution">
                <div className="prob-sol__kpi-top">
                  <span className="prob-sol__kpi-label">Avg Response Time</span>
                  <span className="prob-sol__badge-gold">↓ -6.2% vs yesterday</span>
                </div>
                <div className="prob-sol__kpi-value-row">
                  <span className="prob-sol__kpi-value">142 ms</span>
                  <span className="prob-sol__kpi-sub">Sub-second telemetry verified</span>
                </div>
              </div>

              <div className="prob-sol__kpi-mockup prob-sol__kpi-mockup--solution">
                <div className="prob-sol__kpi-top">
                  <span className="prob-sol__kpi-label">Mean Time to Detect (MTTD)</span>
                  <span className="prob-sol__badge-pink">⚡ 94% faster triage</span>
                </div>
                <div className="prob-sol__kpi-value-row">
                  <span className="prob-sol__kpi-value">&lt; 1.2 s</span>
                  <span className="prob-sol__kpi-sub">Zero unmitigated outages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
