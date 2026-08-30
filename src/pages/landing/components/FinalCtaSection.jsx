import React from 'react';
import './FinalCtaSection.css';
import { Button } from '../../../shared/components/Button';

export function FinalCtaSection({ onStartOnboarding, onBookDemo }) {
  return (
    <section className="final-cta">
      <div className="final-cta__container">
        {/* Glow backdrop */}
        <div className="final-cta__glow" />

        <div className="final-cta__card">
          <div className="final-cta__content">
            <span className="final-cta__pill">Instant Setup • Zero Risk</span>

            <h2 className="final-cta__title">
              Connect your first business in{' '}
              <span className="final-cta__title-gradient">2 minutes</span>
            </h2>

            <p className="final-cta__subtitle">
              Deploy our zero-overhead edge telemetry snippet or connect via API.
              FRIDAY AI will baseline your traffic and begin autonomous anomaly detection immediately.
            </p>

            <div className="final-cta__actions">
              <Button
                variant="primary"
                size="lg"
                className="final-cta__primary-btn"
                onClick={onStartOnboarding}
                iconRight={
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                }
              >
                Start Free Onboarding
              </Button>

              <button
                type="button"
                className="final-cta__demo-btn"
                onClick={onBookDemo}
              >
                Schedule Architecture Review
              </button>
            </div>

            {/* Trust checklist */}
            <div className="final-cta__trust-row">
              <div className="final-cta__trust-item">
                <span className="final-cta__check">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="final-cta__trust-item">
                <span className="final-cta__check">✓</span>
                <span>2-minute script installation</span>
              </div>
              <div className="final-cta__trust-item">
                <span className="final-cta__check">✓</span>
                <span>Instant baseline & anomaly shield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
