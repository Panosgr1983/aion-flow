/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Admin Sidebar
  
  Κύριο navigation της πλατφόρμας.
  
  Λειτουργίες:
    - Collapse/expand (για μικρές οθόνες)
    - Role-based: απόκρυψη items ανά permission
    - Feature-based: απόκρυψη modules ανά tenant_features
    - Project Switcher (για super admins)
    - Unread badge στο Inbox (polling κάθε 15s)
    - Demo mode indicator
  ═══════════════════════════════════════════════════════════════
*/

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, BarChart3, Image, Settings, User, ChevronLeft, ChevronRight, LogOut, Mail, Wifi, WifiOff, FileText, MessageSquare, Award, Heart, Globe, Zap, Eye, History, TrendingUp, Shield, Activity, ChevronDown, Home, Terminal, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { conversationsHelper } from '../../lib/dataHelpers';
import { supabase } from '../../lib/supabase';
import { can, Permission } from '../../lib/permissions';
import { UserRole } from '../../types/supabase';
import { useTenant } from '../../lib/useTenant';
import { useTenantContext } from '../../lib/TenantContext';
import { FEATURE_MODULES } from '../../lib/access';

const shopItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/products', icon: Package, label: 'Προϊόντα' },
  { path: '/dashboard/categories', icon: Tag, label: 'Κατηγορίες' },
  { path: '/dashboard/orders', icon: ShoppingCart, label: 'Παραγγελίες' },
  { path: '/dashboard/customers', icon: Users, label: 'Πελάτες' },
];

interface NavItem { path: string; icon: any; label: string; permission?: Permission; }

const contentItems: NavItem[] = [
  { path: '/dashboard/tenant', icon: Home, label: 'Αρχική', permission: 'cms.view' },
  { path: '/dashboard/tenant-site', icon: Globe, label: 'Διαχείριση Ιστοσελίδας', permission: 'cms.view' },
  { path: '/dashboard/products', icon: Package, label: 'Βιβλία / Προϊόντα', permission: 'cms.edit' },
  { path: '/dashboard/media', icon: Image, label: 'Πολυμέσα', permission: 'cms.edit' },
  { path: '/dashboard/services', icon: FileText, label: 'Υπηρεσίες', permission: 'cms.edit' },
  { path: '/dashboard/blog', icon: Globe, label: 'Blog', permission: 'cms.edit' },
  { path: '/dashboard/testimonials', icon: MessageSquare, label: 'Κριτικές', permission: 'cms.edit' },
  { path: '/dashboard/credentials', icon: Award, label: 'Πιστοποιήσεις', permission: 'cms.edit' },
  { path: '/dashboard/core-values', icon: Heart, label: 'Αξίες', permission: 'cms.edit' },
  { path: '/dashboard/about', icon: User, label: 'Σχετικά', permission: 'cms.edit' },
  { path: '/dashboard/cta', icon: Globe, label: 'Κουμπιά CTA', permission: 'cms.edit' },
  { path: '/dashboard/pages', icon: Eye, label: 'Σελίδες', permission: 'cms.edit' },
  { path: '/dashboard/site-settings', icon: Settings, label: 'Ρυθμίσεις Site', permission: 'settings.all' },
];

