import React, { useState, useEffect } from 'react';
import './LandingHeader.css';
import { Button } from '../../../shared/components/Button';

export function LandingHeader({ onLogin, onStartFree, onNavigateSection }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className={`landing-header ${isScrolled ? 'landing-header--scrolled' : ''}`}>
      <div className="landing-header__container">
        {/* Brand Logo */}
        <a href="#hero" className="landing-header__logo" onClick={(e) => handleScrollTo(e, 'hero')}>
          <div className="landing-header__logo-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="16" height="16" rx="3.5" />
              <path d="M6 7h8M6 11h5M6 15h3" />
            </svg>
          </div>
          <div className="landing-header__brand-text">
            <span className="landing-header__brand-name">AI-CTO</span>
            <span className="landing-header__brand-badge">2.0</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="landing-header__nav" aria-label="Main Navigation">
          <a
            href="#problem-solution"
            className="landing-header__link"
            onClick={(e) => handleScrollTo(e, 'problem-solution')}
          >
            Why AI-CTO
          </a>
          <a
            href="#value-prop"
            className="landing-header__link"
            onClick={(e) => handleScrollTo(e, 'value-prop')}
          >
            How it Works
          </a>
          <a
            href="#features"
            className="landing-header__link"
            onClick={(e) => handleScrollTo(e, 'features')}
          >
            Platform
          </a>
          <a
            href="#integrations"
            className="landing-header__link"
            onClick={(e) => handleScrollTo(e, 'integrations')}
          >
            Integrations
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="landing-header__actions">
          <button
            type="button"
            className="landing-header__btn-ghost"
            onClick={onLogin}
            aria-label="Log in to your account"
          >
            Log In
          </button>

          <Button
            variant="primary"
            size="md"
            className="landing-header__cta-btn"
            onClick={onStartFree}
            iconRight={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            }
          >
            Start Free
          </Button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="landing-header__hamburger"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="landing-header__mobile-drawer">
          <nav className="landing-header__mobile-nav">
            <a
              href="#problem-solution"
              className="landing-header__mobile-link"
              onClick={(e) => handleScrollTo(e, 'problem-solution')}
            >
              Why AI-CTO
            </a>
            <a
              href="#value-prop"
              className="landing-header__mobile-link"
              onClick={(e) => handleScrollTo(e, 'value-prop')}
            >
              How it Works (Monitor → Detect → Act)
            </a>
            <a
              href="#features"
              className="landing-header__mobile-link"
              onClick={(e) => handleScrollTo(e, 'features')}
            >
              Core Platform Features
            </a>
            <a
              href="#integrations"
              className="landing-header__mobile-link"
              onClick={(e) => handleScrollTo(e, 'integrations')}
            >
              Integrations & Snippet
            </a>
            <div className="landing-header__mobile-actions">
              <button
                type="button"
                className="landing-header__mobile-login-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogin();
                }}
              >
                Log In
              </button>
              <Button
                variant="primary"
                size="lg"
                className="landing-header__mobile-cta"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onStartFree();
                }}
              >
                Get Started Free
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
