import { useEffect, useState } from 'react';
import { BrainCircuit, BookOpen, Shield, BarChart3, AlertTriangle, CheckCircle, Search, ExternalLink } from 'lucide-react';

interface DocEntry {
  id: string;
  title: string;
  path: string;
  status: string;
  maturity: string;
  tags: string[];
}

const MMI_DATA = [
  { module: 'CMS Core', score: 100, status: 'PRODUCTION', verified: true },
  { module: 'Portfolio', score: 75, status: 'STABLE', verified: true },
  { module: 'Retreat', score: 79, status: 'STABLE', verified: false },
  { module: 'Media', score: 83, status: 'PRODUCTION', verified: false },
  { module: 'Blog', score: 78, status: 'STABLE', verified: false },
  { module: 'Bookings', score: 100, status: 'PRODUCTION', verified: false },
  { module: 'CRM', score: 33, status: 'BLOCKED', verified: false },
  { module: 'Locale', score: 8, status: 'EARLY', verified: false },
  { module: 'AKES', score: 95, status: 'PRODUCTION', verified: true },
];

const TENANT_DATA = [
  { tenant: 'Κολοκοτρώνης', score: 100, modules: 'CMS, CRM, Blog', status: '✅ Live' },
  { tenant: 'Κτήμα Καρέλη', score: 87, modules: 'CMS, Retreat, Locale, Bookings, Gallery', status: '✅ Live' },
];

const BLOCKERS = [
  { module: 'CRM', issue: 'Tenant isolation not implemented', severity: 'HIGH', link: '/dashboard/settings/system' },
  { module: 'Locale', issue: 'Translations editor not built (v0.7)', severity: 'MEDIUM', link: '/dashboard/settings/system' },
  { module: 'Media', issue: 'Static images not managed via Media Library', severity: 'LOW', link: '' },
];

export default function AKESDashboard() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, platform: 0, modules: 0, methods: 0 });

  useEffect(() => {
    fetch('/documentation.db.json').then(r => r.json()).then((data: DocEntry[]) => {
      setDocs(data);
      setStats({
        total: data.length,
        platform: data.filter(d => d.path.startsWith('01_PLATFORM')).length,
        modules: data.filter(d => d.path.startsWith('03_MODULES')).length,
        methods: data.filter(d => d.path.startsWith('04_METHODS')).length,
      });
    }).catch(() => {});
  }, []);

  const filtered = search
    ? docs.filter(d =>
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.id?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 20)
    : [];

  const avgScore = Math.round(MMI_DATA.reduce((s, m) => s + m.score, 0) / MMI_DATA.length);

  const color = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const bgColor = (score: number) => {
    if (score >= 80) return 'bg-green-900/20 border-green-800/30';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-800/30';
    return 'bg-red-900/20 border-red-800/30';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">AKES Dashboard</h1>
            <p className="text-sm text-gray-500">AION Knowledge & Engineering System — Platform Health</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{avgScore}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Platform MMI</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Indexed Docs</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-green-400"><Shield className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Platform</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{stats.platform}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-blue-400"><BookOpen className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Modules</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{stats.modules}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-purple-400"><BarChart3 className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Methods</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{stats.methods}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-amber-400"><AlertTriangle className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Blockers</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{BLOCKERS.length}</div>
          <div className="text-[10px] text-gray-600">active</div>
        </div>
      </div>

      {/* MMI Table */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/30">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-medium text-white">Module Maturity Index</h2>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                <th className="text-left pb-2">Module</th>
                <th className="text-right pb-2">MMI</th>
                <th className="text-center pb-2">Status</th>
                <th className="text-center pb-2">Verified</th>
              </tr>
            </thead>
            <tbody>
              {MMI_DATA.map(m => (
                <tr key={m.module} className="border-t border-gray-800/50">
                  <td className="py-2 text-gray-300">{m.module}</td>
                  <td className={`py-2 text-right font-mono ${color(m.score)}`}>{m.score}%</td>
                  <td className="py-2 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${bgColor(m.score)} ${color(m.score)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    {m.verified ? <CheckCircle className="h-4 w-4 text-green-400 mx-auto" /> : <span className="text-[10px] text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenants + Blockers */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tenant Readiness */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">Tenant Readiness</h2>
          </div>
          <div className="p-4 space-y-3">
            {TENANT_DATA.map(t => (
              <div key={t.tenant} className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">{t.tenant}</div>
                  <div className="text-[10px] text-gray-600">{t.modules}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div className={`h-full rounded-full ${t.score >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${t.score}%` }} />
                  </div>
                  <span className={`text-xs font-mono ${t.score >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{t.score}%</span>
                  <span className="text-[10px] text-green-400">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Blockers */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">Active Blockers</h2>
          </div>
          <div className="p-4 space-y-3">
            {BLOCKERS.map(b => (
              <div key={b.module} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${b.severity === 'HIGH' ? 'text-red-400' : b.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-300 truncate">{b.issue}</div>
                    <div className="text-[10px] text-gray-600">{b.module}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${b.severity === 'HIGH' ? 'bg-red-900/30 text-red-400' : b.severity === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                  {b.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Search */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/30">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Documentation Search</h2>
          <span className="text-[10px] text-gray-600">{stats.total} indexed entries</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documentation (module, method, tenant, tag...)"
              className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          {search && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">No results found</p>
              ) : (
                filtered.map(d => (
                  <div key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-300 truncate">{d.title}</div>
                      <div className="text-[10px] text-gray-600">{d.path} {d.maturity !== '—' ? `· ${d.maturity}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === 'Standard' ? 'bg-green-900/30 text-green-400' : d.status === 'Experimental' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{d.status || '—'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {!search && (
            <p className="text-xs text-gray-600 text-center py-4">Type to search across all {stats.total} indexed documents</p>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-[10px] text-gray-600 text-center space-y-1">
        <p>AKES v1.0 — 158 files, 21,483 lines — documentation.db.json loaded in memory</p>
        <p>Module Maturity Index (MMI) — L1 Data · L2 Authoring · L3 Delivery · L4 Intelligence</p>
      </div>
    </div>
  );
}
