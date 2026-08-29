import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUSINESS_PROFILES } from '../../modules/monitor/dashboardData';

const TENANTS_STORAGE_KEY = 'aicto_business_tenants';
const ACTIVE_TENANT_STORAGE_KEY = 'aicto_active_tenant_id';
const ONBOARDING_DRAFT_KEY = 'aicto_onboarding_draft_v1';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  // Initialize businesses from localStorage or fallback to default BUSINESS_PROFILES
  const [businesses, setBusinesses] = useState(() => {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load businesses from localStorage:', e);
    }
    return BUSINESS_PROFILES;
  });

  // Initialize selectedBusinessId from localStorage or first business
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
      if (savedId) return savedId;
    } catch (e) {
      console.warn('Failed to load active tenant ID from localStorage:', e);
    }
    return BUSINESS_PROFILES[0]?.id || 'apex-retail';
  });

  // Modal / Onboarding Wizard State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialData, setOnboardingInitialData] = useState(null);

  // Sync businesses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(businesses));
    } catch (e) {
      console.warn('Failed to save businesses to localStorage:', e);
    }
  }, [businesses]);

  // Sync selectedBusinessId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, selectedBusinessId);
    } catch (e) {
      console.warn('Failed to save active tenant ID to localStorage:', e);
    }
  }, [selectedBusinessId]);

  // Derive active business object
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0] || BUSINESS_PROFILES[0];

  const switchBusiness = (businessOrId) => {
    const id = typeof businessOrId === 'string' ? businessOrId : businessOrId?.id;
    if (id) {
      setSelectedBusinessId(id);
    }
  };

  const addBusiness = (newBusiness) => {
    setBusinesses((prev) => {
      // Avoid duplicate IDs
      const filtered = prev.filter((b) => b.id !== newBusiness.id);
      return [newBusiness, ...filtered];
    });
    setSelectedBusinessId(newBusiness.id);
    // Clear draft once successfully added
    clearWizardDraft();
  };

  const openOnboarding = (initialData = null) => {
    setOnboardingInitialData(initialData);
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setOnboardingInitialData(null);
  };

  // Draft persistence helpers
  const saveWizardDraft = (draftState) => {
    try {
      localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draftState));
    } catch (e) {
      console.warn('Failed to save wizard draft:', e);
    }
  };

  const loadWizardDraft = () => {
    try {
      const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read wizard draft:', e);
    }
    return null;
  };

  const clearWizardDraft = () => {
    try {
      localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    } catch (e) {
      console.warn('Failed to clear wizard draft:', e);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        businesses,
        selectedBusiness,
        selectedBusinessId,
        setSelectedBusiness: switchBusiness,
        addBusiness,
        isOnboardingOpen,
        onboardingInitialData,
        openOnboarding,
        closeOnboarding,
        saveWizardDraft,
        loadWizardDraft,
        clearWizardDraft,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
