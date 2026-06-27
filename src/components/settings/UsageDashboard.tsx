import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenantContext } from '../../lib/TenantContext';
import { RefreshCw, Users, BarChart3, CheckCircle, AlertOctagon } from 'lucide-react';

interface TenantHealth {
  tenant_id: string;
  tenant_name: string;
  last_activity: string | null;
  days_since_last_activity: number | null;
  active_days_30d: number;
  total_events_30d: number;
  churn_risk: string;
  engagement_level: string;
}

interface TenantActivity {
  tenant_id: string;
  tenant_name: string;
  month: string;
  active_days: number;
  total_events: number;
  last_activity: string;
}

interface TopEvent {
  tenant_id: string;
  tenant_name: string;
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
  const [health, setHealth] = useState<TenantHealth[]>([]);
  const [activity, setActivity] = useState<TenantActivity[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryFilter = (q: any) =>
    selectedTenantId ? q.eq('tenant_id', selectedTenantId) : q;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [{ data: tenants }, { data: events }] = await Promise.all([
        supabase.from('tenants').select('id, name'),
        queryFilter(
          supabase
            .from('usage_events')
            .select('tenant_id, event_name, created_at, source')
            .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())
            .order('created_at', { ascending: false })
        ),
      ]);

      if (!tenants || tenants.length === 0) {
        setError('Δεν βρέθηκαν tenants');
        setLoading(false);
        return;
      }

      const tenantMap = new Map(tenants.map((t: any) => [t.id, t.name]));
      const events30d = (events || []).filter(
        (e: any) => e.source !== 'worker' && e.source !== 'system'
          && new Date(e.created_at).getTime() > Date.now() - 30 * 86400000
      );
      const eventsAll = (events || []).filter(
        (e: any) => e.source !== 'worker' && e.source !== 'system'
      );

      // ── Tenant Health / Churn Risk ──
      const lastByTenant = new Map<string, { last: string; count30: number; days30: Set<string> }>();
      for (const e of events30d as any[]) {
        const key = e.tenant_id;
        if (!lastByTenant.has(key)) lastByTenant.set(key, { last: e.created_at, count30: 0, days30: new Set() });
        const rec = lastByTenant.get(key)!;
        if (new Date(e.created_at).getTime() > new Date(rec.last).getTime()) rec.last = e.created_at;
        rec.count30++;
        rec.days30.add(new Date(e.created_at).toISOString().slice(0, 10));
      }
      // For tenants with no events in 30d, check 90d for last_activity
      const last90ByTenant = new Map<string, string>();
      for (const e of eventsAll as any[]) {
        const key = e.tenant_id;
        const curr = last90ByTenant.get(key);
        if (!curr || new Date(e.created_at).getTime() > new Date(curr).getTime()) {
          last90ByTenant.set(key, e.created_at);
        }
      }

      const healthData: TenantHealth[] = tenants.map((t: any) => {
        const h = lastByTenant.get(t.id);
        const last90 = last90ByTenant.get(t.id);
        const last = h?.last || last90 || null;
        const daysSince = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : null;
        const activeDays = h?.days30.size || 0;
        const totalEvents30 = h?.count30 || 0;
        let risk: string;
        let engagement: string;
        if (!last) { risk = 'inactive'; engagement = 'Νέος — χωρίς δραστηριότητα'; }
        else if (daysSince! >= 30) { risk = 'inactive'; engagement = 'Ανενεργός >30 ημέρες'; }
        else if (daysSince! >= 14) { risk = 'critical'; engagement = 'Σε κρίσιμο κίνδυνο'; }
        else if (daysSince! >= 7) { risk = 'warning'; engagement = 'Σε κίνδυνο'; }
        else if (activeDays >= 15) { risk = 'healthy'; engagement = 'Ενεργός χρήστης'; }
        else if (activeDays >= 5) { risk = 'attention'; engagement = 'Μέτρια δραστηριότητα'; }
        else { risk = 'warning'; engagement = 'Χαμηλή δραστηριότητα'; }
        return {
          tenant_id: t.id,
          tenant_name: t.name,
          last_activity: last,
          days_since_last_activity: daysSince,
          active_days_30d: activeDays,
          total_events_30d: totalEvents30,
          churn_risk: risk,
          engagement_level: engagement,
        };
      });
      healthData.sort((a, b) => (b.days_since_last_activity || 999) - (a.days_since_last_activity || 999));

