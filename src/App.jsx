import { useState } from 'react';
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

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('aicto_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentNav, setCurrentNav] = useState('dashboard');
  const [navContext, setNavContext] = useState(null);
  const { addToast } = useToast();
  const { isOnboardingOpen, openOnboarding, closeOnboarding } = useTenant();

  const handleNavigate = (targetNav, context = null) => {
    setCurrentNav(targetNav);
    setNavContext(context);
  };

  const handleLogin = (targetNav = 'dashboard') => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('aicto_is_logged_in', 'true');
    } catch {}
    handleNavigate(targetNav);
    addToast('Welcome back to AI-CTO Operations Platform', 'success');
  };

  const handleStartFree = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('aicto_is_logged_in', 'true');
    } catch {}
    openOnboarding();
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('aicto_is_logged_in', 'false');
    } catch {}
    addToast('Signed out. Viewing public marketing portal.', 'info');
  };

  const handleShowToast = ({ title, message, variant = 'success' }) => {
    addToast(`${title ? `${title}: ` : ''}${message}`, variant);
  };

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

  // Unauthenticated visitors see the Marketing Landing Page at root route
  if (!isLoggedIn) {
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

  // Authenticated users see the AppShell and platform screens
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
