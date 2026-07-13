import { useEffect, useState, useMemo } from 'react';
import { BrainCircuit, BookOpen, Shield, BarChart3, AlertTriangle, CheckCircle, Search, Clock, FileText, GitCommit } from 'lucide-react';
import docIndex from '../../../assets/documentation.db.json';

interface DocEntry {
  id: string; title: string; path: string; status: string; maturity: string;
  tags: string[]; owner?: string; last_reviewed?: string; source_of_truth?: boolean;
  mmi?: { l1: number; l2: number; l3: number; l4: number; score: number; status: string; verified: boolean };
}

interface IndexMeta {
  generated_at: string; git_commit: string; index_version: string;
  docs_count: number; stale_docs_count: number;
  mmi_modules: { id: string; l1: number; l2: number; l3: number; l4: number; score: number; status: string; verified: boolean }[];
  platform_mmi: number;
}

const SEARCH_FILTERS = ['All', 'Platform', 'Tenants', 'Modules', 'Methods', 'Playbooks', 'Decisions', 'Archive'] as const;

const TENANT_DATA = [
  { tenant: 'Κολοκοτρώνης', score: 100, modules: 'CMS, CRM, Blog', status: '✅ Live', breakdown: 'Website 100% | CMS 100% | Blog 100% | Analytics 100%' },
  { tenant: 'Κτήμα Καρέλη', score: 87, modules: 'CMS, Retreat, Locale, Bookings, Gallery', status: '✅ Live', breakdown: 'Website 98% | Locale 42% | Experiences 78% | Bookings 100%' },
];

const BLOCKERS = [
  { module: 'CRM', issue: 'Tenant isolation not implemented', severity: 'HIGH', ref: 'TECH_DEBT #20' },
  { module: 'CRM', issue: 'Helpers query all tenants without filter', severity: 'HIGH', ref: 'KNOWN_ISSUES #16' },
  { module: 'E-commerce', issue: 'Helpers not tenant-filtered (demo only)', severity: 'HIGH', ref: 'TECH_DEBT #21' },
  { module: 'Locale', issue: 'Translations editor not built (v0.7)', severity: 'MEDIUM', ref: 'ROADMAP v0.7' },
  { module: 'Media', issue: 'Static images not managed via Media Library', severity: 'LOW', ref: 'TECH_DEBT #22' },
];

