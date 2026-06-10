/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Overview Dashboard (T5)
  
  Default dashboard σελίδα. Δείχνει συνοπτική εικόνα του tenant:
    - Tenant info (όνομα, plan, status, industry)
    - Service stats
    - Blog stats
    - CRM stats (αν το feature είναι enabled)
    - Recent activity
    - Pipeline summary
    - Inbox unread
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../lib/useTenant';
import { useTenantContext } from '../../lib/TenantContext';
import { getCurrentTenantContext } from '../../lib/TenantContext';
import { RefreshCw, FileText, BookOpen, MessageSquare, TrendingUp, Users, Mail, BarChart3, Activity, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface TenantStats {
  services: number;
  blog: number;
  pages: number;
  media: number;
  messages: number;
  leads: number;
  unread: number;
  pipelineValue: number;
}

export default function TenantOverview() {
  const { selectedTenantId } = useTenantContext();
  const tenant = useTenant();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tenantId = getCurrentTenantContext();

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      // Tenant info
      tenantId
        ? supabase.from('tenants').select('*').eq('id', tenantId).single()
        : Promise.resolve({ data: null }),
      // Counts
      tenantId ? supabase.from('services').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId) : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId) : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('site_settings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('category', 'pages') : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('media').select('id', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new') : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('contact_messages').select('id', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('contact_conversations').select('id', { count: 'exact', head: true }).not('lead_stage', 'is', null) : Promise.resolve({ count: 0 }),
      tenantId ? supabase.from('contact_conversations').select('lead_value').not('lead_stage', 'is', null) : Promise.resolve({ data: null }),
    ]).then(([info, svc, blog, pages, med, unread, msgs, leads, values]) => {
      if (info?.data) setTenantInfo(info.data);
      const leadValues = (values as any)?.data || [];
      setStats({
        services: (svc as any).count || 0,
        blog: (blog as any).count || 0,
        pages: (pages as any).count || 0,
        media: (med as any).count || 0,
        messages: (msgs as any).count || 0,
        leads: (leads as any).count || 0,
        unread: (unread as any).count || 0,
        pipelineValue: leadValues.reduce((s: number, v: any) => s + (Number(v.lead_value) || 0), 0),
      });
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  if (error) return <div className="card p-6 text-red-400 text-sm">{error}</div>;

  // Αν δεν υπάρχει tenantId (super admin χωρίς επιλογή)
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

  const cards = [
    { icon: FileText, label: 'Υπηρεσίες', value: stats?.services || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: BookOpen, label: 'Blog Posts', value: stats?.blog || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Eye, label: 'Pages', value: stats?.pages || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: MessageSquare, label: 'Μηνύματα', value: stats?.messages || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Users, label: 'Leads', value: stats?.leads || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Mail, label: 'Αδιάβαστα', value: stats?.unread || 0, color: stats?.unread ? 'text-red-400' : 'text-gray-500', bg: stats?.unread ? 'bg-red-500/10' : 'bg-gray-500/10' },
    { icon: TrendingUp, label: 'Pipeline Value', value: stats?.pipelineValue ? `${stats.pipelineValue}€` : '0€', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

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
        {cards.map(c => (
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

      {/* Feature-Specific Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CMS Section */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText size={14} className="text-blue-400" /> CMS Περιεχόμενο</h3>
          <div className="space-y-3">
            {[
              { label: 'Υπηρεσίες', count: stats?.services || 0, path: '/dashboard/services' },
              { label: 'Blog Posts', count: stats?.blog || 0, path: '/dashboard/blog' },
              { label: 'Σελίδες', count: stats?.pages || 0, path: '/dashboard/pages' },
              { label: 'Media Files', count: stats?.media || 0, path: '/dashboard/media' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-400">{s.label}</span>
                <span className="text-sm font-medium text-gray-200">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Section */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><MessageSquare size={14} className="text-green-400" /> CRM & Επικοινωνία</h3>
          <div className="space-y-3">
            {[
              { label: 'Μηνύματα', count: stats?.messages || 0, path: '/dashboard/inbox' },
              { label: 'Αδιάβαστα', count: stats?.unread || 0, path: '/dashboard/inbox' },
              { label: 'Leads', count: stats?.leads || 0, path: '/dashboard/pipeline' },
              { label: 'Pipeline Value', count: stats?.pipelineValue ? `${stats.pipelineValue}€` : '0€', path: '/dashboard/pipeline' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-400">{s.label}</span>
                <span className="text-sm font-medium text-gray-200">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
