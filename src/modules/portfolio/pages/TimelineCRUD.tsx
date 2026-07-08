import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import type { CareerTimeline } from '../types/artist';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const CATEGORY_OPTIONS = [
  { value: 'film', label: 'Κινηματογράφος' },
  { value: 'tv', label: 'Τηλεόραση' },
  { value: 'theatre', label: 'Θέατρο' },
  { value: 'award', label: 'Βραβείο' },
  { value: 'personal', label: 'Προσωπικό' },
  { value: 'other', label: 'Άλλο' },
];

const MONTH_OPTIONS = [
  { value: 0, label: '—' },
  { value: 1, label: 'Ιανουάριος' }, { value: 2, label: 'Φεβρουάριος' }, { value: 3, label: 'Μάρτιος' },
  { value: 4, label: 'Απρίλιος' }, { value: 5, label: 'Μάιος' }, { value: 6, label: 'Ιούνιος' },
  { value: 7, label: 'Ιούλιος' }, { value: 8, label: 'Αύγουστος' }, { value: 9, label: 'Σεπτέμβριος' },
  { value: 10, label: 'Οκτώβριος' }, { value: 11, label: 'Νοέμβριος' }, { value: 12, label: 'Δεκέμβριος' },
];

const EMPTY = { year: new Date().getFullYear(), month: 0, title: '', title_en: '', description: '', category: 'other', media_url: '', sort_order: 0, status: 'draft' as string, verified: false };

export default function TimelineCRUD() {
  const { effectiveTenantId } = useTenant();
  const [entries, setEntries] = useState<CareerTimeline[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(supabase.from('career_timelines').select('*').order('sort_order', { ascending: true }).order('year', { ascending: false }), effectiveTenantId);
    setEntries(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (entries.length + 1) * 10, year: new Date().getFullYear() }); setEditing('new'); setError(null); };
  const startEdit = (e: CareerTimeline) => { setForm({ year: e.year, month: e.month || 0, title: e.title, title_en: e.title_en || '', description: e.description || '', category: e.category || 'other', media_url: e.media_url || '', sort_order: e.sort_order, status: e.status || 'draft', verified: e.verified || false }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός'; if (form.year < 1900 || form.year > 2030) return 'Το έτος πρέπει να είναι μεταξύ 1900-2030'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, year: form.year, month: form.month || null, title: form.title.trim(), title_en: form.title_en.trim() || null, description: form.description || null, category: form.category, media_url: form.media_url.trim() || null, sort_order: form.sort_order || 0, status: form.status || 'draft', verified: form.verified || false, icon: form.category };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await supabase.from('career_timelines').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'career_timelines', record_id: c.id, entity_name: c.title, operation: 'create', snapshot_before: null, snapshot_after: { title: c.title }, summary: `Δημιουργία γεγονότος: ${c.title}`, user_id: user?.id || null });
      } else {
        const before = entries.find(e => e.id === editing);
        const { data: u, error: ue } = await supabase.from('career_timelines').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'career_timelines', record_id: editing, entity_name: u.title, operation: 'update', snapshot_before: { title: before?.title }, snapshot_after: { title: u.title }, summary: `Ενημέρωση γεγονότος: ${u.title}`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή γεγονότος; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = entries.find(e => e.id === id);
    await supabase.from('career_timelines').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'career_timelines', record_id: id, entity_name: entry?.title, operation: 'delete', snapshot_before: { title: entry?.title }, snapshot_after: null, summary: `Διαγραφή γεγονότος: ${entry?.title}`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  const categoryColor = (cat: string) => {
    const colors: Record<string, string> = { film: 'bg-blue-900/30 text-blue-400', tv: 'bg-purple-900/30 text-purple-400', theatre: 'bg-amber-900/30 text-amber-400', award: 'bg-green-900/30 text-green-400', personal: 'bg-pink-900/30 text-pink-400' };
    return colors[cat] || 'bg-gray-800 text-gray-500';
  };

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέο γεγονός' : 'Επεξεργασία γεγονότος'}</h2>
        <div className="flex gap-2">
          <button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">Ακύρωση</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατηγορία</label>
            <select value={form.category} onChange={e => updateForm('category', e.target.value)} className={inputCls}>
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={form.verified} onChange={e => updateForm('verified', e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" /> Επαληθευμένο</label>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-gray-500">Προεπισκόπηση</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-400 font-mono">{form.year}{form.month ? `/${String(form.month).padStart(2, '0')}` : ''}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColor(form.category)}`}>{CATEGORY_OPTIONS.find(o => o.value === form.category)?.label}</span>
            </div>
            <p className="text-sm text-white">{form.title || '(τίτλος)'}</p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Στοιχεία</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Τίτλος *</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} placeholder="π.χ. Κινηματογραφικό ντεμπούτο" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Τίτλος (Αγγλικά)</label><input value={form.title_en} onChange={e => updateForm('title_en', e.target.value)} className={inputCls} placeholder="π.χ. Film debut" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Έτος *</label><input type="number" value={form.year} onChange={e => updateForm('year', parseInt(e.target.value) || new Date().getFullYear())} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Μήνας</label><select value={form.month} onChange={e => updateForm('month', parseInt(e.target.value))} className={inputCls}>{MONTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Media URL (προαιρετικό)</label><input value={form.media_url} onChange={e => updateForm('media_url', e.target.value)} className={inputCls} placeholder="https://..." /></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περιγραφή</h3>
            <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className={inputCls + ' resize-none'} placeholder="Περιγραφή γεγονότος..." />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Χρονολόγιο</h2><p className="text-sm text-gray-500">Διαχείριση γεγονότων χρονολογίου</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"><RefreshCw size={14} /> Ανανέωση</button>
          <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"><Plus size={14} /> Νέο γεγονός</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένα γεγονότα.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400 hover:text-blue-300">+ Προσθέστε το πρώτο</button>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={16} className="text-gray-700 shrink-0 cursor-grab opacity-0 group-hover:opacity-100" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-400 shrink-0">{entry.year}{entry.month ? `/${String(entry.month).padStart(2, '0')}` : ''}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${categoryColor(entry.category)}`}>{CATEGORY_OPTIONS.find(o => o.value === entry.category)?.label || entry.category}</span>
                    <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                  </div>
                  {entry.title_en && <p className="text-xs text-gray-500 truncate">{entry.title_en}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${entry.status === 'published' ? 'bg-green-900/30 text-green-400' : entry.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{entry.status}</span>
                <button onClick={() => startEdit(entry)} className="text-xs text-gray-500 hover:text-white px-2 py-1">Επεξεργασία</button>
                <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 disabled:opacity-40">{deleting === entry.id ? '...' : 'Διαγραφή'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
