import { useEffect, useState, useCallback, useMemo } from 'react';
import { History as HistoryIcon, RotateCcw, Upload, Trash2, ChevronDown, ChevronRight, AlertTriangle, Search, Download, User, Filter, Calendar, Building2 } from 'lucide-react';
import type { ContentHistory, ContentBackup } from '../../types/supabase';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { restoreHelper } from '../../lib/dataHelpers';
import { useTenantContext } from '../../lib/TenantContext';
import { trackEvent } from '../../lib/analytics';

const TABLE_LABELS: Record<string, string> = {
  services: 'Υπηρεσίες', blog_posts: 'Blog', testimonials: 'Κριτικές',
  credentials: 'Πιστοποιήσεις', core_values: 'Αξίες', site_settings: 'Ρυθμίσεις',
};

const TABLE_ICONS: Record<string, string> = {
  services: '📋', blog_posts: '📝', testimonials: '💬',
  credentials: '🎓', core_values: '💎', site_settings: '⚙️',
};

const OPERATION_STYLES: Record<string, { label: string; bg: string; border: string; dot: string }> = {
  create:  { label: 'CREATE',  bg: 'bg-emerald-500/10', border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  update:  { label: 'UPDATE',  bg: 'bg-blue-500/10',    border: 'border-l-blue-500',    dot: 'bg-blue-500' },
  restore: { label: 'RESTORE', bg: 'bg-amber-500/10',   border: 'border-l-amber-500',   dot: 'bg-amber-500' },
  delete:  { label: 'DELETE',  bg: 'bg-red-500/10',     border: 'border-l-red-500',     dot: 'bg-red-500' },
  backup:  { label: 'BACKUP',  bg: 'bg-purple-500/10',  border: 'border-l-purple-500',  dot: 'bg-purple-500' },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'μόλις τώρα';
  if (mins < 60) return `πριν ${mins} λεπτά`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `πριν ${hours} ώρες`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `πριν ${days} μέρες`;
  return new Date(date).toLocaleDateString('el-GR');
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('el-GR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditDashboard() {
  const live = isSupabaseAvailable();
  const { selectedTenantId } = useTenantContext();
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [entries, setEntries] = useState<ContentHistory[]>([]);
  const [backups, setBackups] = useState<ContentBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revertTarget, setRevertTarget] = useState<ContentHistory | null>(null);
  const [reverting, setReverting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState('');

  const activeTenantId = selectedTenantId && selectedTenantId !== '00000000-0000-0000-0000-000000000001'
    ? selectedTenantId
    : tenantFilter !== 'all' ? tenantFilter : null;

  const loadTenants = useCallback(async () => {
    if (!live) return;
    const { data } = await supabase.from('tenants').select('id, name').order('name');
    if (data) setTenants(data);
  }, [live]);

  const load = useCallback(async () => {
    if (!live) { setLoading(false); return; }
    try {
      let query = supabase.from('content_history').select('*').order('created_at', { ascending: false }).limit(500);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data: h } = await query;
      if (h) setEntries(h);
    } catch {}
    try {
      let query = supabase.from('content_backups').select('*').order('created_at', { ascending: false }).limit(50);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data: b } = await query;
      if (b) setBackups(b);
    } catch {}
    setLoading(false);
  }, [live, activeTenantId]);

  useEffect(() => { loadTenants(); }, [loadTenants]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => { load(); }, [load]);

  const uniqueUsers = useMemo(() => [...new Set(entries.map(e => e.user_id).filter(Boolean))], [entries]);
  const uniqueTables = useMemo(() => [...new Set(entries.map(e => e.table_name).filter(Boolean))], [entries]);

  const filtered = useMemo(() => entries.filter(e => {
    if (tableFilter !== 'all' && e.table_name !== tableFilter) return false;
    if (userFilter !== 'all' && e.user_id !== userFilter) return false;
    if (operationFilter !== 'all' && e.operation !== operationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(e.summary?.toLowerCase().includes(q) || e.entity_name?.toLowerCase().includes(q) || e.user_id?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [entries, tableFilter, userFilter, operationFilter, search]);

  const handleRevert = async () => {
    if (!revertTarget) return;
    setReverting(true); setError('');
    try {
      await restoreHelper.restore(revertTarget);
      setRevertTarget(null);
      await load();
    } catch (e: any) { setError(e?.message || 'Σφάλμα'); }
    setReverting(false);
  };

  const handleBackup = async () => {
    setBackingUp(true); setError('');
    const backupTenantId = activeTenantId || '00000000-0000-0000-0000-000000000001';
    try {
      const tables = ['services', 'blog_posts', 'testimonials', 'credentials', 'core_values', 'site_settings'];
      const snapshot: Record<string, unknown> = {};
      let totalBytes = 0;
      for (const t of tables) {
        let query = supabase.from(t).select('*');
        if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
        const { data } = await query;
        snapshot[t] = data || [];
        totalBytes += new Blob([JSON.stringify(data || [])]).size;
      }
      const dateStr = new Date().toISOString().slice(0, 10);
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('content_backups').insert({
        tenant_id: backupTenantId,
        name: `Backup ${dateStr}`, snapshot, snapshot_version: 1,
        size_bytes: totalBytes, user_id: user?.id || user?.email || null,
      });
      trackEvent('platform.backup_created', { size_mb: Math.round(totalBytes / (1024 * 1024) * 100) / 100, status: 'success' }).catch(() => {});
      await load();
    } catch (e: any) { setError(e?.message || 'Σφάλμα backup'); }
    setBackingUp(false);
  };

  const handleCleanup = async () => {
    setCleaning(true); setError('');
    try {
      await supabase.from('content_history').delete().lt('expired_at', new Date().toISOString());
      await load();
    } catch (e: any) { setError(e?.message || 'Σφάλμα εκκαθάρισης'); }
    setCleaning(false);
  };

  const exportCSV = () => {
    const headers = ['Ημερομηνία', 'Τύπος', 'Πίνακας', 'Οντότητα', 'Χρήστης', 'Περίληψη', 'Αλλαγμένα Πεδία'];
    const rows = filtered.map(e => [
      formatDate(e.created_at),
      e.operation,
      e.table_name || '',
      e.entity_name || '',
      e.user_id || '',
      `"${(e.summary || '').replace(/"/g, '""')}"`,
      (e.changed_fields || []).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!live) return <div className="flex items-center justify-center h-64 text-gray-500"><p>Το Ιστορικό είναι διαθέσιμο μόνο σε live mode</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Audit Dashboard</h2>
          <p className="text-sm text-gray-500">{filtered.length} από {entries.length} καταχωρήσεις · {backups.length} backups</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-gray-500" />
            <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)} className="input text-xs py-1.5 w-auto">
              <option value="all">Όλοι οι tenants</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-ghost text-xs px-3 py-1.5">
            <Download size={14} /> CSV
          </button>
          <button onClick={handleBackup} disabled={backingUp || !activeTenantId} className="btn-primary text-xs" title={!activeTenantId ? 'Επίλεξε tenant για backup' : ''}>
            <Upload size={14} /> {backingUp ? 'Δημιουργία...' : 'Backup'}
          </button>
          <button onClick={handleCleanup} disabled={cleaning} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-xs font-medium">
            <Trash2 size={14} /> {cleaning ? 'Εκκαθάριση...' : 'Εκκαθάριση'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* FILTERS */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Filter size={12} /> Φίλτρα</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-7 text-xs" />
          </div>
          <select value={tableFilter} onChange={e => setTableFilter(e.target.value)} className="input text-xs">
            <option value="all">Όλοι οι πίνακες</option>
            {uniqueTables.map(t => <option key={t} value={t}>{TABLE_LABELS[t] || t}</option>)}
          </select>
          <select value={operationFilter} onChange={e => setOperationFilter(e.target.value)} className="input text-xs">
            <option value="all">Όλες οι ενέργειες</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="restore">Restore</option>
          </select>
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="input text-xs">
            <option value="all">Όλοι οι χρήστες</option>
            {uniqueUsers.map(u => <option key={u} value={u!}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">Δεν βρέθηκαν καταχωρήσεις</div>
        )}
        {filtered.map(entry => {
          const style = OPERATION_STYLES[entry.operation] || OPERATION_STYLES.update;
          return (
            <div key={entry.id} className={`card border-l-4 ${style.border} ${style.bg} transition-all duration-200`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} text-white`}>{style.label}</span>
                      {entry.table_name && TABLE_ICONS[entry.table_name] && <span>{TABLE_ICONS[entry.table_name]}</span>}
                      {entry.table_name && TABLE_LABELS[entry.table_name] && <span className="text-xs text-gray-500">{TABLE_LABELS[entry.table_name]}</span>}
                    </div>
                    <p className="text-sm font-medium mt-1">{entry.summary}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span title={formatDate(entry.created_at)}>{timeAgo(entry.created_at)}</span>
                      {entry.user_id && <span className="flex items-center gap-1"><User size={10} /> {entry.user_id}</span>}
                      {entry.entity_name && <span className="text-gray-600">{entry.entity_name}</span>}
                    </div>
                    {entry.changed_fields && entry.changed_fields.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.changed_fields.map(f => (
                          <span key={f} className="text-[11px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {entry.operation === 'update' && (
                    <button onClick={() => setRevertTarget(entry)} className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Επαναφορά">
                      <RotateCcw size={14} />
                    </button>
                  )}
                  {entry.snapshot_before && entry.operation !== 'delete' && (
                    <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                      {expandedId === entry.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {expandedId === entry.id && entry.snapshot_before && entry.snapshot_after && (
                <div className="mt-4 pt-3 border-t border-gray-800/50 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-1 pr-4">Πεδίο</th>
                        <th className="text-left py-1 pr-4">Πριν</th>
                        <th className="text-left py-1">Μετά</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(entry.snapshot_after as object)
                        .filter(k => !['id', 'tenant_id', 'created_at', 'updated_at'].includes(k) && JSON.stringify((entry.snapshot_before as any)[k]) !== JSON.stringify((entry.snapshot_after as any)[k]))
                        .map(k => (
                          <tr key={k} className="border-t border-gray-800/30">
                            <td className="py-1.5 pr-4 font-medium text-gray-300 align-top whitespace-nowrap">{k}</td>
                            <td className="py-1.5 pr-4 text-red-400 align-top break-all max-w-[200px]">{JSON.stringify((entry.snapshot_before as any)[k], null, 1)}</td>
                            <td className="py-1.5 text-green-400 align-top break-all max-w-[200px]">{JSON.stringify((entry.snapshot_after as any)[k], null, 1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BACKUPS */}
      {backups.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3">Backup Αρχεία</h3>
          <div className="space-y-2">
            {backups.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-xl">
                <div>
                  <p className="text-sm">{b.name || `Backup ${new Date(b.created_at).toLocaleDateString('el-GR')}`}</p>
                  <p className="text-xs text-gray-500">{formatDate(b.created_at)}{b.size_bytes ? ` — ${(b.size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}</p>
                </div>
                <span className="text-xs text-gray-500">{b.user_id ? `v${b.snapshot_version} — ${b.user_id}` : `v${b.snapshot_version}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVERT MODAL */}
      {revertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRevertTarget(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center"><AlertTriangle size={20} className="text-amber-400" /></div>
              <h3 className="text-lg font-semibold">Επαναφορά</h3>
            </div>
            <p className="text-sm text-gray-400 mb-2">Επαναφορά της <strong>{revertTarget.entity_name || 'εγγραφής'}</strong>;</p>
            <p className="text-xs text-gray-600 mb-4">Η τρέχουσα έκδοση θα αντικατασταθεί. Η ενέργεια θα καταγραφεί.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRevertTarget(null)} className="btn-secondary">Ακύρωση</button>
              <button onClick={handleRevert} disabled={reverting} className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors text-sm font-medium">
                {reverting ? 'Επαναφορά...' : 'Επαναφορά'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
