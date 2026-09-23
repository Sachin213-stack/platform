import React from 'react';
import './LandingHero.css';
import { Button } from '../../../shared/components/Button';
import { HeroDashboardMockup } from './HeroDashboardMockup';
import { BuiltForStrip } from './BuiltForStrip';

export function LandingHero({ onStartFree, onBookDemo }) {
  return (
    <section className="landing-hero" id="hero">
      {/* Background ambient lighting effects */}
      <div className="landing-hero__ambient-glow-top" />
      <div className="landing-hero__ambient-glow-right" />
      <div className="landing-hero__grid-bg" />

      <div className="landing-hero__container">
        {/* Top Badge Announcement */}
        <div className="landing-hero__announcement">
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-pulse" />
            <span className="landing-hero__badge-text">Next-Gen Autonomous Engineering</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="landing-hero__title">
          Your AI-powered CTO —{' '}
          <span className="landing-hero__title-gradient">
            catch anomalies before they become outages
          </span>
        </h1>

        {/* Subtext */}
        <p className="landing-hero__subtext">
          Sub-second real-time telemetry, live Redis log streaming, AI-driven root-cause anomaly detection,
          and FRIDAY — your autonomous voice and chat AI-CTO keeping your digital stack resilient around the clock.
        </p>

        {/* Dual CTAs */}
        <div className="landing-hero__actions">
          <Button
            variant="primary"
            size="lg"
            className="landing-hero__cta-primary"
            onClick={onStartFree}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            }
          >
            Start Free
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="landing-hero__cta-secondary"
            onClick={onBookDemo}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            }
          >
            Explore Live Demo
          </Button>
        </div>

        {/* Trust micro-text */}
        <div className="landing-hero__micro-trust">
          <span>✓ 2-Minute Snippet Setup</span>
          <span className="landing-hero__bullet">•</span>
          <span>✓ 100% Authentic Telemetry (Zero Fake Demo Data)</span>
          <span className="landing-hero__bullet">•</span>
          <span>✓ Zero Client-Side Overhead</span>
        </div>

        {/* Hero Visual Mockup */}
        <div className="landing-hero__mockup-wrapper">
          <HeroDashboardMockup onTryInteractive={onBookDemo} />
        </div>

        {/* Built For Vertical Strip */}
        <BuiltForStrip />
      </div>
    </section>
  );
}
