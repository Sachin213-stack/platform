import { useState } from 'react';
import AppShell from './shared/layout/AppShell';
import DashboardPage from './modules/monitor/DashboardPage';
import SettingsPage from './pages/settings/SettingsPage';
import AnalyticsPage from './modules/monitor/AnalyticsPage';
import FridayAIPage from './modules/act/FridayAIPage';
import AuditLogPage from './modules/detect/AuditLogPage';
import BillingPage from './pages/billing/BillingPage';
import { ToastProvider, useToast } from './shared/components/Toast';
import { ThemeProvider } from './shared/context/ThemeContext';
import { TenantProvider, useTenant } from './shared/context/TenantContext';
import { OnboardingWizard } from './modules/onboarding/OnboardingWizard';

function AppContent() {
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [navContext, setNavContext] = useState(null);
  const { addToast } = useToast();
  const { isOnboardingOpen, closeOnboarding } = useTenant();

  const handleNavigate = (targetNav, context = null) => {
    setCurrentNav(targetNav);
    setNavContext(context);
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

  return (
    <>
      <AppShell
        activeNav={currentNav}
        onNavChange={(id) => {
          setCurrentNav(id);
          setNavContext(null);
        }}
        pageTitle={getPageTitle()}
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
          <AppContent />
        </TenantProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

