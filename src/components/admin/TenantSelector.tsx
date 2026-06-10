/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Selector (Full-Screen)
  
  Εμφανίζεται ΟΤΑΝ:
    1. Ο χρήστης είναι super admin
    2. Δεν έχει επιλέξει tenant ακόμα
  
  Δείχνει όλους τους διαθέσιμους tenants με info cards.
  Μόλις επιλεγεί tenant, εξαφανίζεται και φορτώνεται το dashboard.
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenantContext } from '../../lib/TenantContext';
import { Zap, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

interface TenantCard {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan_name: string;
  industry: string | null;
}

export default function TenantSelector() {
  const [tenants, setTenants] = useState<TenantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const { setSelectedTenantId, selectedTenantId } = useTenantContext();

  // If already selected, don't show
  if (selectedTenantId) return null;

  useEffect(() => {
    supabase.from('tenants').select('id, name, slug, status, plan_name, industry').order('name').then(({ data }) => {
      if (data) setTenants(data as TenantCard[]);
      setLoading(false);
    });
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => setSelectedTenantId(id), 300);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-3xl px-6 py-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">AION Flow</h1>
          <p className="text-sm text-gray-500">Επιλέξτε ένα project για να ξεκινήσετε</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size={32} className="text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenants.map(t => {
              const isSelected = selected === t.id;
              const isActive = t.status === 'active';
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  disabled={!!selected}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-900'
                  } ${selected ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-100 text-base">{t.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">@{t.slug}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${isActive ? 'text-green-400' : 'text-amber-400'}`}>
                      {isActive ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                      {isActive ? 'Ενεργό' : t.status === 'trial' ? 'Δοκιμή' : t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {t.plan_name && <span className="px-2 py-0.5 bg-gray-800 rounded-full">{t.plan_name}</span>}
                    {t.industry && <span>{t.industry}</span>}
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/50 flex items-center justify-center bg-blue-500/5">
                      <Loader size={20} className="text-blue-400 animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Επιλέξτε project για να δείτε το dashboard και τα modules του
        </p>
      </div>
    </div>
  );
}
