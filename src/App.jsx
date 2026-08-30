import { useState, useEffect, useCallback } from 'react';
import AppShell from './shared/layout/AppShell';
import DashboardPage from './modules/monitor/DashboardPage';
import SettingsPage from './pages/settings/SettingsPage';
import AnalyticsPage from './modules/monitor/AnalyticsPage';
import FridayAIPage from './modules/act/FridayAIPage';
import AuditLogPage from './modules/detect/AuditLogPage';
import BillingPage from './pages/billing/BillingPage';
import LandingPage from './pages/landing/LandingPage';
import { ToastProvider, useToast } from './shared/components/Toast';
import { ThemeProvider } from './shared/context/ThemeContext';
import { TenantProvider, useTenant } from './shared/context/TenantContext';
import { AnalyticsProvider } from './shared/context/AnalyticsContext';
import { OnboardingWizard } from './modules/onboarding/OnboardingWizard';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

/* ── Lightweight URL-based routing helpers (no React Router needed) ── */
const APP_BASE = '/app';

/** Read current pathname from the browser */
function getCurrentPath() {
  return window.location.pathname;
}

/** Navigate to a path via pushState (no page reload) */
function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
    // Dispatch a custom event so React state can react to pushState changes
    window.dispatchEvent(new Event('app-navigate'));
  }
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('aicto_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [navContext, setNavContext] = useState(null);
  const { addToast } = useToast();
  const { isOnboardingOpen, openOnboarding, closeOnboarding } = useTenant();

  /* ── Listen for popstate (back/forward) and our custom pushState events ── */
  useEffect(() => {
    const syncPath = () => setCurrentPath(getCurrentPath());
    window.addEventListener('popstate', syncPath);
    window.addEventListener('app-navigate', syncPath);
    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('app-navigate', syncPath);
    };
  }, []);

  /* ── URL ↔ auth-state redirect logic ── */
  useEffect(() => {
    const path = currentPath;

    if (isLoggedIn && (path === '/' || path === '')) {
      // Authenticated user on landing page → redirect to /app
      navigateTo(APP_BASE);
    } else if (!isLoggedIn && path.startsWith(APP_BASE)) {
      // Unauthenticated user trying to access /app → redirect to landing
      navigateTo('/');
    }
  }, [isLoggedIn, currentPath]);

  const handleNavigate = useCallback((targetNav, context = null) => {
    setCurrentNav(targetNav);
    setNavContext(context);
    // Ensure we're on the app route when navigating within the app
    navigateTo(APP_BASE);
  }, []);

  const handleLogin = useCallback((targetNav = 'dashboard') => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('aicto_is_logged_in', 'true');
    } catch {}
    setCurrentNav(targetNav);
    setNavContext(null);
    navigateTo(APP_BASE);
    addToast('Welcome back to AI-CTO Operations Platform', 'success');
  }, [addToast]);

  const handleStartFree = useCallback(() => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('aicto_is_logged_in', 'true');
    } catch {}
    navigateTo(APP_BASE);
    openOnboarding();
  }, [openOnboarding]);

  const handleSignOut = useCallback(() => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('aicto_is_logged_in', 'false');
    } catch {}
    navigateTo('/');
    addToast('Signed out successfully.', 'info');
  }, [addToast]);

  const handleShowToast = useCallback(({ title, message, variant = 'success' }) => {
    addToast(`${title ? `${title}: ` : ''}${message}`, variant);
  }, [addToast]);

  // Derive topbar title dynamically
  const getPageTitle = () => {
    switch (currentNav) {
      case 'dashboard':
        return 'Operations Control Center';
      case 'analytics':
        return 'Analytics & Forecasting';
      case 'friday-ai':
        return 'FRIDAY AI Assistant';
      case 'billing':
        return 'Billing & Subscriptions';
      case 'settings':
        return 'Platform Settings';
      case 'audit-logs':
        return 'Audit & Decision Log';
      default:
        return 'Operations Control Center';
    }
  };

  /* ── Determine which view to render based on URL + auth state ── */
  const isOnAppRoute = currentPath.startsWith(APP_BASE);

  // Show Landing Page: at "/" when not logged in
  // (If logged in at "/", the useEffect above will redirect to /app)
  if (!isLoggedIn && !isOnAppRoute) {
    return (
      <>
        <LandingPage
          onLogin={() => handleLogin('dashboard')}
          onStartFree={handleStartFree}
          onExploreApp={(targetNav) => handleLogin(targetNav || 'dashboard')}
        />

        {/* Global Multi-Step Onboarding Wizard Modal */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          onCompleted={() => {
            handleNavigate('dashboard');
          }}
        />
      </>
    );
  }

  // Show Authenticated App: at "/app" when logged in
  // (If not logged in at "/app", the useEffect above will redirect to /)
  return (
    <>
      <AppShell
        activeNav={currentNav}
        onNavChange={(id) => {
          setCurrentNav(id);
          setNavContext(null);
        }}
        onSignOut={handleSignOut}
        pageTitle={getPageTitle()}
      >
        <ErrorBoundary
          resetKey={currentNav}
          routeName={getPageTitle()}
          onNavigate={handleNavigate}
        >
          {currentNav === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
            />
          )}

          {currentNav === 'analytics' && (
            <AnalyticsPage
              onNavigate={handleNavigate}
            />
          )}

          {currentNav === 'friday-ai' && (
            <FridayAIPage
              initialContext={navContext}
              onNavigate={handleNavigate}
            />
          )}

          {currentNav === 'billing' && (
            <BillingPage
              onNavigate={handleNavigate}
            />
          )}

          {currentNav === 'settings' && (
            <SettingsPage />
          )}

          {currentNav === 'audit-logs' && (
            <AuditLogPage
              onNavigate={handleNavigate}
            />
          )}
        </ErrorBoundary>
      </AppShell>

      {/* Global Multi-Step Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onCompleted={() => {
          handleNavigate('dashboard');
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TenantProvider>
          <AnalyticsProvider>
            <AppContent />
          </AnalyticsProvider>
        </TenantProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

