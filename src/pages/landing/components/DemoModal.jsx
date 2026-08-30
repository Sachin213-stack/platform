import React, { useState } from 'react';
import './DemoModal.css';
import { Button } from '../../../shared/components/Button';

export function DemoModal({ isOpen, onClose, onLaunchSandbox }) {
  const [selectedScenario, setSelectedScenario] = useState('flash-sale');
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'flash-sale',
      title: 'E-Commerce Flash Sale Surge',
      desc: 'Simulate 10x traffic spike, p99 latency evaluation, and automated pod scaling.',
      badge: 'High Concurrency',
    },
    {
      id: 'checkout-ano',
      title: 'Checkout Service Anomaly & FRIDAY Triage',
      desc: 'Inject artificial database pool lock and watch FRIDAY AI isolate the root cause in 420ms.',
      badge: 'Root-Cause AI',
    },
    {
      id: 'capacity-pred',
      title: '7-Day Capacity Surge Forecasting',
      desc: 'Evaluate seasonal machine learning models against 14 days of simulated historical telemetry.',
      badge: 'Predictive ML',
    },
  ];

  const handleSimulate = (scenarioId) => {
    setStatusMessage(`Scenario "${scenarios.find(s => s.id === scenarioId)?.title}" loaded into sandbox!`);
    setTimeout(() => {
      onLaunchSandbox(scenarioId === 'capacity-pred' ? 'analytics' : 'dashboard');
    }, 800);
  };

  return (
    <div className="demo-modal__overlay" onClick={onClose}>
      <div className="demo-modal__content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="demo-modal__close" onClick={onClose} aria-label="Close demo modal">
          ✕
        </button>

        <div className="demo-modal__header">
          <div className="demo-modal__pill">Interactive Sandbox & Demo</div>
          <h3 className="demo-modal__title">Experience AI-CTO in Action</h3>
          <p className="demo-modal__subtitle">
            Explore live scenarios with pre-configured telemetry or launch straight into the full interactive operations control center.
          </p>
        </div>

        {statusMessage && (
          <div className="demo-modal__status-banner">
            <span className="demo-modal__status-dot" />
            {statusMessage}
          </div>
        )}

        <div className="demo-modal__scenarios">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`demo-modal__scenario-card ${selectedScenario === sc.id ? 'demo-modal__scenario-card--active' : ''}`}
              onClick={() => setSelectedScenario(sc.id)}
            >
              <div className="demo-modal__card-top">
                <span className="demo-modal__card-title">{sc.title}</span>
                <span className="demo-modal__card-badge">{sc.badge}</span>
              </div>
              <p className="demo-modal__card-desc">{sc.desc}</p>
            </div>
          ))}
        </div>

        <div className="demo-modal__actions">
          <Button
            variant="primary"
            size="lg"
            className="demo-modal__launch-btn"
            onClick={() => handleSimulate(selectedScenario)}
            iconRight={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            }
          >
            Launch Interactive Scenario
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            Back to Landing Page
          </Button>
        </div>
      </div>
    </div>
  );
}