      // ── Monthly Activity ──
      const monthMap = new Map<string, { tenant_id: string; tenant_name: string; month: string; days: Set<string>; count: number; last: string }>();
      for (const e of eventsAll as any[]) {
        const m = new Date(e.created_at).toISOString().slice(0, 7);
        const key = `${e.tenant_id}|${m}`;
        if (!monthMap.has(key)) monthMap.set(key, {
          tenant_id: e.tenant_id,
          tenant_name: tenantMap.get(e.tenant_id) || e.tenant_id,
          month: m,
          days: new Set(),
          count: 0,
          last: e.created_at,
        });
        const rec = monthMap.get(key)!;
        rec.days.add(new Date(e.created_at).toISOString().slice(0, 10));
        rec.count++;
        if (new Date(e.created_at).getTime() > new Date(rec.last).getTime()) rec.last = e.created_at;
      }
      const activityData: TenantActivity[] = Array.from(monthMap.values())
        .map(r => ({ tenant_id: r.tenant_id, tenant_name: r.tenant_name, month: r.month, active_days: r.days.size, total_events: r.count, last_activity: r.last }))
        .sort((a, b) => b.month.localeCompare(a.month));

      // ── Top Events (30 days) ──
      const eventMap = new Map<string, { tenant_id: string; tenant_name: string; event_name: string; count: number; last: string }>();
      for (const e of events30d as any[]) {
        const key = `${e.tenant_id}|${e.event_name}`;
        if (!eventMap.has(key)) eventMap.set(key, { tenant_id: e.tenant_id, tenant_name: tenantMap.get(e.tenant_id) || e.tenant_id, event_name: e.event_name, count: 0, last: e.created_at });
        const rec = eventMap.get(key)!;
        rec.count++;
        if (new Date(e.created_at).getTime() > new Date(rec.last).getTime()) rec.last = e.created_at;
      }
      const topEventsData: TopEvent[] = Array.from(eventMap.values())
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 50)
        .map((r: any) => ({ ...r, last_seen: r.last }));

      setHealth(healthData);
      setActivity(activityData);
      setTopEvents(topEventsData);
    } catch (err: any) {
      setError(err?.message || 'Σφάλμα φόρτωσης δεδομένων');
    }
    setLoading(false);
  }, [selectedTenantId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const totalEvents = activity.reduce((s, u) => s + u.total_events, 0);
  const atRisk = health.filter(r => r.churn_risk === 'critical' || r.churn_risk === 'warning').length;
  const healthy = health.filter(r => r.churn_risk === 'healthy').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usage & Telemetry</h2>
          <p className="text-sm text-gray-500">
            {error ? error : `${health.length} tenants · ${totalEvents} events · ${atRisk > 0 ? `${atRisk} σε κίνδυνο` : 'όλα υγιή'}`}
          </p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Tenants', value: health.length, color: 'text-blue-400' },
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
            <AlertOctagon size={14} className="text-amber-400" />
            Churn Risk — Tenant Health
          </h3>
          <p className="text-[11px] text-gray-500">30-day activity window · alerts after 14d inactivity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tenant</th>
                <th className="text-left py-3 px-4">Days Inactive</th>
                <th className="text-left py-3 px-4">Active Days</th>
                <th className="text-left py-3 px-4">Events</th>
                <th className="text-left py-3 px-4">Churn Risk</th>
                <th className="text-left py-3 px-4">Engagement</th>
                <th className="text-left py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {health.map(r => (
                <tr key={r.tenant_id} className={`hover:bg-gray-900/50 transition-colors ${r.churn_risk === 'critical' ? 'bg-red-500/5' : r.churn_risk === 'warning' ? 'bg-orange-500/5' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-200">{r.tenant_name}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${r.days_since_last_activity && r.days_since_last_activity > 14 ? 'text-red-400' : r.days_since_last_activity && r.days_since_last_activity > 7 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {r.days_since_last_activity ? `${Math.round(r.days_since_last_activity)}η` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{r.active_days_30d} / 30</td>
                  <td className="py-3 px-4 text-gray-400">{r.total_events_30d}</td>
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

      {/* Alerts */}
      {health.filter(r => r.days_since_last_activity && r.days_since_last_activity >= 14).length > 0 && (
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Early Warning Alerts</h3>
          </div>
          <div className="space-y-2">
            {health.filter(r => r.days_since_last_activity && r.days_since_last_activity >= 14).map(r => (
              <div key={r.tenant_id} className="flex items-center justify-between py-1.5 border-b border-red-500/10 last:border-0">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{r.tenant_name}</p>
                  <p className="text-xs text-gray-500">Inactive for {Math.round(r.days_since_last_activity!)} days · Last: {r.last_activity ? new Date(r.last_activity).toLocaleDateString('el-GR') : 'never'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Alert</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Activity */}
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
              {activity.map(u => (
                <tr key={u.tenant_id + u.month} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-200">{u.tenant_name || u.tenant_id.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{new Date(u.month + '-01').toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}</td>
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
                  <th className="text-left py-3 px-4">Tenant</th>
                  <th className="text-left py-3 px-4">Count</th>
                  <th className="text-left py-3 px-4">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {topEvents.map(e => (
                  <tr key={e.event_name + e.tenant_id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4"><code className="text-xs text-blue-400">{e.event_name}</code></td>
                    <td className="py-3 px-4 text-xs text-gray-400">{e.tenant_name}</td>
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
