import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, BarChart3, Image, Settings, User, ChevronLeft, ChevronRight, LogOut, Mail, Wifi, WifiOff, FileText, MessageSquare, Award, Heart, Globe, Zap, Eye, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const shopItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/products', icon: Package, label: 'Προϊόντα' },
  { path: '/dashboard/categories', icon: Tag, label: 'Κατηγορίες' },
  { path: '/dashboard/orders', icon: ShoppingCart, label: 'Παραγγελίες' },
  { path: '/dashboard/customers', icon: Users, label: 'Πελάτες' },
];

const contentItems = [
  { path: '/dashboard/products', icon: Package, label: 'Βιβλία / Προϊόντα' },
  { path: '/dashboard/media', icon: Image, label: 'Πολυμέσα' },
  { path: '/dashboard/services', icon: FileText, label: 'Υπηρεσίες' },
  { path: '/dashboard/blog', icon: Globe, label: 'Blog' },
  { path: '/dashboard/testimonials', icon: MessageSquare, label: 'Κριτικές' },
  { path: '/dashboard/credentials', icon: Award, label: 'Πιστοποιήσεις' },
  { path: '/dashboard/core-values', icon: Heart, label: 'Αξίες' },
  { path: '/dashboard/about', icon: User, label: 'Σχετικά' },
  { path: '/dashboard/cta', icon: Globe, label: 'Κουμπιά CTA' },
  { path: '/dashboard/pages', icon: Eye, label: 'Σελίδες' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/dashboard/history', icon: History, label: 'Ιστορικό' },
  { path: '/dashboard/inbox', icon: Mail, label: 'Inbox' },
  { path: '/dashboard/site-settings', icon: Settings, label: 'Ρυθμίσεις Site' },
];

const bottomItems = [
  { path: '/dashboard/profile', icon: User, label: 'Προφίλ' },
  { path: '/dashboard/settings', icon: Settings, label: 'Ρυθμίσεις' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isDemoMode, user } = useAuth();

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
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
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
        {!collapsed && <div className="text-[10px] text-gray-600 uppercase tracking-wider px-3 pt-4 pb-1">Περιεχόμενο</div>}
        {contentItems.map(({ path, icon: Icon, label }) => (
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
      </nav>

      <div className="p-3 border-t border-gray-800/50 space-y-1">
        {bottomItems.map(({ path, icon: Icon, label }) => (
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
