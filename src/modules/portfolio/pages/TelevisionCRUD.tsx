import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';
import type { TelevisionEntry } from '../types/artist';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { title: '', year: new Date().getFullYear(), channel: '', role: '', episode_title: '', description: '', featured_media_id: null as string | null, sort_order: 0, status: 'draft' as string, verified: false };

export default function TelevisionCRUD() {
  const { effectiveTenantId } = useTenant();
  const [entries, setEntries] = useState<TelevisionEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(supabase.from('television_entries').select('*').order('sort_order', { ascending: true }).order('year', { ascending: false }), effectiveTenantId);
    setEntries(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (entries.length + 1) * 10, year: new Date().getFullYear() }); setEditing('new'); setError(null); };
  const startEdit = (e: TelevisionEntry) => { setForm({ title: e.title, year: e.year, channel: e.channel || '', role: e.role || '', episode_title: e.episode_title || '', description: e.description || '', featured_media_id: e.featured_media_id, sort_order: e.sort_order, status: e.status || 'draft', verified: e.verified || false }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός'; if (form.year && (form.year < 1900 || form.year > 2030)) return 'Το έτος πρέπει να είναι μεταξύ 1900-2030'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, title: form.title.trim(), year: form.year || null, channel: form.channel.trim() || null, role: form.role.trim() || null, episode_title: form.episode_title.trim() || null, description: form.description || null, featured_media_id: form.featured_media_id, sort_order: form.sort_order || 0, status: form.status || 'draft', verified: form.verified || false };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await supabase.from('television_entries').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'television_entries', record_id: c.id, entity_name: c.title, operation: 'create', snapshot_before: null, snapshot_after: { title: c.title }, summary: `Δημιουργία τηλεοπτικής εμφάνισης: ${c.title}`, user_id: user?.id || null });
      } else {
        const before = entries.find(e => e.id === editing);
        const { data: u, error: ue } = await supabase.from('television_entries').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'television_entries', record_id: editing, entity_name: u.title, operation: 'update', snapshot_before: { title: before?.title }, snapshot_after: { title: u.title }, summary: `Ενημέρωση τηλεοπτικής εμφάνισης: ${u.title}`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή τηλεοπτικής εμφάνισης; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = entries.find(e => e.id === id);
    await supabase.from('television_entries').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'television_entries', record_id: id, entity_name: entry?.title, operation: 'delete', snapshot_before: { title: entry?.title }, snapshot_after: null, summary: `Διαγραφή τηλεοπτικής εμφάνισης: ${entry?.title}`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const handleMediaSelect = async (url: string) => {
    const { data: media } = await supabase.from('media').select('id').eq('url', url).maybeSingle();
    updateForm('featured_media_id', media?.id || null); setPickerOpen(false);
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα εμφάνιση' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2">
          <button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">Ακύρωση</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Εικόνα</label>
            <div onClick={() => setPickerOpen(true)} className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50 transition-colors">
              {form.featured_media_id ? <img src={`https://qhbgptlklsavezxpksao.supabase.co/storage/v1/object/public/site-images/${form.featured_media_id}`} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-600">Επιλέξτε εικόνα</span>}
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={form.verified} onChange={e => updateForm('verified', e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" /> Επαληθευμένο</label>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Στοιχεία</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Τίτλος σειράς *</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} placeholder="π.χ. Η Λάμψη" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Έτος</label><input type="number" value={form.year} onChange={e => updateForm('year', parseInt(e.target.value) || '')} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Κανάλι</label><input value={form.channel} onChange={e => updateForm('channel', e.target.value)} className={inputCls} placeholder="π.χ. ΑΝΤ1" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Ρόλος</label><input value={form.role} onChange={e => updateForm('role', e.target.value)} className={inputCls} placeholder="π.χ. Ορέστης Δέρβος" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Επεισόδιο</label><input value={form.episode_title} onChange={e => updateForm('episode_title', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περιγραφή</h3>
            <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className={inputCls + ' resize-none'} placeholder="Περιγραφή της συμμετοχής..." />
          </div>
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Τηλεοπτικές Εμφανίσεις</h2><p className="text-sm text-gray-500">Διαχείριση τηλεοπτικών συμμετοχών</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"><RefreshCw size={14} /> Ανανέωση</button>
          <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"><Plus size={14} /> Νέα εμφάνιση</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες τηλεοπτικές εμφανίσεις.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400 hover:text-blue-300">+ Προσθέστε την πρώτη</button>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={16} className="text-gray-700 shrink-0 cursor-grab opacity-0 group-hover:opacity-100" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                    {entry.year && <span className="text-[10px] font-mono text-blue-400 shrink-0">{entry.year}</span>}
                    {entry.channel && <span className="text-[10px] text-gray-500 shrink-0">· {entry.channel}</span>}
                  </div>
                  {entry.role && <p className="text-xs text-gray-500 truncate">{entry.role}</p>}
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
