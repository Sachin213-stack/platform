import React, { useState } from 'react';
import './CoreValuePropsSection.css';

const VALUE_STEPS = [
  {
    step: '01',
    phase: 'MONITOR',
    title: 'Sub-Second Telemetry & Redis Log Stream',
    description:
      'Lightweight edge sensors and Redis Streams ingest p95 latencies, live server logs, frontend JavaScript errors, and checkout conversions in real-time with zero client CPU lag.',
    accent: 'pink',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    visual: {
      tag: 'Edge Ingestion & Logs Active',
      stat1: '18ms',
      label1: 'Ingest Latency',
      stat2: '14.2k/s',
      label2: 'Event Stream',
      highlight: 'Zero agent CPU overhead',
    },
  },
  {
    step: '02',
    phase: 'DETECT',
    title: 'AI Anomaly Modeling & Root-Cause Pinpoint',
    description:
      'Continuous machine learning models seasonal baselines and isolates true infrastructure degradation from expected traffic surges in under 180ms with zero synthetic noise.',
    accent: 'yellow',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    visual: {
      tag: 'Neural Anomaly Engine',
      stat1: '< 180ms',
      label1: 'Detection Horizon',
      stat2: '99.4%',
      label2: 'Model Confidence',
      highlight: 'Filtered 98% noisy alarms',
    },
  },
  {
    step: '03',
    phase: 'ACT',
    title: 'FRIDAY AI-CTO & Auto-Remediation',
    description:
      'Converse naturally via voice or chat with your AI-CTO powered by Moonshot AI Kimi K3, and execute 1-click mitigation actions — auto-scaling replicas, flushing caches, or rollback.',
    accent: 'coral',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    visual: {
      tag: 'FRIDAY AI-CTO Co-Pilot',
      stat1: '420ms',
      label1: 'Action Execution',
      stat2: 'Two-Way',
      label2: 'Neural Voice',
      highlight: 'Voice & chat orchestration',
    },
  },
];

export function CoreValuePropsSection() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="core-val" id="value-prop">
      <div className="core-val__container">
        {/* Section Header */}
        <div className="core-val__header">
          <div className="core-val__pill">The AI-CTO Operational Loop</div>
          <h2 className="core-val__title">
            Monitor → Detect → Act
          </h2>
          <p className="core-val__subtitle">
            An autonomous engineering feedback loop designed to prevent outages before your customers or revenue are impacted.
          </p>
        </div>

        {/* 3-Step Flow Diagram Container */}
        <div className="core-val__flow-wrapper">
          <div className="core-val__steps-grid">
            {VALUE_STEPS.map((item, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={item.phase}
                  className={`core-val__card core-val__card--${item.accent} ${
                    isSelected ? 'core-val__card--selected' : ''
                  }`}
                  onClick={() => setActiveStep(idx)}
                >
                  {/* Step Number & Connector */}
                  <div className="core-val__card-top">
                    <div className="core-val__step-badge">
                      <span className="core-val__step-num">{item.step}</span>
                      <span className="core-val__step-phase">{item.phase}</span>
                    </div>
                    <div className="core-val__icon-wrap">{item.icon}</div>
                  </div>

                  {/* Body Info */}
                  <h3 className="core-val__card-title">{item.title}</h3>
                  <p className="core-val__card-desc">{item.description}</p>

                  {/* Micro Visual Card */}
                  <div className="core-val__visual-box">
                    <div className="core-val__visual-tag">
                      <span className="core-val__visual-dot" />
                      {item.visual.tag}
                    </div>

                    <div className="core-val__visual-stats">
                      <div className="core-val__visual-stat">
                        <span className="core-val__stat-num">{item.visual.stat1}</span>
                        <span className="core-val__stat-lbl">{item.visual.label1}</span>
                      </div>
                      <div className="core-val__visual-divider" />
                      <div className="core-val__visual-stat">
                        <span className="core-val__stat-num">{item.visual.stat2}</span>
                        <span className="core-val__stat-lbl">{item.visual.label2}</span>
                      </div>
                    </div>

                    <div className="core-val__visual-footer">
                      ✓ {item.visual.highlight}
                    </div>
                  </div>

                  {/* Arrow Connector for Desktop (except last step) */}
                  {idx < VALUE_STEPS.length - 1 && (
                    <div className="core-val__connector-arrow" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
