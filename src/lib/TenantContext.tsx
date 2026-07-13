/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Context (για super admin switching)
  
  Παρέχει selectedTenantId σε όλη την εφαρμογή.
  Ο super admin μπορεί να αλλάξει tenant από το Project Switcher.
  
  Persistence: αποθηκεύεται στο localStorage (aion_selected_tenant)
  ώστε να διατηρείται μετά από refresh.
  
  Χρήση:
    const { selectedTenantId, setSelectedTenantId } = useTenantContext()
    setSelectedTenantId('uuid-xxx')
    // Όλα τα helpers θα φιλτράρουν με βάση αυτό το ID
  ═══════════════════════════════════════════════════════════════
*/

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { switchToProject, clearProjectCache } from './multiProjectClient';

const STORAGE_KEY = 'aion_selected_tenant';

interface TenantContextType {
  selectedTenantId: string | null;
  setSelectedTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType>({
  selectedTenantId: null,
  setSelectedTenantId: () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  // Switch project client when tenant changes
  useEffect(() => {
    switchToProject(selectedTenantId);
  }, [selectedTenantId]);

  // Sync with auth state: on SIGNED_IN, always clear tenant selection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setSelectedTenantId(null);
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      } else if (event === 'SIGNED_OUT') {
        clearProjectCache();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const persist = (id: string | null) => {
    setSelectedTenantId(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <TenantContext.Provider value={{ selectedTenantId, setSelectedTenantId: persist }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  return useContext(TenantContext);
}

/**
 * Διάβασε το selectedTenantId εκτός React (π.χ. από helpers).
 * Χρήσιμο για dataHelpers που θέλουν tenant-aware queries.
 */
export function getCurrentTenantContext(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
