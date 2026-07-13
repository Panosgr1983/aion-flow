import { useMemo } from 'react';
import { TrendingUp, Layers, Building2, FileText, AlertTriangle, Lightbulb, CheckCircle, Clock, GitCommit, BrainCircuit, BarChart3, Shield, BookOpen, Zap } from 'lucide-react';
import docIndex from '../assets/documentation.db.json';

interface RelationshipMap {
  by_module: Record<string, { uses?: string[]; used_by?: string[] }>;
  by_tenant: Record<string, string[]>;
  by_method: Record<string, string[]>;
  reusable_for: Record<string, string[]>;
}

const TENANT_LABELS: Record<string, string> = {
  'kolokotronis': 'Κολοκοτρώνης',
  'ktima-kareli': 'Κτήμα Καρέλη',
  'aion-flow': 'AION Flow',
};

const DEBT_ITEMS = [
  { label: 'CRM tenant isolation', severity: 'CRITICAL', module: 'CRM' },
  { label: 'E-commerce tenant isolation', severity: 'CRITICAL', module: 'E-commerce' },
  { label: 'Translations editor (v0.7)', severity: 'HIGH', module: 'Locale' },
  { label: 'Static images → Media Library', severity: 'MEDIUM', module: 'Media' },
  { label: 'Blockers hardcoded in AKES', severity: 'LOW', module: 'AKES' },
];

