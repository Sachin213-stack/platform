import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUSINESS_PROFILES } from '../../modules/monitor/dashboardData';
import { getStoredUser } from '../services/apiClient';

const TENANTS_STORAGE_KEY = 'aicto_business_tenants';
const ACTIVE_TENANT_STORAGE_KEY = 'aicto_active_tenant_id';
const ONBOARDING_DRAFT_KEY = 'aicto_onboarding_draft_v1';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  // Initialize businesses from authenticated user or localStorage (no fake profiles)
  const [businesses, setBusinesses] = useState(() => {
    try {
      const stored = getStoredUser();
      if (stored && stored.business_id) {
        const userBiz = {
          id: String(stored.business_id),
          name: stored.business_name || 'My Organization',
          type: stored.business_type || 'ecommerce',
          typeLabel: (stored.business_type || 'ecommerce').toUpperCase(),
          tierLabel: 'Production',
          region: 'us-east-1',
          domain: stored.domain || `${(stored.business_name || 'org').toLowerCase().replace(/\s+/g, '-')}.io`,
          ops_email: stored.ops_email,
        };
        return [userBiz];
      }
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const genuineTenants = parsed.filter((b) => {
            const id = (b.id || '').toLowerCase();
            const name = (b.name || '').toLowerCase();
            return !['apex-retail', 'nexus-cloud', 'vortex-media', 'cyber-fin', 'acme-innovations'].includes(id) &&
                   !name.includes('acme') &&
                   !name.includes('apex') &&
                   !name.includes('diagnostic');
          });
          if (genuineTenants.length > 0) return genuineTenants;
        }
      }
    } catch (e) {
      console.warn('Failed to load businesses from storage:', e);
    }
    return [];
  });

  // Initialize selectedBusinessId from stored user or localStorage
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => {
    try {
      const stored = getStoredUser();
      if (stored && stored.business_id) {
        return String(stored.business_id);
      }
      const savedId = localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
      if (savedId) {
        const idLower = savedId.toLowerCase();
        if (!['apex-retail', 'nexus-cloud', 'vortex-media', 'cyber-fin', 'acme-innovations'].includes(idLower) && !idLower.includes('acme') && !idLower.includes('apex')) {
          return savedId;
        }
      }
    } catch (e) {
      console.warn('Failed to load active tenant ID from storage:', e);
    }
    return null;
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
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0] || null;

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

  // Update active business data in memory
  const updateSelectedBusiness = (updates) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === selectedBusinessId ? { ...b, ...updates } : b))
    );
  };

  // Synchronize with logged-in user changes
  useEffect(() => {
    const handleUserUpdate = (e) => {
      const user = e.detail;
      if (user && user.business_id) {
        const bizId = String(user.business_id);
        const bizName = user.business_name || `${user.name || 'User'}'s Org`;
        const bizType = user.business_type || 'ecommerce';
        setBusinesses((prev) => {
          const exists = prev.find((b) => b.id === bizId);
          if (exists) {
            return prev.map((b) =>
              b.id === bizId
                ? {
                    ...b,
                    name: bizName,
                    type: bizType,
                    typeLabel: bizType.toUpperCase(),
                    ops_email: user.ops_email,
                  }
                : b
            );
          }
          return [
            {
              id: bizId,
              name: bizName,
              type: bizType,
              typeLabel: bizType.toUpperCase(),
              tierLabel: 'Production',
              region: 'us-east-1',
              ops_email: user.ops_email,
            },
            ...prev,
          ];
        });
        setSelectedBusinessId(bizId);
      }
    };

    window.addEventListener('aicto_user_updated', handleUserUpdate);
    const stored = getStoredUser();
    if (stored) {
      handleUserUpdate({ detail: stored });
    }
    return () => window.removeEventListener('aicto_user_updated', handleUserUpdate);
  }, []);

  return (
    <TenantContext.Provider
      value={{
        businesses,
        selectedBusiness,
        selectedBusinessId,
        setSelectedBusiness: switchBusiness,
        updateSelectedBusiness,
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
