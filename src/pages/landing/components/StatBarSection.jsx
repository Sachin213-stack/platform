import React from 'react';
import './StatBarSection.css';

const STATS = [
  {
    value: '< 180ms',
    label: 'Sub-Second Anomaly Detection',
    description: 'Multi-variate ML evaluations executed before latency cascades to users.',
    accent: 'pink',
  },
  {
    value: '24/7 / 365',
    label: 'Autonomous Ops Surveillance',
    description: 'Continuous seasonal baseline modeling with zero human alert fatigue.',
    accent: 'yellow',
  },
  {
    value: '100% Isolated',
    label: 'Multi-Tenant Architecture',
    description: 'Dedicated business partitions, encrypted telemetry, and RBAC control.',
    accent: 'coral',
  },
];

export function StatBarSection() {
  return (
    <section className="stat-bar">
      <div className="stat-bar__container">
        <div className="stat-bar__glow" />

        <div className="stat-bar__inner">
          <div className="stat-bar__grid">
            {STATS.map((s, idx) => (
              <div key={idx} className={`stat-bar__item stat-bar__item--${s.accent}`}>
                <div className="stat-bar__value">{s.value}</div>
                <div className="stat-bar__label">{s.label}</div>
                <p className="stat-bar__desc">{s.description}</p>
              </div>
            ))}
          </div>

          {/* Context Note / Disclaimer */}
          <div className="stat-bar__disclaimer">
            <span className="stat-bar__info-icon">ℹ</span>
            <span>Target architectural performance benchmarks engineered for high-throughput digital workloads.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
