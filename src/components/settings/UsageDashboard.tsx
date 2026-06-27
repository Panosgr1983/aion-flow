/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Usage & Telemetry Dashboard (MT-3)
  
  Super Admin dashboard για παρακολούθηση:
    - Churn Risk: Ανάλυση ενεργών ημερών ανά tenant
    - Early Warning Alerts: Tenants με ≥14 ημέρες αδράνειας
    - Tenant Activity: Active days, events, last activity
    - Top Events: Πιο συχνά events (30 days)
    - Health signals: 🟢🟡🟠🔴 ανά tenant
  
  Πηγές δεδομένων:
    - v_churn_risk (materialized view)
    - v_tenant_active_days (aggregated view)
    - v_tenant_top_events (ranking view)
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenantContext } from '../../lib/TenantContext';
import { RefreshCw, Activity, Users, Calendar, BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, AlertOctagon, Eye, EyeOff } from 'lucide-react';

interface ChurnRiskRow {
  tenant_id: string;
  tenant_name: string;
  slug: string;
  status: string;
  industry: string | null;
  last_activity: string | null;
  days_since_last_activity: number | null;
  active_days_30d: number;
  total_events_30d: number;
  churn_risk: string;
  engagement_level: string;
}

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

const RISK_COLORS: Record<string, string> = {
  healthy: 'text-green-400 bg-green-500/10',
  attention: 'text-yellow-400 bg-yellow-500/10',
  warning: 'text-orange-400 bg-orange-500/10',
  critical: 'text-red-400 bg-red-500/10',
  inactive: 'text-gray-500 bg-gray-500/10',
};

const RISK_LABELS: Record<string, string> = {
  healthy: '🟢 Υγιής',
  attention: '🟡 Προσοχή',
  warning: '🟠 Σε κίνδυνο',
  critical: '🔴 Κρίσιμο',
  inactive: '⚪ Ανενεργός',
};

export default function UsageDashboard() {
  const { selectedTenantId } = useTenantContext();
  const [churnData, setChurnData] = useState<ChurnRiskRow[]>([]);
  const [usage, setUsage] = useState<TenantUsage[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q1: any = supabase.from('v_churn_risk').select('*').order('days_since_last_activity', { ascending: false });
    let q2: any = supabase.from('v_tenant_active_days').select('*').order('last_activity', { ascending: false });
    let q3: any = supabase.from('v_tenant_top_events').select('*').limit(50);
    if (selectedTenantId) {
      q1 = q1.eq('tenant_id', selectedTenantId);
      q2 = q2.eq('tenant_id', selectedTenantId);
      q3 = q3.eq('tenant_id', selectedTenantId);
    }
    const [c, u, e] = await Promise.all([q1, q2, q3]);
    if (c.data) setChurnData(c.data as ChurnRiskRow[]);
    if (u.data) setUsage(u.data as TenantUsage[]);
    if (e.data) setTopEvents(e.data as TopEvent[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedTenantId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const totalEvents = usage.reduce((s, u) => s + u.total_events, 0);
  const atRisk = churnData.filter(r => r.churn_risk === 'critical' || r.churn_risk === 'warning').length;
  const healthy = churnData.filter(r => r.churn_risk === 'healthy').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usage & Telemetry</h2>
          <p className="text-sm text-gray-500">{churnData.length} tenants · {totalEvents} events · {atRisk > 0 ? `${atRisk} σε κίνδυνο` : 'όλα υγιή'}</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Tenants', value: churnData.length, color: 'text-blue-400' },
          { icon: BarChart3, label: 'Total Events', value: totalEvents, color: 'text-green-400' },
          { icon: CheckCircle, label: 'Υγιείς', value: healthy, color: 'text-emerald-400' },
          { icon: AlertOctagon, label: 'Σε Κίνδυνο', value: atRisk, color: atRisk > 0 ? 'text-red-400' : 'text-gray-500' },
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

      {/* Churn Risk Section */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Churn Risk — Tenant Health
          </h3>
          <p className="text-[11px] text-gray-500">30-day activity window · alerts after 14d inactivity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tenant</th>
                <th className="text-left py-3 px-4">Industry</th>
                <th className="text-left py-3 px-4">Days Inactive</th>
                <th className="text-left py-3 px-4">Active Days</th>
                <th className="text-left py-3 px-4">Churn Risk</th>
                <th className="text-left py-3 px-4">Engagement</th>
                <th className="text-left py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {churnData.map(r => (
                <tr key={r.tenant_id} className={`hover:bg-gray-900/50 transition-colors ${r.churn_risk === 'critical' ? 'bg-red-500/5' : r.churn_risk === 'warning' ? 'bg-orange-500/5' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-200">{r.tenant_name}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">{r.industry || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${r.days_since_last_activity && r.days_since_last_activity > 14 ? 'text-red-400' : r.days_since_last_activity && r.days_since_last_activity > 7 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {r.days_since_last_activity ? `${Math.round(r.days_since_last_activity)}η` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{r.active_days_30d} / 30</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_COLORS[r.churn_risk] || 'text-gray-500'}`}>
                      {RISK_LABELS[r.churn_risk] || r.churn_risk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400">{r.engagement_level}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {r.last_activity ? new Date(r.last_activity).toLocaleString('el-GR') : 'Ποτέ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Section */}
      {churnData.filter(r => r.days_since_last_activity && r.days_since_last_activity >= 14).length > 0 && (
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Early Warning Alerts</h3>
          </div>
          <div className="space-y-2">
            {churnData.filter(r => r.days_since_last_activity && r.days_since_last_activity >= 14).map(r => (
              <div key={r.tenant_id} className="flex items-center justify-between py-1.5 border-b border-red-500/10 last:border-0">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{r.tenant_name}</p>
                  <p className="text-xs text-gray-500">Inactive for {Math.round(r.days_since_last_activity!)} days · Last activity: {r.last_activity ? new Date(r.last_activity).toLocaleDateString('el-GR') : 'never'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Alert</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Section */}
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
                <th className="text-left py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {usage.map(u => (
                <tr key={u.tenant_id + u.month} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-200">{u.tenant_name || u.tenant_id.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{new Date(u.month).toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}</td>
                  <td className="py-3 px-4">{u.active_days} / 30</td>
                  <td className="py-3 px-4 text-gray-400">{u.total_events}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{u.last_activity ? new Date(u.last_activity).toLocaleString('el-GR') : '—'}</td>
                </tr>
              ))}
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
