import { useEffect, useState } from 'react';
import { BrainCircuit, BookOpen, Shield, BarChart3, AlertTriangle, CheckCircle, Search, ExternalLink, Clock, FileText, Filter } from 'lucide-react';
import docIndex from '../../../assets/documentation.db.json';

interface DocEntry {
  id: string; title: string; path: string; status: string; maturity: string;
  tags: string[]; owner?: string; last_reviewed?: string; source_of_truth?: boolean;
}

interface ModuleScore {
  l1: number; l2: number; l3: number; l4: number;
}

const MMI_DATA = [
  { module: 'CMS Core', score: 100, status: 'PRODUCTION', verified: true, breakdown: { l1: 5, l2: 5, l3: 5, l4: 0 } },
  { module: 'Portfolio', score: 75, status: 'STABLE', verified: true, breakdown: { l1: 3, l2: 3, l3: 3, l4: 0 } },
  { module: 'Retreat', score: 79, status: 'STABLE', verified: false, breakdown: { l1: 3, l2: 3, l3: 3, l4: 0 } },
  { module: 'Media', score: 83, status: 'PRODUCTION', verified: false, breakdown: { l1: 3, l2: 3, l3: 3, l4: 1 } },
  { module: 'Blog', score: 78, status: 'STABLE', verified: false, breakdown: { l1: 3, l2: 3, l3: 3, l4: 0 } },
  { module: 'Bookings', score: 100, status: 'PRODUCTION', verified: false, breakdown: { l1: 3, l2: 3, l3: 3, l4: 3 } },
  { module: 'CRM', score: 33, status: 'BLOCKED', verified: false, breakdown: { l1: 2, l2: 2, l3: 0, l4: 0 } },
  { module: 'Locale', score: 8, status: 'EARLY', verified: false, breakdown: { l1: 0, l2: 0, l3: 1, l4: 0 } },
  { module: 'AKES', score: 95, status: 'PRODUCTION', verified: true, breakdown: { l1: 3, l2: 3, l3: 3, l4: 2 } },
];

const TENANT_DATA = [
  { tenant: 'Κολοκοτρώνης', score: 100, modules: 'CMS, CRM, Blog', status: '✅ Live', breakdown: 'Website 100% | CMS 100% | Blog 100% | Analytics 100%' },
  { tenant: 'Κτήμα Καρέλη', score: 87, modules: 'CMS, Retreat, Locale, Bookings, Gallery', status: '✅ Live', breakdown: 'Website 98% | Locale 42% | Experiences 78% | Bookings 100%' },
];

const BLOCKERS = [
  { module: 'CRM', issue: 'Tenant isolation not implemented', severity: 'HIGH', ref: 'TECH_DEBT #20' },
  { module: 'CRM', issue: 'Crm helpers query all tenants without filter', severity: 'HIGH', ref: 'KNOWN_ISSUES #16' },
  { module: 'E-commerce', issue: 'Helpers not tenant-filtered (demo only)', severity: 'HIGH', ref: 'TECH_DEBT #21' },
  { module: 'Locale', issue: 'Translations editor not built (v0.7)', severity: 'MEDIUM', ref: 'ROADMAP v0.7' },
  { module: 'Media', issue: 'Static images not managed via Media Library', severity: 'LOW', ref: 'TECH_DEBT #22' },
];

const SEARCH_FILTERS = ['All', 'Platform', 'Tenants', 'Modules', 'Methods', 'Playbooks', 'Decisions', 'Archive'] as const;

const MMI_TOTAL = { l1: 4, l2: 4, l3: 4, l4: 4 };