export default function AKESDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const meta = docIndex._meta as IndexMeta;
  const docs = (docIndex.entries || docIndex) as DocEntry[];
  const mmiModules = meta.mmi_modules || [];
  const platformMmi = meta.platform_mmi || 0;

  // Stats
  const stats = useMemo(() => ({
    total: docs.length,
    platform: docs.filter(d => d.path?.startsWith('01_PLATFORM')).length,
    modules: docs.filter(d => d.path?.startsWith('03_MODULES')).length,
    methods: docs.filter(d => d.path?.startsWith('04_METHODS')).length,
    stale: meta.stale_docs_count || 0,
    blockers: BLOCKERS.length,
  }), [docs, meta]);

  // Search
  const filteredByCategory = filter === 'All' ? docs : docs.filter(d => {
    if (filter === 'Platform') return d.path?.startsWith('01_PLATFORM');
    if (filter === 'Tenants') return d.path?.startsWith('02_TENANTS');
    if (filter === 'Modules') return d.path?.startsWith('03_MODULES');
    if (filter === 'Methods') return d.path?.startsWith('04_METHODS');
    if (filter === 'Playbooks') return d.path?.startsWith('06_PLAYBOOKS');
    if (filter === 'Decisions') return d.path?.startsWith('05_DECISION_MEMORY') || d.id?.includes('adr');
    if (filter === 'Archive') return d.path?.startsWith('archive');
    return true;
  });

  const searchResults = search
    ? filteredByCategory.filter(d =>
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.id?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 20)
    : [];

  const selected = mmiModules.find(m => m.id === selectedModule);
  const color = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const bg = (s: number) => s >= 80 ? 'bg-green-900/20 border-green-800/30' : s >= 60 ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-red-900/20 border-red-800/30';

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
            <div className="text-2xl font-bold text-white">{platformMmi}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Platform MMI</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Indexed Docs</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500"><GitCommit className="h-3 w-3 inline" /> {meta.git_commit?.slice(0, 7)}</div>
            <div className="text-[10px] text-gray-600">{meta.generated_at?.slice(0, 10)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Platform', value: stats.platform, icon: Shield, color: 'text-green-400' },
          { label: 'Modules', value: stats.modules, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Methods', value: stats.methods, icon: BarChart3, color: 'text-purple-400' },
          { label: 'Blockers', value: stats.blockers, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Stale Docs', value: stats.stale, icon: Clock, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <div className="flex items-center gap-2"><s.icon className={`h-4 w-4 ${s.color}`} /><span className="text-xs uppercase tracking-wider text-gray-500">{s.label}</span></div>
            <div className="mt-1 text-lg font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* MMI Table */}
      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: selectedModule ? '1fr 1fr' : '1fr' }}>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">Module Maturity Index <span className="text-[10px] text-gray-600 font-normal">(auto-generated from frontmatter)</span></h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="text-left pb-2">Module</th>
                  <th className="text-right pb-2">MMI</th>
                  <th className="text-center pb-2">L1</th>
                  <th className="text-center pb-2">L2</th>
                  <th className="text-center pb-2">L3</th>
                  <th className="text-center pb-2">L4</th>
                  <th className="text-center pb-2">Status</th>
                  <th className="text-center pb-2">V</th>
                </tr>
              </thead>
              <tbody>
                {mmiModules.map(m => (
                  <tr key={m.id}
                    onClick={() => setSelectedModule(selectedModule === m.id ? null : m.id)}
                    className={`border-t border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-800/30 ${selectedModule === m.id ? 'bg-blue-900/10' : ''}`}>
                    <td className="py-2 text-gray-300 text-xs capitalize">{m.id}</td>
                    <td className={`py-2 text-right font-mono ${color(m.score)}`}>{m.score}%</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.l1}/4</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.l2}/4</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.l3}/4</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.l4}/4</td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${bg(m.score)} ${color(m.score)}`}>{m.status}</span>
                    </td>
                    <td className="py-2 text-center">
                      {m.verified ? <CheckCircle className="h-3.5 w-3.5 text-green-400 mx-auto" title="Verified" /> : <span className="text-[10px] text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[10px] text-gray-600 flex gap-4">
              <span>L1: Data</span><span>L2: Authoring</span><span>L3: Delivery</span><span>L4: Intelligence</span>
              <span className="ml-auto auto">MMI = (L1+L2+L3+L4) / 16 × 100 — from module frontmatter</span>
            </div>
          </div>
        </div>

        {selected && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/30">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-sm font-medium text-white">{selected.id} — Detail</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'L1 Data', score: selected.l1, items: 'Schema, tenant_id, columns' },
                  { label: 'L2 Authoring', score: selected.l2, items: 'CMS panels, CRUD, permissions' },
                  { label: 'L3 Delivery', score: selected.l3, items: 'Public render, isolation, states' },
                  { label: 'L4 Intelligence', score: selected.l4, items: 'Telemetry, tests, automation' },
                ].map(l => (
                  <div key={l.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                    <div className="text-xs text-gray-300">{l.label}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{l.score}/4</div>
                    <div className="mt-1 text-[10px] text-gray-600">{l.items}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className={`h-full rounded-full ${l.score === 4 ? 'bg-green-500' : l.score > 0 ? 'bg-yellow-500' : 'bg-gray-700'}`} style={{ width: `${(l.score / 4) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Status: <span className={color(selected.score)}>{selected.status}</span></span>
                <span>Verified: {selected.verified ? <CheckCircle className="h-3 w-3 text-green-400 inline" /> : '—'}</span>
                <span>Score: <span className="font-mono">{selected.score}%</span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tenants + Blockers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800"><h2 className="text-sm font-medium text-white">Tenant Readiness</h2></div>
          <div className="p-4 space-y-3">
            {TENANT_DATA.map(t => (
              <div key={t.tenant}>
                <div className="flex items-center justify-between">
                  <div><div className="text-sm text-gray-300">{t.tenant}</div><div className="text-[10px] text-gray-600">{t.modules}</div></div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div className={`h-full rounded-full ${t.score >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${t.score}%` }} />
                    </div>
                    <span className={`text-xs font-mono ${t.score >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{t.score}%</span>
                    <span className="text-[10px] text-green-400">{t.status}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-600 pl-1">{t.breakdown}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800"><h2 className="text-sm font-medium text-white">Active Blockers <span className="text-[10px] text-gray-600">({BLOCKERS.length})</span></h2></div>
          <div className="p-4 space-y-2">
            {BLOCKERS.map((b, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-800/50 last:border-b-0">
                <div className="flex items-start gap-2 min-w-0">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${b.severity === 'HIGH' ? 'text-red-400' : b.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}`} />
                  <div><div className="text-xs text-gray-300">{b.issue}</div><div className="text-[10px] text-gray-600">{b.module} · {b.ref}</div></div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${b.severity === 'HIGH' ? 'bg-red-900/30 text-red-400' : b.severity === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{b.severity}</span>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SEARCH_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>{f}</button>
            ))}
          </div>
          {search && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {searchResults.length === 0
                ? <p className="text-xs text-gray-500 py-2 text-center">No results</p>
                : searchResults.map(d => (
                    <div key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800/50">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-300 truncate">{d.title}</div>
                        <div className="flex gap-2 text-[10px] text-gray-600">
                          <span>{d.path}</span>
                          {d.maturity && d.maturity !== '—' && <span>· {d.maturity}</span>}
                          {d.last_reviewed && <span>· Reviewed: {d.last_reviewed}</span>}
                          {d.mmi && <span>· MMI: {d.mmi.score}%</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${d.mmi?.status === 'PRODUCTION' ? 'bg-green-900/30 text-green-400' : d.mmi?.status === 'STABLE' ? 'bg-yellow-900/30 text-yellow-400' : d.mmi?.status === 'BLOCKED' ? 'bg-red-900/30 text-red-400' : 'bg-gray-800 text-gray-500'}`}>{d.mmi?.status || d.status || '—'}</span>
                    </div>
                  ))
              }
            </div>
          )}
          {!search && <p className="text-xs text-gray-600 text-center py-4">Type to search {stats.total} docs with {mmiModules.length} scored modules</p>}
        </div>
      </div>

      {/* Technical Report */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/30">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-medium text-white flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-400" /> Technical Report</h2>
        </div>
        <div className="p-4 space-y-4 text-xs text-gray-400">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Source of Truth</h3>
              <p><span className="text-gray-500">SoT:</span> Markdown docs with YAML frontmatter ({stats.total} files)</p>
              <p><span className="text-gray-500">Index:</span> <code>documentation.db.json</code> — generated, read-only</p>
              <p><span className="text-gray-500">Pipeline:</span> Markdown → <code>npm run docs:index</code> → bundled JSON → Dashboard</p>
              <p><span className="text-gray-500">Access:</span> Bundled by Vite — no public URL</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">MMI Calculation</h3>
              <p><span className="text-gray-500">Formula:</span> <code>(L1+L2+L3+L4) / 16 × 100</code> — from frontmatter mmi field</p>
              <p><span className="text-gray-500">Generated:</span> Auto-calculated by <code>docs:index</code> — no manual duplication</p>
              <p><span className="text-gray-500">Modules scored:</span> {mmiModules.length}</p>
              <p><span className="text-gray-500">Platform MMI:</span> {platformMmi}%</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Security & Access</h3>
              <p><span className="text-gray-500">Permission:</span> <code>platform.akes.view</code> (Super Admin only)</p>
              <p><span className="text-gray-500">Sidebar:</span> Gated by manifest permission</p>
              <p><span className="text-gray-500">Route:</span> Protected — tenant admin blocked</p>
              <p><span className="text-gray-500">Source:</span> READ-ONLY — never modifies the index</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Version</h3>
              <p><span className="text-gray-500">Generated:</span> {meta.generated_at?.slice(0, 10)}</p>
              <p><span className="text-gray-500">Git commit:</span> <code>{meta.git_commit?.slice(0, 7)}</code></p>
              <p><span className="text-gray-500">Index version:</span> {meta.index_version}</p>
              <p><span className="text-gray-500">Docs:</span> {stats.total} ({stats.stale} stale)</p>
              <p><span className="text-gray-500">Refresh:</span> <code>npm run docs:index</code> → commit → deploy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
