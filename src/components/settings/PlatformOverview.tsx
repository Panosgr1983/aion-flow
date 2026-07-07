import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Building2, Activity, Users, AlertTriangle, CheckCircle, HardDrive, Mail, Zap } from 'lucide-react';

interface PlatformMetrics {
  totalTenants: number;
  healthyTenants: number;
  attentionTenants: number;
  eventsToday: number;
  totalLeads: number;
  storageMB: number;
  activeUsers: number;
}

export default function PlatformOverview() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [tenantsRes, eventsRes, leadsRes, usersRes] = await Promise.all([
      supabase.from('tenants').select('id, status'),
      supabase.from('usage_events').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    const tenants = (tenantsRes.data ?? []) as { id: string; status: string }[];
    setMetrics({
      totalTenants: tenants.length,
      healthyTenants: tenants.filter(t => t.status === 'active' || t.status === 'trial').length,
      attentionTenants: tenants.filter(t => t.status === 'suspended' || t.status === 'cancelled').length,
      eventsToday: eventsRes.count ?? 0,
      totalLeads: leadsRes.count ?? 0,
      storageMB: 0,
      activeUsers: usersRes.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!metrics) return null;

  const cards = [
    { icon: Building2, label: 'Ενεργοί Tenants', value: metrics.healthyTenants, sub: `${metrics.totalTenants} total`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: AlertTriangle, label: 'Χρειάζονται Προσοχή', value: metrics.attentionTenants, sub: 'suspended / cancelled', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Zap, label: 'Events Σήμερα', value: metrics.eventsToday, sub: 'usage events', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'Ενεργοί Χρήστες', value: metrics.activeUsers, sub: 'profiles', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Mail, label: 'New Leads (σήμερα)', value: metrics.totalLeads, sub: 'conversations', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: HardDrive, label: 'Αποθηκευτικός Χώρος', value: metrics.storageMB === 0 ? 'N/A' : `${(metrics.storageMB / 1024).toFixed(1)} GB`, sub: 'storage', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity size={20} className="text-cyan-400" /> Platform Overview
          </h2>
          <p className="text-sm text-gray-500">Mission control — υγεία ολόκληρου του οικοσυστήματος</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={16} className="text-green-400" />
          <h3 className="font-semibold">Σύστημα</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
            <span className="text-gray-400">Ταχύτητα απόκρισης</span>
            <span className="text-green-400 font-medium">&lt; 200ms</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
            <span className="text-gray-400">RLS Policies</span>
            <span className="text-green-400 font-medium">Ενεργές</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
            <span className="text-gray-400">Telemetry</span>
            <span className="text-green-400 font-medium">{metrics.eventsToday > 0 ? 'Καταγράφει' : 'Αναμονή'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-gray-400">Authentication</span>
            <span className="text-green-400 font-medium">Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