// Platform — μόνο για super admin (operator)
const platformItems: NavItem[] = [
  { path: '/dashboard/platform', icon: Activity, label: 'Overview', permission: 'platform.overview' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Αναφορές', permission: 'platform.analytics' },
  { path: '/dashboard/tenant', icon: Building2, label: 'Tenants', permission: 'platform.tenants' },
  { path: '/dashboard/inbox', icon: Mail, label: 'Inbox', permission: 'crm.inbox' },
  { path: '/dashboard/pipeline', icon: TrendingUp, label: 'Pipeline', permission: 'crm.pipeline' },
  { path: '/dashboard/history', icon: History, label: 'Ιστορικό', permission: 'history.view' },
  { path: '/dashboard/settings/usage', icon: BarChart3, label: 'Usage', permission: 'platform.usage' },
  { path: '/dashboard/settings/observability', icon: Shield, label: 'Observability', permission: 'platform.observability' },
  { path: '/dashboard/settings/system', icon: Terminal, label: 'System', permission: 'platform.system' },
];

// Account — για όλους
const accountItems: NavItem[] = [
  { path: '/dashboard/profile', icon: User, label: 'Προφίλ' },
  { path: '/dashboard/settings', icon: Settings, label: 'Ρυθμίσεις', permission: 'settings.all' },
  { path: '/dashboard/settings/users', icon: Users, label: 'Χρήστες', permission: 'users.manage' },
  { path: '/dashboard/settings/backup', icon: Shield, label: 'Backup', permission: 'users.manage' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [showProjects, setShowProjects] = useState(false);
  const [tenants, setTenants] = useState<{id: string; name: string; plan: string}[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isDemoMode, user } = useAuth();
  const tenant = useTenant();
  const { setSelectedTenantId, selectedTenantId } = useTenantContext();

  useEffect(() => {
    const fetchData = async () => {
      try { setUnreadCount(await conversationsHelper.getUnreadCount()); } catch {}
      if (user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        setUserRole((data?.role as UserRole) || 'admin');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Load tenants for project switcher (super admins only)
  useEffect(() => {
    if (tenant.isSuperAdmin && !tenant.loading) {
      supabase.from('tenants').select('id, name, plan_name').order('name').then(({ data }) => {
        if (data) setTenants(data);
      });
    }
  }, [tenant.isSuperAdmin, tenant.loading]);

  // Feature check: combines capability guard + feature flag
  const canAccessModule = (item: NavItem): boolean => {
    const perm = item.permission;
    if (perm && !can(perm, userRole, tenant.isSuperAdmin)) return false;
    const path = item.path.split('/').pop() || '';
    // Check feature flag for content/CRM modules
    const feature = FEATURE_MODULES[path];
    if (feature && tenant.featureMap) {
      return tenant.featureMap[feature] === true;
    }
    // Account-level items (settings, users, backup) — super admin only
    if (!tenant.isSuperAdmin && ['settings', 'users', 'backup'].includes(path)) return false;
    return true;
  };

  const isPlatform = tenant.isSuperAdmin;

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-40 glass-dark border-r border-gray-800/50"
      style={{ width: collapsed ? 72 : 260 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50 min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm tracking-tight block truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
              {tenant.isSuperAdmin && tenants.length > 0 && (
                <div className="relative">
                  <button onClick={() => setShowProjects(!showProjects)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors w-full">
                    <span className="truncate">
                      {selectedTenantId
                        ? tenants.find(t => t.id === selectedTenantId)?.name || 'Επιλέξτε project'
                        : '🌐 Όλοι οι tenants'}
                    </span>
                    <ChevronDown size={10} className="shrink-0" />
                  </button>
                  {showProjects && (
                    <div className="absolute left-0 top-full mt-1 w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedTenantId(null); setShowProjects(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${!selectedTenantId ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                      >
                        🌐 Όλοι οι tenants
                      </button>
                      <div className="border-t border-gray-800/50 mx-2" />
                      {tenants.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setSelectedTenantId(t.id); setShowProjects(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedTenantId === t.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                          <span className="font-medium">{t.name}</span>
                          {t.plan && <span className="ml-1 text-[10px] text-gray-600">· {t.plan}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
            <Zap size={14} className="text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-800"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {isPlatform && !collapsed && <div className="text-[10px] text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1 flex items-center gap-2"><Zap size={10} /> Platform</div>}
        {isPlatform && platformItems.filter(canAccessModule).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(path)
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/60'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {isDemoMode && shopItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(path)
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
        {!collapsed && <div className="text-[10px] text-gray-500 uppercase tracking-wider px-3 pt-4 pb-1 flex items-center gap-2"><Building2 size={10} /> Επιχείρηση</div>}
        {contentItems.filter(canAccessModule).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(path)
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            } ${collapsed ? 'justify-center' : ''} ${path === '/dashboard/inbox' ? 'relative' : ''}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && path === '/dashboard/inbox' && unreadCount > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {collapsed && path === '/dashboard/inbox' && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-gray-950" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800/50 space-y-1">
        {!collapsed && <div className="text-[10px] text-gray-500 uppercase tracking-wider px-3 pb-1 flex items-center gap-2"><Settings size={10} /> Λογαριασμός</div>}
        {accountItems.filter(canAccessModule).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(path)
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {!collapsed && (
          <div className="px-3 py-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {isDemoMode ? (
                <><WifiOff size={10} className="text-amber-500" /><span className="text-amber-600">Demo Mode</span></>
              ) : (
                <><Wifi size={10} className="text-green-500" /><span className="text-green-600">Live</span></>
              )}
            </div>
            {user && (
              <div className="text-xs text-gray-600 truncate mt-0.5">{user.email}</div>
            )}
          </div>
        )}

        <button
          onClick={handleSignOut}
          title={collapsed ? 'Αποσύνδεση' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Αποσύνδεση</span>}
        </button>
      </div>
    </aside>
  );
}