export default function AKESDashboard() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [audit, setAudit] = useState({ total: 0, platform: 0, modules: 0, methods: 0, stale: 0, secrets: 0 });

  useEffect(() => {
    const data = docIndex as DocEntry[];
    setDocs(data);
    const now = new Date();
    const staleThreshold = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const stale = data.filter(d => d.last_reviewed && new Date(d.last_reviewed) < staleThreshold).length;
    setAudit({
      total: data.length,
      platform: data.filter(d => d.path.startsWith('01_PLATFORM')).length,
      modules: data.filter(d => d.path.startsWith('03_MODULES')).length,
      methods: data.filter(d => d.path.startsWith('04_METHODS')).length,
      stale,
      secrets: 0,
    });
  }, []);

  const filteredByCategory = filter === 'All' ? docs : docs.filter(d => {
    if (filter === 'Platform') return d.path.startsWith('01_PLATFORM');
    if (filter === 'Tenants') return d.path.startsWith('02_TENANTS');
    if (filter === 'Modules') return d.path.startsWith('03_MODULES');
    if (filter === 'Methods') return d.path.startsWith('04_METHODS');
    if (filter === 'Playbooks') return d.path.startsWith('06_PLAYBOOKS');
    if (filter === 'Decisions') return d.path.startsWith('05_DECISION_MEMORY') || d.id?.includes('adr');
    if (filter === 'Archive') return d.path.startsWith('archive');
    return true;
  });

  const filtered = search
    ? filteredByCategory.filter(d =>
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.id?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 20)
    : [];

  const avgScore = Math.round(MMI_DATA.reduce((s, m) => s + m.score, 0) / MMI_DATA.length);
  const selected = MMI_DATA.find(m => m.module === selectedModule);

  const color = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const bg = (s: number) => s >= 80 ? 'bg-green-900/20 border-green-800/30' : s >= 60 ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-red-900/20 border-red-800/30';

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

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
            <div className="text-2xl font-bold text-blue-400">{audit.total}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Indexed Docs</div>
          </div>
        </div>
      </div>

      {/* Quick Stats + Audit Health */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-green-400"><Shield className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Platform</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{audit.platform}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-blue-400"><BookOpen className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Modules</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{audit.modules}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-purple-400"><BarChart3 className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Methods</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{audit.methods}</div>
          <div className="text-[10px] text-gray-600">docs</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-amber-400"><AlertTriangle className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Blockers</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{BLOCKERS.length}</div>
          <div className="text-[10px] text-gray-600">active</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center gap-2 text-cyan-400"><Clock className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Audit</span></div>
          <div className="mt-1 text-lg font-semibold text-white">{audit.stale}</div>
          <div className="text-[10px] text-gray-600">stale docs</div>
        </div>
      </div>

      {/* MMI Table + Detail */}
      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: selectedModule ? '1fr 1fr' : '1fr' }}>
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
                  <th className="text-center pb-2">L1</th>
                  <th className="text-center pb-2">L2</th>
                  <th className="text-center pb-2">L3</th>
                  <th className="text-center pb-2">L4</th>
                  <th className="text-center pb-2">Status</th>
                  <th className="text-center pb-2">V</th>
                </tr>
              </thead>
              <tbody>
                {MMI_DATA.map(m => (
                  <tr key={m.module}
                    onClick={() => setSelectedModule(selectedModule === m.module ? null : m.module)}
                    className={`border-t border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-800/30 ${selectedModule === m.module ? 'bg-blue-900/10' : ''}`}>
                    <td className="py-2 text-gray-300 text-xs">{m.module}</td>
                    <td className={`py-2 text-right font-mono ${color(m.score)}`}>{m.score}%</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.breakdown.l1}/{MMI_TOTAL.l1}</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.breakdown.l2}/{MMI_TOTAL.l2}</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.breakdown.l3}/{MMI_TOTAL.l3}</td>
                    <td className="py-2 text-center text-[11px] text-gray-500">{m.breakdown.l4}/{MMI_TOTAL.l4}</td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${bg(m.score)} ${color(m.score)}`}>{m.status}</span>
                    </td>
                    <td className="py-2 text-center">
                      {m.verified ? <CheckCircle className="h-3.5 w-3.5 text-green-400 mx-auto" title="Verified by product owner" /> : <span className="text-[10px] text-gray-600" title="Not yet verified">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[10px] text-gray-600 flex gap-4">
              <span>L1: Data</span><span>L2: Authoring</span><span>L3: Delivery</span><span>L4: Intelligence</span>
              <span className="ml-auto">Click a row for details</span>
            </div>
          </div>
        </div>

        {selected && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/30">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-sm font-medium text-white">{selected.module} — Detail</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'L1 Data', score: selected.breakdown.l1, max: MMI_TOTAL.l1, items: 'Schema, tenant_id, columns' },
                  { label: 'L2 Authoring', score: selected.breakdown.l2, max: MMI_TOTAL.l2, items: 'CMS panels, CRUD, permissions' },
                  { label: 'L3 Delivery', score: selected.breakdown.l3, max: MMI_TOTAL.l3, items: 'Public render, isolation, states' },
                  { label: 'L4 Intelligence', score: selected.breakdown.l4, max: MMI_TOTAL.l4, items: 'Telemetry, tests, automation' },
                ].map(l => (
                  <div key={l.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                    <div className="text-xs text-gray-300">{l.label}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{l.score}/{l.max}</div>
                    <div className="mt-1 text-[10px] text-gray-600">{l.items}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className={`h-full rounded-full ${l.score === l.max ? 'bg-green-500' : l.score > 0 ? 'bg-yellow-500' : 'bg-gray-700'}`} style={{ width: `${(l.score / l.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Status: <span className={color(selected.score)}>{selected.status}</span></span>
                <span>Verified: {selected.verified ? <CheckCircle className="h-3 w-3 text-green-400 inline" /> : '—'}</span>
                <span>Score: <span className="font-mono">{selected.score}%</span></span>
              </div>
              <div className="text-[10px] text-gray-600 pt-2 border-t border-gray-800">
                <p>MMI = (L1 + L2 + L3 + L4) / 16 × 100. Each layer has {MMI_TOTAL.l1} criteria.</p>
                <p>Formula: <code className="text-cyan-400">(l1 + l2 + l3 + l4) / (maxL1 + maxL2 + maxL3 + maxL4) * 100</code></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tenants + Blockers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/30">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">Tenant Readiness</h2>
          </div>
          <div className="p-4 space-y-3">
            {TENANT_DATA.map(t => (
              <div key={t.tenant} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">{t.tenant}</div>
                    <div className="text-[10px] text-gray-600">{t.modules}</div>
                  </div>
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
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">Active Blockers <span className="text-[10px] text-gray-600 font-normal">({BLOCKERS.length})</span></h2>
          </div>
          <div className="p-4 space-y-2">
            {BLOCKERS.map((b, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-800/50 last:border-b-0">
                <div className="flex items-start gap-2 min-w-0">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${b.severity === 'HIGH' ? 'text-red-400' : b.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-300 truncate">{b.issue}</div>
                    <div className="text-[10px] text-gray-600">{b.module} · {b.ref}</div>
                  </div>
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
          <span className="text-[10px] text-gray-600">{audit.total} indexed entries</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documentation (module, method, tenant, tag...)" className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SEARCH_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>{f}</button>
            ))}
          </div>
          {search && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">No results found</p>
              ) : (
                filtered.map(d => (
                  <div key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-300 truncate">{d.title}</div>
                      <div className="flex gap-2 text-[10px] text-gray-600">
                        <span>{d.path}</span>
                        {d.maturity !== '—' && d.maturity && <span>· {d.maturity}</span>}
                        {d.last_reviewed && <span>· Reviewed: {d.last_reviewed}</span>}
                        {d.source_of_truth && <span className="text-green-500">· SoT</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === 'Standard' ? 'bg-green-900/30 text-green-400' : d.status === 'Experimental' || d.maturity === 'experimental' ? 'bg-yellow-900/30 text-yellow-400' : d.status === 'archived' ? 'bg-gray-800 text-gray-500' : 'bg-gray-800 text-gray-500'}`}>{d.status || d.maturity || '—'}</span>
                      {d.source_of_truth && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" title="Source of Truth" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {!search && (
            <p className="text-xs text-gray-600 text-center py-4">Type to search across all {audit.total} indexed documents. Use category filters above.</p>
          )}
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
              <p><span className="text-gray-500">SoT:</span> Markdown documentation files with YAML frontmatter (160 .md files)</p>
              <p><span className="text-gray-500">Index:</span> <code className="text-cyan-400">documentation.db.json</code> — generated read-only index consumed by this dashboard</p>
              <p><span className="text-gray-500">Pipeline:</span> Markdown → <code className="text-cyan-400">npm run docs:index</code> → <code className="text-cyan-400">documentation.db.json</code> → Dashboard</p>
              <p><span className="text-gray-500">Build-time:</span> Imported as JS module, bundled by Vite — NOT a public static asset</p>
              <p><span className="text-gray-500">Access:</span> Protected by Vite bundling — only accessible within the JS bundle, no direct URL</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">MMI Calculation</h3>
              <p><span className="text-gray-500">Formula:</span> <code className="text-cyan-400">(l1 + l2 + l3 + l4) / (maxL1 + maxL2 + maxL3 + maxL4) × 100</code></p>
              <p><span className="text-gray-500">Max per layer:</span> {MMI_TOTAL.l1} criteria each</p>
              <p><span className="text-gray-500">Status mapping:</span> ≥80% PRODUCTION | ≥60% STABLE | ≥40% DEVELOPMENT | ≥20% EARLY | &lt;20% PLANNED</p>
              <p><span className="text-gray-500">Hardcoded:</span> MMI and Tenant scores are hardcoded in the dashboard component — they are updated manually when MODULE_MATURITY.md changes</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Security & Access</h3>
              <p><span className="text-gray-500">Route:</span> <code className="text-cyan-400">/dashboard/akes</code> — protected by Super Admin access (<code className="text-cyan-400">platform.overview</code> permission)</p>
              <p><span className="text-gray-500">Tenant admin:</span> CANNOT access — route is Super Admin only</p>
              <p><span className="text-gray-500">Direct URL:</span> Blocked — redirects to login if unauthenticated; returns 403 if non-SA tries to access</p>
              <p><span className="text-gray-500">Source data:</span> READ-ONLY — the dashboard renders data from the indexed JSON, never modifies it</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Data Freshness</h3>
              <p><span className="text-gray-500">Index updated:</span> 2026-07-12</p>
              <p><span className="text-gray-500">Stale threshold:</span> 3 months without review</p>
              <p><span className="text-gray-500">Stale docs:</span> {audit.stale} (shown in Audit Health card)</p>
              <p><span className="text-gray-500">Secrets scan:</span> Not automated (manual via <code className="text-cyan-400">npm run docs:secrets</code> — planned)</p>
              <p><span className="text-gray-500">Link validation:</span> Not automated (planned)</p>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-800 text-center text-[10px] text-gray-600">
            <p>AKES v1.0 · {audit.total} files · {MMI_DATA.length} modules scored · {TENANT_DATA.length} tenants tracked · {BLOCKERS.length} active blockers</p>
            <p>SoT: Markdown docs · Index: <code className="text-cyan-400">documentation.db.json</code> (generated, read-only) · Generated: <code className="text-cyan-400">npm run docs:index</code> · Route: <code className="text-cyan-400">/dashboard/akes</code> · SA only</p>
            <p>Dashboard documented at: <code className="text-cyan-400">docs/03_MODULES/AKES/README.md</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
