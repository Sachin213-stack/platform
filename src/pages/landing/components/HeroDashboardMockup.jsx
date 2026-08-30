import React, { useState, useEffect } from 'react';
import { Badge } from '../../../shared/components/Badge';

export function HeroDashboardMockup({ onTryInteractive }) {
  const [anomalyResolved, setAnomalyResolved] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  // Periodic heartbeat animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveToggle = () => {
    setAnomalyResolved((prev) => !prev);
    if (onTryInteractive) {
      onTryInteractive();
    }
  };

  return (
    <div className="hero-cluster">
      {/* Background ambient lighting aura behind the cards */}
      <div className="hero-cluster__glow" />

      {/* Floating Badge 1: Top-Left Telemetry Ingest */}
      <div className="hero-cluster__float hero-cluster__float--left">
        <div className="hero-cluster__float-icon hero-cluster__float-icon--rose">⚡</div>
        <div className="hero-cluster__float-text">
          <div className="hero-cluster__float-title">18ms Telemetry Ingest</div>
          <div className="hero-cluster__float-sub">Zero CPU overhead on client</div>
        </div>
      </div>

      {/* Floating Badge 2: Bottom-Right FRIDAY AI */}
      <div className="hero-cluster__float hero-cluster__float--right">
        <div className="hero-cluster__float-icon hero-cluster__float-icon--gold">✨</div>
        <div className="hero-cluster__float-text">
          <div className="hero-cluster__float-title">FRIDAY Autonomous AI</div>
          <div className="hero-cluster__float-sub">Prevented 3 outages today</div>
        </div>
      </div>

      {/* ── CARD A: Live Dashboard KPI Strip (Tilted Left) ────────── */}
      <div className="hero-card hero-card--kpi" id="hero-card-kpi">
        {/* Card Chrome */}
        <div className="hero-card__chrome">
          <div className="hero-card__dots">
            <span className="hero-card__dot hero-card__dot--red" />
            <span className="hero-card__dot hero-card__dot--yellow" />
            <span className="hero-card__dot hero-card__dot--green" />
          </div>
          <div className="hero-card__url-bar">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="10" height="8" rx="2" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span>app.ai-cto.io/telemetry</span>
          </div>
          <div className="hero-card__status-indicator">
            <span className="hero-card__pulse-dot" key={`kpi-${pulseKey}`} />
            <span>Live Stream</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="hero-card__body">
          <div className="hero-card__header-inline">
            <div className="hero-card__avatar">AR</div>
            <div>
              <div className="hero-card__meta-title">Apex Retail Core</div>
              <div className="hero-card__meta-sub">Telemetry Engine • us-east-1</div>
            </div>
            <span className="hero-card__health-badge">99.99% Uptime</span>
          </div>

          <div className="hero-card__kpis-grid">
            {/* KPI 1 */}
            <div className="hero-card__kpi-tile">
              <div className="hero-card__kpi-top">
                <span className="hero-card__kpi-label">Avg Latency (p95)</span>
                <span className="hero-card__badge-green">↓ -6.2%</span>
              </div>
              <div className="hero-card__kpi-number">
                142 <span className="hero-card__kpi-unit">ms</span>
              </div>
              <div className="hero-card__kpi-desc">Baseline: 151ms (Healthy)</div>
            </div>

            {/* KPI 2 */}
            <div className="hero-card__kpi-tile">
              <div className="hero-card__kpi-top">
                <span className="hero-card__kpi-label">Traffic Throughput</span>
                <span className="hero-card__badge-rose">↑ +18.4%</span>
              </div>
              <div className="hero-card__kpi-number">
                14.2 <span className="hero-card__kpi-unit">k req/s</span>
              </div>
              <div className="hero-card__kpi-desc">Peak holiday surge</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD B: Real-Time Stream Analytics Chart (Tilted Right) ────────── */}
      <div className="hero-card hero-card--chart" id="hero-card-chart">
        {/* Card Chrome */}
        <div className="hero-card__chrome">
          <div className="hero-card__dots">
            <span className="hero-card__dot hero-card__dot--red" />
            <span className="hero-card__dot hero-card__dot--yellow" />
            <span className="hero-card__dot hero-card__dot--green" />
          </div>
          <div className="hero-card__url-bar">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="10" height="8" rx="2" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span>app.ai-cto.io/analytics</span>
          </div>
          <div className="hero-card__status-indicator">
            <span className="hero-card__pulse-dot" key={`chart-${pulseKey}`} />
            <span>Telemetry Horizon</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="hero-card__body">
          <div className="hero-card__chart-head">
            <div className="hero-card__chart-title-wrap">
              <span className="hero-card__live-beacon" />
              <span className="hero-card__chart-title">Real-Time Traffic & Anomaly Horizon</span>
            </div>
            <span className="hero-card__chart-subtag">Sub-second stream</span>
          </div>

          <div className="hero-card__svg-wrap">
            <svg viewBox="0 0 460 135" className="hero-card__svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lightHeroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                  <stop offset="65%" stopColor="#fb7185" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lightHeroLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="45%" stopColor="#ec4899" />
                  <stop offset="80%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="35" x2="460" y2="35" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="460" y2="70" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="460" y2="105" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" />

              {/* Area fill */}
              <path
                d="M0,95 Q40,90 80,75 T160,85 T240,65 T320,38 T400,60 L460,52 L460,135 L0,135 Z"
                fill="url(#lightHeroGrad)"
              />

              {/* Stroke Line */}
              <path
                d="M0,95 Q40,90 80,75 T160,85 T240,65 T320,38 T400,60 L460,52"
                fill="none"
                stroke="url(#lightHeroLine)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Anomaly Detection Point */}
              <circle cx="320" cy="38" r="5" fill="#f59e0b" className="hero-card__chart-pulse" />
              <circle cx="320" cy="38" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />

              {/* Resolved Target Point */}
              <circle cx="460" cy="52" r="4.5" fill="#10b981" />
            </svg>

            <div className="hero-card__chart-badge-overlay">
              <span className="hero-card__chart-pill">⚡ FRIDAY Auto-Scaled Replica</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD C: FRIDAY AI Incident & Auto-Remediation (Tilted Foreground) ────────── */}
      <div className="hero-card hero-card--ai" id="hero-card-ai">
        {/* Card Chrome */}
        <div className="hero-card__chrome">
          <div className="hero-card__dots">
            <span className="hero-card__dot hero-card__dot--red" />
            <span className="hero-card__dot hero-card__dot--yellow" />
            <span className="hero-card__dot hero-card__dot--green" />
          </div>
          <div className="hero-card__url-bar">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="10" height="8" rx="2" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span>app.ai-cto.io/ops/control-center</span>
          </div>
          <div className="hero-card__status-indicator">
            <span className="hero-card__pulse-dot" key={`ai-${pulseKey}`} />
            <span>Autonomous Shield: Active</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="hero-card__body">
          <div className="hero-card__ai-top">
            <div className="hero-card__ai-badges">
              <Badge variant={anomalyResolved ? 'success' : 'warning'} size="sm">
                {anomalyResolved ? 'Resolved' : 'Critical Anomaly Detected'}
              </Badge>
              <span className="hero-card__ai-time">Just now</span>
            </div>
            <span className="hero-card__ai-service">checkout-v2.svc</span>
          </div>

          <div className="hero-card__ai-headline">
            {anomalyResolved
              ? 'Replica capacity scaled (4 → 8) & cache warmed'
              : 'Checkout Latency Spike (p99 > 820ms)'}
          </div>

          <div className="hero-card__ai-box">
            <div className="hero-card__ai-box-header">
              <span className="hero-card__ai-box-tag">✨ FRIDAY AI Root-Cause</span>
              <span className="hero-card__ai-confidence">99.2% confidence</span>
            </div>
            <p className="hero-card__ai-box-text">
              {anomalyResolved
                ? 'p99 latency normalized to 142ms. Session cache hit ratio stabilized at 97.4%.'
                : 'Sudden surge in cart checkout queries causing thread pool exhaustion on 4 pods.'}
            </p>
          </div>

          <div className="hero-card__ai-action">
            <button
              type="button"
              className={`hero-card__action-btn ${anomalyResolved ? 'hero-card__action-btn--resolved' : ''}`}
              onClick={handleResolveToggle}
            >
              {anomalyResolved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                  <span>Remediation Executed (420ms)</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                  <span>1-Click Auto Scale & Warm Cache</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
