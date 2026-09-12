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
import { AuthModal } from './shared/components/AuthModal';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { authApi, userApi, getAccessToken, clearAuthSession } from './shared/services/apiClient';

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
    window.dispatchEvent(new Event('app-navigate'));
  }
}

export function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken());
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [navContext, setNavContext] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const { addToast } = useToast();
  const { isOnboardingOpen, closeOnboarding } = useTenant();

  /* ── Check backend session on mount (canonical /users/me) ── */
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      userApi.getMe().then((user) => {
        if (user?.email) {
          setIsLoggedIn(true);
        } else {
          clearAuthSession();
          setIsLoggedIn(false);
        }
      }).catch(() => {
        // Stale or expired token
        clearAuthSession();
        setIsLoggedIn(false);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  /* ── Handle session expiry broadcast from apiClient ── */
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      addToast({
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        variant: 'warning',
      });
    };
    window.addEventListener('aicto_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('aicto_auth_expired', handleAuthExpired);
  }, [addToast]);

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

  const handleOpenAuth = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback((authData) => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('aicto_is_logged_in', 'true');
    } catch {}
    setCurrentNav('dashboard');
    setNavContext(null);
    navigateTo(APP_BASE);
    addToast('Authenticated with AI-CTO Backend API (v2.0.0)', 'success');
  }, [addToast]);

  const handleStartFree = useCallback(() => {
    handleOpenAuth('register');
  }, [handleOpenAuth]);

  const handleSignOut = useCallback(async () => {
    await authApi.logout();
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
  if (!isLoggedIn && !isOnAppRoute) {
    return (
      <>
        <LandingPage
          onLogin={() => handleOpenAuth('login')}
          onStartFree={handleStartFree}
          onExploreApp={(targetNav) => {
            handleOpenAuth('login');
          }}
        />

        {/* Global Multi-Step Onboarding Wizard Modal */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          onCompleted={() => {
            handleNavigate('dashboard');
          }}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
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

