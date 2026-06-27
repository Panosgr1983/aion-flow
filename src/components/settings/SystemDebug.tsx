import { useEffect, useState } from 'react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTenantContext } from '../../lib/TenantContext';
import { trackEvent } from '../../lib/analytics';
import { analyticsHelper } from '../../lib/dataHelpers';
import { RefreshCw, Activity, User, Building2, Database, Zap, BarChart3, Terminal } from 'lucide-react';

interface SystemStatus {
  supabase: boolean;
  telemetry: boolean;
  jwt: boolean;
  analyticsSource: 'live' | 'mock';
  eventsToday: number;
  lastEvent: { event_name: string; created_at: string } | null;
  lastTrackEvent: 'ok' | 'fail' | 'untested';
  userEmail: string | null;
  userId: string | null;
  tenantId: string | null;
  tenantName: string | null;
  rlsPass: boolean | null;
}

export default function SystemDebug() {
  const { user, session } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const [status, setStatus] = useState<SystemStatus>({
    supabase: false, telemetry: false, jwt: false,
    analyticsSource: 'mock', eventsToday: 0, lastEvent: null,
    lastTrackEvent: 'untested', userEmail: null, userId: null,
    tenantId: null, tenantName: null, rlsPass: null,
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true);
    const live = isSupabaseAvailable();
    let tenantName = null;
    let eventsToday = 0;
    let lastEvent: SystemStatus['lastEvent'] = null;
    let rlsPass: boolean | null = null;
    let analyticsSrc: 'live' | 'mock' = 'mock';

    const jwtTenantId = (user as any)?.tenant_id as string | undefined;
    const effectiveTenantId = selectedTenantId || jwtTenantId || null;

    if (live) {
      const today = new Date().toISOString().slice(0, 10);
      const [evResult, lastResult, tenantResult] = await Promise.all([
        supabase.from('usage_events').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('usage_events').select('event_name, created_at').order('created_at', { ascending: false }).limit(1),
        effectiveTenantId ? supabase.from('tenants').select('name').eq('id', effectiveTenantId).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      eventsToday = evResult.count ?? 0;
      if (lastResult.data && lastResult.data.length > 0) lastEvent = lastResult.data[0];
      if (tenantResult.data) tenantName = (tenantResult.data as any).name;

      try {
        const { data: testData } = await supabase.from('tenants').select('id').limit(1);
        rlsPass = testData !== null;
      } catch { rlsPass = false; }

      try {
        const d = await analyticsHelper.getDashboardData();
        analyticsSrc = d.totalRevenue === 24680.50 && d.totalOrders === 32 ? 'mock' : 'live';
      } catch { analyticsSrc = 'mock'; }
    }

    setStatus({
      supabase: live,
      telemetry: eventsToday > 0 || lastEvent !== null,
      jwt: !!session?.access_token,
      analyticsSource: analyticsSrc,
      eventsToday,
      lastEvent,
      lastTrackEvent: 'untested',
      userEmail: user?.email ?? null,
      userId: user?.id ?? null,
      tenantId: effectiveTenantId,
      tenantName,
      rlsPass,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, selectedTenantId]);

  const handleTestEvent = async () => {
    setTesting(true);
    try {
      await trackEvent('platform.feature_enabled', { feature_name: 'system_debug_test', enabled_by: 'admin' });
      setStatus(s => ({ ...s, lastTrackEvent: 'ok' }));
    } catch { setStatus(s => ({ ...s, lastTrackEvent: 'fail' })); }
    setTesting(false);
  };

  const rows: { label: string; icon: any; value: React.ReactNode; status?: 'ok' | 'fail' | 'warn' }[] = [
    { label: 'Supabase Connection', icon: Database, value: status.supabase ? 'Connected' : 'Disconnected', status: status.supabase ? 'ok' : 'fail' },
    { label: 'Telemetry', icon: Activity, value: status.telemetry ? `Active (${status.eventsToday} today)` : 'No events today', status: status.telemetry ? 'ok' : 'warn' },
    { label: 'JWT Token', icon: Zap, value: status.jwt ? 'Present' : 'Missing', status: status.jwt ? 'ok' : 'fail' },
    { label: 'RLS Access', icon: ShieldIcon, value: status.rlsPass === true ? 'Pass' : status.rlsPass === false ? 'Fail' : 'Unknown', status: status.rlsPass === true ? 'ok' : status.rlsPass === false ? 'fail' : 'warn' },
    { label: 'Analytics Source', icon: BarChart3, value: status.analyticsSource === 'live' ? 'Live Database' : 'Mock Fallback', status: status.analyticsSource === 'live' ? 'ok' : 'warn' },
    { label: 'Current User', icon: User, value: status.userEmail || '—' },
    { label: 'User ID', icon: Terminal, value: status.userId ? status.userId.slice(0, 12) + '…' : '—' },
    { label: 'Active Tenant', icon: Building2, value: status.tenantName || status.tenantId || 'None selected' },
    { label: 'Tenant ID', icon: Terminal, value: status.tenantId || '—' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Terminal size={20} className="text-cyan-400" /> System Health
          </h2>
          <p className="text-sm text-gray-500">Debug & diagnostic dashboard for developers</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(({ label, icon: Icon, value, status: st }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
              st === 'ok' ? 'bg-green-500/15 text-green-400'
              : st === 'fail' ? 'bg-red-500/15 text-red-400'
              : st === 'warn' ? 'bg-amber-500/15 text-amber-400'
              : 'bg-gray-800 text-gray-400'
            }`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity size={14} className="text-blue-400" /> Telemetry Test
          </h3>
          <button
            onClick={handleTestEvent}
            disabled={testing}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              status.lastTrackEvent === 'ok' ? 'bg-green-500/15 text-green-400'
              : status.lastTrackEvent === 'fail' ? 'bg-red-500/15 text-red-400'
              : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
            }`}
          >
            {testing ? 'Sending…' : status.lastTrackEvent === 'ok' ? '✓ Last OK' : status.lastTrackEvent === 'fail' ? '✗ Last Failed' : 'Send Test Event'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {status.lastTrackEvent === 'untested'
            ? 'Click "Send Test Event" to verify trackEvent() writes to usage_events.'
            : status.lastTrackEvent === 'ok'
            ? 'Test event was written successfully. Check usage_events table to confirm.'
            : 'Test event failed. Check browser console for details.'}
        </p>
      </div>

      {status.lastEvent && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-2">Last Event</h3>
          <div className="flex items-center gap-2 text-sm">
            <code className="text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">{status.lastEvent.event_name}</code>
            <span className="text-xs text-gray-500">{new Date(status.lastEvent.created_at).toLocaleString('el-GR')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldIcon({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
