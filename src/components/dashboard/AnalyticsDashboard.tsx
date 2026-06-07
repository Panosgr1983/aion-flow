import { useState, useEffect } from 'react';
import { BarChart3, MousePointerClick, Users, TrendingUp, Globe, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DailyStat } from '../../types/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: daily } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('date', { ascending: true })
        .limit(90);

      const { data: raw } = await supabase
        .from('pageviews')
        .select('path, ip_hash')
        .eq('tenant_id', TENANT_ID);

      if (daily) setStats(daily);
      if (raw) {
        setTotalViews(raw.length);
        const unique = new Set(raw.map(r => r.ip_hash).filter(Boolean));
        setTotalVisitors(unique.size);

        const pageCount: Record<string, number> = {};
        raw.forEach(r => { pageCount[r.path] = (pageCount[r.path] || 0) + 1; });
        setTopPages(
          Object.entries(pageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([path, count]) => ({ path, count }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const total30 = stats.slice(-30).reduce((s, d) => s + d.pageviews, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-400" /> Web Analytics
        </h2>
        <p className="text-sm text-gray-500">Επισκεψιμότητα του kolokotronis.gr</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="size-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={MousePointerClick} label="Σύνολο σελίδων" value={totalViews.toLocaleString()} color="blue" />
            <StatCard icon={Users} label="Μοναδικοί επισκέπτες" value={totalVisitors.toLocaleString()} color="emerald" />
            <StatCard icon={TrendingUp} label="Τελευταίες 30 ημέρες" value={total30.toLocaleString()} color="purple" />
            <StatCard icon={Calendar} label="Ημέρες δεδομένων" value={stats.length.toString()} color="amber" />
          </div>

          {stats.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Ημερήσιες προβολές</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="pageviews" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Globe size={14} /> Top Σελίδες</h3>
              {topPages.length === 0 ? (
                <p className="text-gray-600 text-sm">Δεν υπάρχουν ακόμα δεδομένα.</p>
              ) : (
                <div className="space-y-2">
                  {topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600 w-5 text-right">{i + 1}.</span>
                      <span className="text-gray-300 flex-1 truncate">{p.path || '/'}</span>
                      <span className="text-blue-400 font-mono text-xs">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Unique Visitors ανά ημέρα</h3>
              {stats.length === 0 ? (
                <p className="text-gray-600 text-sm">Δεν υπάρχουν ακόμα δεδομένα.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }} />
                    <Area type="monotone" dataKey="unique_visitors" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };
  return (
    <div className="card p-5">
      <div className={`size-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
