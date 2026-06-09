import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Προϊόντα',
  '/dashboard/categories': 'Κατηγορίες',
  '/dashboard/orders': 'Παραγγελίες',
  '/dashboard/customers': 'Πελάτες',
  '/dashboard/analytics': 'Αναλυτικά Στοιχεία',
  '/dashboard/media': 'Πολυμέσα',
  '/dashboard/profile': 'Προφίλ',
  '/dashboard/settings': 'Ρυθμίσεις',
  '/dashboard/services': 'Υπηρεσίες',
  '/dashboard/blog': 'Blog',
  '/dashboard/testimonials': 'Κριτικές',
  '/dashboard/credentials': 'Πιστοποιήσεις',
  '/dashboard/core-values': 'Αξίες',
  '/dashboard/site-settings': 'Ρυθμίσεις Περιεχομένου',
  '/dashboard/history': 'Ιστορικό',
  '/dashboard/contact-messages': 'Μηνύματα Επικοινωνίας',
};

export default function AdminHeader() {
  const location = useLocation();
  const { user, isDemoMode } = useAuth();
  const title = titles[location.pathname] ?? 'Dashboard';
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'AD';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">{title}</h1>
        {isDemoMode && (
          <span className="text-xs text-amber-500/80">Demo Mode — Χρησιμοποιούνται mock δεδομένα</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
