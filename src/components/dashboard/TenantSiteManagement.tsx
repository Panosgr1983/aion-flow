import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../lib/useTenant';
import { FileText, BookOpen, Eye, MessageSquare, Award, Heart, User, Globe, Image, Package, Settings, ArrowRight, Building2 } from 'lucide-react';

const sections = [
  { icon: FileText, label: 'Υπηρεσίες', desc: 'Διαχειριστείτε τις υπηρεσίες που προσφέρετε', path: '/dashboard/services', color: 'text-blue-400', bg: 'bg-blue-500/10', table: 'services' },
  { icon: BookOpen, label: 'Blog', desc: 'Γράψτε και δημοσιεύστε άρθρα', path: '/dashboard/blog', color: 'text-purple-400', bg: 'bg-purple-500/10', table: 'blog_posts' },
  { icon: Eye, label: 'Σελίδες', desc: 'Επεξεργαστείτε στατικές σελίδες', path: '/dashboard/pages', color: 'text-cyan-400', bg: 'bg-cyan-500/10', table: 'site_settings' },
  { icon: MessageSquare, label: 'Κριτικές', desc: 'Δημοσιεύστε μαρτυρίες πελατών', path: '/dashboard/testimonials', color: 'text-rose-400', bg: 'bg-rose-500/10', table: 'testimonials' },
  { icon: Award, label: 'Πιστοποιήσεις', desc: 'Προβάλετε πιστοποιήσεις & διακρίσεις', path: '/dashboard/credentials', color: 'text-amber-400', bg: 'bg-amber-500/10', table: 'credentials' },
  { icon: Heart, label: 'Αξίες', desc: 'Ορίστε τις αξίες της επιχείρησής σας', path: '/dashboard/core-values', color: 'text-green-400', bg: 'bg-green-500/10', table: 'core_values' },
  { icon: User, label: 'Σχετικά', desc: 'Γράψτε την ιστορία σας', path: '/dashboard/about', color: 'text-indigo-400', bg: 'bg-indigo-500/10', table: 'about' },
  { icon: Globe, label: 'Κουμπιά CTA', desc: 'Διαχειριστείτε τα call-to-action', path: '/dashboard/cta', color: 'text-pink-400', bg: 'bg-pink-500/10', table: 'cta' },
  { icon: Image, label: 'Πολυμέσα', desc: 'Ανεβάστε και οργανώστε αρχεία', path: '/dashboard/media', color: 'text-emerald-400', bg: 'bg-emerald-500/10', table: 'media' },
  { icon: Package, label: 'Βιβλία / Προϊόντα', desc: 'Διαχειριστείτε το e-shop σας', path: '/dashboard/products', color: 'text-amber-400', bg: 'bg-amber-500/10', table: 'products' },
  { icon: Settings, label: 'Ρυθμίσεις Site', desc: 'Διαχειριστείτε τις ρυθμίσεις του website σας', path: '/dashboard/site-settings', color: 'text-gray-400', bg: 'bg-gray-500/10', table: '' },
];

export default function TenantSiteManagement() {
  const tenant = useTenant();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const tenantId = tenant.effectiveTenantId;

  useEffect(() => {
    if (!tenantId) return;
    const queries = sections
      .filter(s => s.table)
      .map(async (s) => {
        try {
          const { count } = await supabase
            .from(s.table)
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);
          return { key: s.table, count: count || 0 };
        } catch {
          return { key: s.table, count: 0 };
        }
      });
    Promise.all(queries).then(results => {
      const map: Record<string, number> = {};
      results.forEach(r => { map[r.key] = r.count; });
      setCounts(map);
    });
  }, [tenantId]);

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 size={48} className="mx-auto mb-4 text-gray-600 opacity-30" />
          <h3 className="font-medium text-gray-300 mb-2">Δεν έχει επιλεγεί tenant</h3>
          <p className="text-sm text-gray-500">Επιλέξτε έναν tenant από το project switcher ή την Αρχική σελίδα.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-gray-100">Διαχείριση Ιστοσελίδας</h2>
        <p className="text-sm text-gray-500 mt-1">Γρήγορη πρόσβαση σε όλες τις ενότητες περιεχομένου του website</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map(m => {
          const count = m.table ? counts[m.table] : undefined;
          return (
            <Link
              key={m.path}
              to={m.path}
              className="card p-5 hover:bg-gray-800/40 transition-all group border border-transparent hover:border-blue-500/20"
            >
              <div className="flex items-start gap-4">
                <div className={`size-12 rounded-xl ${m.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <m.icon size={22} className={m.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.desc}</p>
                  {count !== undefined && (
                    <p className="text-xs text-gray-600 mt-1.5">
                      <span className="font-medium text-gray-400">{count}</span> εγγραφές
                    </p>
                  )}
                </div>
                <ArrowRight size={14} className="text-gray-600 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
