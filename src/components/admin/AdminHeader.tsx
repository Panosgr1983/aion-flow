/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Admin Header
  
  Δείχνει:
    - Τίτλο τρέχουσας σελίδας
    - Tenant indicator (όνομα, plan, status) για super admins
    - Demo mode indicator
    - User avatar (initials)
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../lib/useTenant';
import { useTenantContext } from '../../lib/TenantContext';
import { supabase } from '../../lib/supabase';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tenant': 'Επισκόπηση',
  '/dashboard/products': 'Προϊόντα',
  '/dashboard/categories': 'Κατηγορίες',
  '/dashboard/orders': 'Παραγγελίες',
  '/dashboard/customers': 'Πελάτες',
  '/dashboard/analytics': 'Αναλυτικά Στοιχεία',
  '/dashboard/media': 'Πολυμέσα',
  '/dashboard/profile': 'Προφίλ',
  '/dashboard/settings': 'Ρυθμίσεις',
  '/dashboard/settings/users': 'Διαχείριση Χρηστών',
  '/dashboard/settings/backup': 'Backup Manager',
  '/dashboard/tenant-site': 'Διαχείριση Ιστοσελίδας',
  '/dashboard/settings/observability': 'Observability',
  '/dashboard/settings/usage': 'Usage & Telemetry',
  '/dashboard/services': 'Υπηρεσίες',
  '/dashboard/blog': 'Blog',
  '/dashboard/testimonials': 'Κριτικές',
  '/dashboard/credentials': 'Πιστοποιήσεις',
  '/dashboard/core-values': 'Αξίες',
  '/dashboard/business-info': 'Business Information',
  '/dashboard/site-settings': 'Ρυθμίσεις Περιεχομένου',
  '/dashboard/history': 'Ιστορικό',
  '/dashboard/contact-messages': 'Inbox',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/pipeline': 'Leads Pipeline',
};

export default function AdminHeader() {
  const location = useLocation();
  const { user, isDemoMode } = useAuth();
  const tenant = useTenant();
  const { selectedTenantId } = useTenantContext();
  const [tenantInfo, setTenantInfo] = useState<{ name: string; plan: string; status: string } | null>(null);
  const title = titles[location.pathname] ?? 'Dashboard';
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'AD';

  useEffect(() => {
    if (selectedTenantId) {
      supabase.from('tenants').select('name, plan_name, status').eq('id', selectedTenantId).single().then(({ data }) => {
        if (data) setTenantInfo({ name: data.name, plan: data.plan_name || '', status: data.status });
      });
    } else {
      setTenantInfo(null);
    }
  }, [selectedTenantId]);

  const StatusIcon = tenantInfo?.status === 'active' ? CheckCircle : AlertTriangle;
  const statusColor = tenantInfo?.status === 'active' ? 'text-green-400' : 'text-amber-400';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-100 truncate">{title}</h1>
          {isDemoMode && (
            <span className="text-xs text-amber-500/80">Demo Mode — Mock δεδομένα</span>
          )}
          {tenantInfo && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="font-medium text-gray-300">{tenantInfo.name}</span>
              {tenantInfo.plan && <span className="text-gray-600">· {tenantInfo.plan}</span>}
              <span className={`flex items-center gap-0.5 ${statusColor}`}>
                <StatusIcon size={10} />
                {tenantInfo.status === 'active' ? 'Ενεργό' : tenantInfo.status}
              </span>
            </div>
          )}
          {!tenantInfo && tenant.isSuperAdmin && !selectedTenantId && (
            <span className="text-xs text-blue-400/70">🌐 Όλοι οι tenants</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          <Bell size={18} />
        </button>

        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
