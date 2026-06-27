import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../lib/useTenant';
import { getCurrentTenantContext } from '../../lib/TenantContext';
import { RefreshCw, FileText, BookOpen, Eye, Image, CheckCircle, AlertTriangle, Activity, Plus, History, ArrowRight } from 'lucide-react';

interface RecentActivity {
  id: string;
  table_name: string;
  record_title: string;
  operation: string;
  created_at: string;
  created_by_name: string | null;
}

export default function TenantOverview() {
  const tenant = useTenant();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [stats, setStats] = useState<{ services: number; blog: number; pages: number; media: number } | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tenantId = getCurrentTenantContext();

  useEffect(() => {
    if (!tenantId) { setLoading(false); return; }
    setLoading(true);
    setError('');

    Promise.all([
      supabase.from('tenants').select('*').eq('id', tenantId).single(),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('site_settings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('category', 'pages'),
      supabase.from('media').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      tenant.isSuperAdmin
        ? supabase.from('content_history').select('id, table_name, record_title, operation, created_at, created_by_name').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(10)
        : Promise.resolve({ data: [] }),
    ]).then(([info, svc, blog, pages, med, activity]) => {
      if (info?.data) setTenantInfo(info.data);
      setStats({
        services: (svc as any).count || 0,
        blog: (blog as any).count || 0,
        pages: (pages as any).count || 0,
        media: (med as any).count || 0,
      });
      if (activity?.data) setRecentActivity(activity.data as RecentActivity[]);
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, [tenantId, tenant.isSuperAdmin]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  if (error) return <div className="card p-6 text-red-400 text-sm">{error}</div>;

  // Super admin — no tenant selected
  if (!tenantId) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-semibold">Dashboard</h2><p className="text-sm text-gray-500">Επιλέξτε ένα tenant από το Project Switcher</p></div>
          <button onClick={() => setLoading(true)} className="btn-ghost p-2"><RefreshCw size={14} /></button>
        </div>
        <div className="card p-12 text-center">
          <Activity size={48} className="mx-auto mb-4 text-gray-600 opacity-30" />
          <h3 className="font-medium text-gray-300 mb-2">Κανένα tenant δεν έχει επιλεγεί</h3>
          <p className="text-sm text-gray-500">Χρησιμοποιήστε το Project Switcher στην αριστερή μπάρα για να δείτε τα δεδομένα ενός tenant.</p>
        </div>
      </div>
    );
  }

  // Tenant customer view — welcome + guidance
  if (!tenant.isSuperAdmin) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div className="card p-8 border-l-4 border-l-blue-500">
          <h2 className="text-2xl font-semibold mb-2">
            Καλώς ήρθατε, {tenantInfo?.name || 'στην επιχείρησή σας'}
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Το AION Flow είναι η πλατφόρμα διαχείρισης της ψηφιακής σας παρουσίας.
            Από εδώ μπορείτε να ενημερώνετε το περιεχόμενο του website σας εύκολα και γρήγορα.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: FileText, label: 'Υπηρεσίες', desc: 'Διαχειριστείτε τις υπηρεσίες που προσφέρετε', path: '/dashboard/services', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: BookOpen, label: 'Blog', desc: 'Γράψτε και δημοσιεύστε άρθρα', path: '/dashboard/blog', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Eye, label: 'Σελίδες', desc: 'Επεξεργαστείτε τις στατικές σελίδες σας', path: '/dashboard/pages', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { icon: Image, label: 'Πολυμέσα', desc: 'Ανεβάστε και οργανώστε αρχεία', path: '/dashboard/media', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: FileText, label: 'Προϊόντα', desc: 'Διαχειριστείτε το e-shop σας', path: '/dashboard/products', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { icon: FileText, label: 'Κριτικές', desc: 'Δημοσιεύστε μαρτυρίες πελατών', path: '/dashboard/testimonials', color: 'text-rose-400', bg: 'bg-rose-500/10' },
          ].map(m => (
            <Link key={m.path} to={m.path} className="card p-4 hover:bg-gray-800/40 transition-colors group">
              <div className="flex items-start gap-3">
                <div className={`size-10 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                  <m.icon size={18} className={m.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <div className="card p-5 bg-gray-900/50">
          <p className="text-xs text-gray-500 leading-relaxed">
            💡 Χρειάζεστε βοήθεια; Κάθε ενότητα έχει τις δικές της οδηγίες.
            Για οποιαδήποτε απορία, επικοινωνήστε με τον διαχειριστή της πλατφόρμας σας.
          </p>
        </div>
      </div>
    );
  }

  // ─── Super admin view ──────────────────────────────────────
  const statCards = [
    { icon: FileText, label: 'Υπηρεσίες', value: stats?.services || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: BookOpen, label: 'Blog Posts', value: stats?.blog || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Eye, label: 'Σελίδες', value: stats?.pages || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Image, label: 'Media', value: stats?.media || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = { create: 'Δημιουργήθηκε', update: 'Ενημερώθηκε', delete: 'Διαγράφηκε' };
    return labels[op] || op;
  };

  const getTableLabel = (table: string) => {
    const labels: Record<string, string> = { services: 'Υπηρεσία', blog_posts: 'Blog', site_settings: 'Σελίδα', products: 'Προϊόν', media: 'Media' };
    return labels[table] || table;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tenant Banner */}
      {tenantInfo && (
        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">{tenantInfo.name}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                {tenantInfo.plan_name && <span>📋 {tenantInfo.plan_name}</span>}
                {tenantInfo.industry && <span>🏢 {tenantInfo.industry}</span>}
                <span className={`flex items-center gap-1 ${tenantInfo.status === 'active' ? 'text-green-400' : 'text-amber-400'}`}>
                  {tenantInfo.status === 'active' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  {tenantInfo.status === 'active' ? 'Ενεργό' : tenantInfo.status}
                </span>
              </div>
            </div>
            {tenantInfo.renewal_date && (
              <span className="text-xs text-gray-600">Ανανέωση: {new Date(tenantInfo.renewal_date).toLocaleDateString('el-GR')}</span>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon size={18} className={c.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-100">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText size={14} className="text-blue-400" /> CMS Περιεχόμενο</h3>
        <div className="space-y-3">
          {[
            { label: 'Υπηρεσίες', count: stats?.services || 0, path: '/dashboard/services' },
            { label: 'Blog Posts', count: stats?.blog || 0, path: '/dashboard/blog' },
            { label: 'Σελίδες', count: stats?.pages || 0, path: '/dashboard/pages' },
            { label: 'Media Files', count: stats?.media || 0, path: '/dashboard/media' },
          ].map(s => (
            <Link key={s.label} to={s.path} className="flex items-center justify-between py-1.5 hover:text-gray-200 transition-colors">
              <span className="text-sm text-gray-400">{s.label}</span>
              <span className="text-sm font-medium text-gray-200">{s.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/dashboard/services/new" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-700 hover:border-blue-500/50 hover:text-blue-400 transition-all">
          <Plus size={14} /> Νέα Υπηρεσία
        </Link>
        <Link to="/dashboard/blog/new" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-700 hover:border-purple-500/50 hover:text-purple-400 transition-all">
          <Plus size={14} /> Νέο Blog Post
        </Link>
        <Link to="/dashboard/pages/new" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
          <Plus size={14} /> Νέα Σελίδα
        </Link>
        <Link to="/dashboard/media" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all">
          <Plus size={14} /> Upload Media
        </Link>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><History size={14} className="text-gray-400" /> Πρόσφατη Δραστηριότητα</h3>
          <div className="space-y-2">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-center justify-between py-1.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 shrink-0">{getOperationLabel(a.operation)}</span>
                  <span className="text-gray-300 truncate">{a.record_title}</span>
                  <span className="text-gray-600 text-xs shrink-0">({getTableLabel(a.table_name)})</span>
                </div>
                <span className="text-xs text-gray-600 shrink-0 ml-3">{new Date(a.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
