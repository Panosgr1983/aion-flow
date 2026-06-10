import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Activity, Users, Calendar, BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface TenantUsage {
  tenant_id: string;
  tenant_name: string;
  month: string;
  active_days: number;
  total_events: number;
  last_activity: string;
}

interface TopEvent {
  tenant_id: string;
  event_name: string;
  event_count: number;
  last_seen: string;
}

export default function UsageDashboard() {
  const [usage, setUsage] = useState<TenantUsage[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [u, e] = await Promise.all([
      supabase.from('v_tenant_active_days').select('*').order('last_activity', { ascending: false }),
      supabase.from('v_tenant_top_events').select('*').limit(50),
    ]);
    if (u.data) setUsage(u.data as TenantUsage[]);
    if (e.data) setTopEvents(e.data as TopEvent[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  // If no data yet, show empty state
  if (usage.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-semibold">Usage & Telemetry</h2><p className="text-sm text-gray-500">Super Admin — Internal Dashboard</p></div>
          <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
        </div>
        <div className="card p-12 text-center">
          <Activity size={48} className="mx-auto mb-4 text-gray-600 opacity-30" />
          <h3 className="font-medium text-gray-300 mb-2">Δεν υπάρχουν ακόμα δεδομένα χρήσης</h3>
          <p className="text-sm text-gray-500">Τα δεδομένα θα εμφανιστούν όταν οι tenants αρχίσουν να χρησιμοποιούν την πλατφόρμα.</p>
        </div>
      </div>
    );
  }

  const totalEvents = usage.reduce((s, u) => s + u.total_events, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usage & Telemetry</h2>
          <p className="text-sm text-gray-500">{usage.length} tenants · {totalEvents} events · Super Admin only</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Active Tenants', value: usage.length, color: 'text-blue-400' },
          { icon: BarChart3, label: 'Total Events', value: totalEvents, color: 'text-green-400' },
          { icon: Calendar, label: 'Period', value: '30 days', color: 'text-purple-400' },
          { icon: TrendingUp, label: 'Avg Events/Tenant', value: Math.round(totalEvents / usage.length), color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-3">
              <s.icon size={18} className={s.color} />
              <div>
                <p className="text-lg font-bold text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-tenant table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold">Tenant Activity</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tenant</th>
                <th className="text-left py-3 px-4">Month</th>
                <th className="text-left py-3 px-4">Active Days</th>
                <th className="text-left py-3 px-4">Events</th>
                <th className="text-left py-3 px-4">Health</th>
                <th className="text-left py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {usage.map(u => {
                const health = u.active_days >= 15 ? 'healthy' : u.active_days >= 5 ? 'warning' : 'inactive';
                return (
                  <tr key={u.tenant_id + u.month} className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-200">{u.tenant_name || u.tenant_id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{new Date(u.month).toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}</td>
                    <td className="py-3 px-4">{u.active_days} / 30</td>
                    <td className="py-3 px-4 text-gray-400">{u.total_events}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-xs ${
                        health === 'healthy' ? 'text-green-400' : health === 'warning' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {health === 'healthy' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {health === 'healthy' ? '🟢' : health === 'warning' ? '🟡' : '🔴'}
                        {health === 'healthy' ? 'Ενεργός' : health === 'warning' ? 'Μέτριος' : 'Ανενεργός'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {u.last_activity ? new Date(u.last_activity).toLocaleString('el-GR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Events */}
      {topEvents.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold">Top Events (30 days)</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Event</th>
                  <th className="text-left py-3 px-4">Count</th>
                  <th className="text-left py-3 px-4">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {topEvents.map(e => (
                  <tr key={e.event_name + e.tenant_id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4"><code className="text-xs text-blue-400">{e.event_name}</code></td>
                    <td className="py-3 px-4 text-gray-300">{e.event_count}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{new Date(e.last_seen).toLocaleString('el-GR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