export default function PlatformEvolution() {
  const meta = docIndex._meta as any;
  const docs = (docIndex.entries || docIndex) as any[];
  const relationships = meta.relationships as RelationshipMap | undefined;

  const moduleReuse = useMemo(() => {
    if (!relationships) return [];
    return Object.entries(relationships.by_module)
      .map(([id, rel]) => ({
        id,
        tenants: (rel as any).used_by?.length || 0,
        deps: (rel as any).uses?.length || 0,
        score: meta.mmi_modules?.find((m: any) => m.id === id)?.score || 0,
        status: meta.mmi_modules?.find((m: any) => m.id === id)?.status || '—',
      }))
      .sort((a, b) => b.tenants - a.tenants);
  }, [relationships, meta]);

  const tenantData = useMemo(() => {
    if (!relationships) return [];
    return Object.entries(relationships.by_tenant).map(([id, modules]) => ({
      id, label: TENANT_LABELS[id] || id, modules: modules.length,
      names: modules.join(', '),
    }));
  }, [relationships]);

  const methodStats = useMemo(() => ({
    validated: docs.filter((d: any) => d.path?.startsWith('04_METHODS') && d.maturity === 'standard').length,
    experimental: docs.filter((d: any) => d.path?.startsWith('04_METHODS') && d.maturity === 'experimental').length,
    total: docs.filter((d: any) => d.path?.startsWith('04_METHODS')).length,
  }), [docs]);

  const docHealth = {
    total: meta.docs_count || 0,
    stale: meta.stale_docs_count || 0,
    platform: docs.filter((d: any) => d.path?.startsWith('01_PLATFORM')).length,
    modules: docs.filter((d: any) => d.path?.startsWith('03_MODULES')).length,
    methods: docs.filter((d: any) => d.path?.startsWith('04_METHODS')).length,
    tenants: docs.filter((d: any) => d.path?.startsWith('02_TENANTS')).length,
  };

  const debtBySeverity = {
    critical: DEBT_ITEMS.filter(d => d.severity === 'CRITICAL').length,
    high: DEBT_ITEMS.filter(d => d.severity === 'HIGH').length,
    medium: DEBT_ITEMS.filter(d => d.severity === 'MEDIUM').length,
    low: DEBT_ITEMS.filter(d => d.severity === 'LOW').length,
  };

  const color = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : s >= 40 ? 'text-orange-400' : 'text-red-400';
  const bg = (s: number) => s >= 80 ? 'bg-green-900/20 border-green-800/30' : s >= 60 ? 'bg-yellow-900/20 border-yellow-800/30' : s >= 40 ? 'bg-orange-900/20 border-orange-800/30' : 'bg-red-900/20 border-red-800/30';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">Platform Evolution</h1>
            <p className="text-sm text-gray-500">Engineering efficiency &amp; platform growth — stabilization phase</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <GitCommit className="h-3 w-3" /> {meta.git_commit?.slice(0, 7)}
          <span>·</span>
          {meta.generated_at?.slice(0, 10)}
        </div>
      </div>

      {/* Efficiency Score */}
      {(() => {
        const reuseRate = moduleReuse.length > 0 ? Math.round(moduleReuse.filter(m => m.tenants > 0).length / moduleReuse.length * 100) : 0;
        const docCoverage = docHealth.total > 0 ? Math.round((docHealth.total - docHealth.stale) / docHealth.total * 100) : 0;
        const methodRate = methodStats.total > 0 ? Math.round(methodStats.validated / methodStats.total * 100) : 0;
        const efficiency = Math.round((reuseRate * 0.4 + docCoverage * 0.3 + methodRate * 0.3));

        return (
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Engineering Efficiency</div>
                <div className={`text-4xl font-bold ${color(efficiency)}`}>{efficiency}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-600">Reuse Rate {reuseRate}% (40%)</div>
                <div className="text-[10px] text-gray-600">Doc Health {docCoverage}% (30%)</div>
                <div className="text-[10px] text-gray-600">Method Validation {methodRate}% (30%)</div>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${efficiency >= 80 ? 'bg-green-500' : efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${efficiency}%` }} />
            </div>
          </div>
        );
      })()}

      {/* 6-Panel Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* 1. Reuse */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h2 className="text-xs font-medium text-white">Module Reuse</h2>
          </div>
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {moduleReuse.map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-300 capitalize truncate">{m.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${bg(m.score)} ${color(m.score)}`}>{m.score}%</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.max(m.tenants, 1) }).map((_, i) => (
                      <div key={i} className={`w-2 h-4 rounded-sm ${i < m.tenants ? 'bg-blue-500' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 w-4 text-right">{m.tenants}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tenant Growth */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-medium text-white">Tenant Growth</h2>
          </div>
          <div className="p-4 space-y-3">
            {tenantData.map(t => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800/50">
                <div>
                  <div className="text-xs text-gray-300">{t.label}</div>
                  <div className="text-[10px] text-gray-600">{t.names}</div>
                </div>
                <span className="text-xs text-gray-500">{t.modules} modules</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-800/50 text-xs text-gray-600 text-center">
              {tenantData.length} tenants · Average setup: measuring...
            </div>
          </div>
        </div>

        {/* 3. Engineering Health */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <h2 className="text-xs font-medium text-white">Engineering Health</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Validated', value: methodStats.validated, color: 'text-green-400', pct: methodStats.total > 0 ? Math.round(methodStats.validated / methodStats.total * 100) : 0 },
              { label: 'Experimental', value: methodStats.experimental, color: 'text-yellow-400', pct: methodStats.total > 0 ? Math.round(methodStats.experimental / methodStats.total * 100) : 0 },
              { label: 'Total', value: methodStats.total, color: 'text-gray-300', pct: 100 },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{s.label}</span>
                  <span className={s.color}>{s.value}</span>
                </div>
                {s.pct > 0 && (
                  <div className="mt-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div className={`h-full rounded-full ${s.label === 'Validated' ? 'bg-green-500' : s.label === 'Experimental' ? 'bg-yellow-500' : 'bg-gray-600'}`} style={{ width: `${s.pct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Documentation Health */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-medium text-white">Documentation Health</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Total docs', value: docHealth.total, pct: 100 },
              { label: 'Platform', value: docHealth.platform },
              { label: 'Modules', value: docHealth.modules },
              { label: 'Methods', value: docHealth.methods },
              { label: 'Tenants', value: docHealth.tenants },
              { label: 'Stale', value: docHealth.stale, color: docHealth.stale > 0 ? 'text-red-400' : 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{s.label}</span>
                <span className={(s as any).color || 'text-gray-300'}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Technical Debt */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-medium text-white">Technical Debt</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Critical', value: debtBySeverity.critical, color: 'text-red-400' },
              { label: 'High', value: debtBySeverity.high, color: 'text-orange-400' },
              { label: 'Medium', value: debtBySeverity.medium, color: 'text-yellow-400' },
              { label: 'Low', value: debtBySeverity.low, color: 'text-gray-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{s.label}</span>
                <span className={s.color}>{s.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-800/50 text-[10px] text-gray-600">
              {DEBT_ITEMS.map(d => (
                <div key={d.label} className="flex items-start gap-1.5 py-1">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${d.severity === 'CRITICAL' ? 'bg-red-500' : d.severity === 'HIGH' ? 'bg-orange-500' : d.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  <span>{d.label} <span className="text-gray-600">({d.module})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Reuse Opportunities */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 col-span-1">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <h2 className="text-xs font-medium text-white">Reuse Opportunities</h2>
          </div>
          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {relationships?.reusable_for && Object.entries(relationships.reusable_for)
              .sort(([, a], [, b]) => b.length - a.length)
              .slice(0, 10)
              .map(([industry, modules]) => (
                <div key={industry} className="px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{industry}</span>
                    <span className="text-gray-500">{modules.length} modules</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {modules.map(m => {
                      const mmi = meta.mmi_modules?.find((x: any) => x.id === m);
                      return (
                        <span key={m} className={`text-[10px] px-1.5 py-0.5 rounded ${mmi ? bg(mmi.score) : 'bg-gray-800'} ${mmi ? color(mmi.score) : 'text-gray-500'}`}>
                          {m}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
        <h2 className="text-xs font-medium text-white mb-3 flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-emerald-400" /> Key Objectives — Stabilization Phase</h2>
        <div className="grid grid-cols-4 gap-4 text-xs">
          {[
            { label: 'Time to New Tenant', current: '~35h', target: '<12h', unit: 'hours' },
            { label: 'Reuse Rate', current: '—', target: '>80%', unit: 'per tenant' },
            { label: 'Engineering Efficiency', current: `${Math.round(
              (moduleReuse.filter(m => m.tenants > 0).length / Math.max(moduleReuse.length, 1)) * 40 +
              ((docHealth.total - docHealth.stale) / Math.max(docHealth.total, 1)) * 30 +
              (methodStats.validated / Math.max(methodStats.total, 1)) * 30
            )}%`, target: '>85%', unit: 'composite' },
            { label: 'Tenants', current: `${tenantData.length}`, target: '10', unit: 'by Q1 2027' },
          ].map(kpi => (
            <div key={kpi.label} className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-800/50">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{kpi.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm text-gray-300">{kpi.current}</span>
                <span className="text-[10px] text-gray-600">→</span>
                <span className="text-sm text-emerald-400">{kpi.target}</span>
              </div>
              <div className="text-[10px] text-gray-600">{kpi.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
