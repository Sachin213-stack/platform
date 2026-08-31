import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { ProblemSolutionSection } from './components/ProblemSolutionSection';
import { CoreValuePropsSection } from './components/CoreValuePropsSection';
import { FeatureGridSection } from './components/FeatureGridSection';
import { IntegrationStepsSection } from './components/IntegrationStepsSection';
import { StatBarSection } from './components/StatBarSection';
import { IntegrationsStripSection } from './components/IntegrationsStripSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { LandingFooter } from './components/LandingFooter';
import { DemoModal } from './components/DemoModal';

export default function LandingPage({
  onLogin,
  onStartFree,
  onExploreApp,
}) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Smooth entrance animations on scroll
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    });

    const elements = document.querySelectorAll('.landing-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleLaunchScenario = (targetNav = 'dashboard') => {
    setIsDemoModalOpen(false);
    if (onExploreApp) {
      onExploreApp(targetNav);
    } else if (onLogin) {
      onLogin();
    }
  };

  const handleScrollSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-page">
      {/* 1. Header / Sticky Nav */}
      <LandingHeader
        onLogin={onLogin}
        onStartFree={onStartFree}
        onNavigateSection={handleScrollSection}
      />

      <main className="landing-page__main">
        {/* 2. Hero Section + Built-For Strip */}
        <LandingHero
          onStartFree={onStartFree}
          onBookDemo={() => setIsDemoModalOpen(true)}
        />

        {/* 3. Problem vs Solution Split */}
        <div className="landing-reveal">
          <ProblemSolutionSection />
        </div>

        {/* 4. Core Value Proposition (Monitor -> Detect -> Act) */}
        <div className="landing-reveal">
          <CoreValuePropsSection />
        </div>

        {/* 5. Use-Case / Feature Grid */}
        <div className="landing-reveal">
          <FeatureGridSection
            onExploreFeature={(featureId) => {
              if (onExploreApp) {
                onExploreApp(featureId);
              } else {
                setIsDemoModalOpen(true);
              }
            }}
          />
        </div>

        {/* 6. How to Integrate (3-Step Walkthrough) */}
        <div className="landing-reveal">
          <IntegrationStepsSection
            onStartFree={onStartFree}
            onBookDemo={() => setIsDemoModalOpen(true)}
            onExploreApp={onExploreApp}
          />
        </div>

        {/* 7. Stat Bar */}
        <div className="landing-reveal">
          <StatBarSection />
        </div>

        {/* 7. Integrations Strip & 2-Minute Snippet */}
        <div className="landing-reveal">
          <IntegrationsStripSection />
        </div>

        {/* 8. Final CTA Banner */}
        <div className="landing-reveal">
          <FinalCtaSection
            onStartOnboarding={onStartFree}
            onBookDemo={() => setIsDemoModalOpen(true)}
          />
        </div>
      </main>

      {/* 9. Footer */}
      <LandingFooter
        onExploreApp={onExploreApp}
        onStartFree={onStartFree}
        onLogin={onLogin}
      />

      {/* Interactive Demo / Scenario Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onLaunchSandbox={handleLaunchScenario}
      />
    </div>
  );
}
