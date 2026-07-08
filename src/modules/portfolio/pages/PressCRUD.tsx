import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical, ExternalLink } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { title: '', subtitle: '', publication: '', author: '', date: '', url: '', source: '', excerpt: '', body: '', featured_media_id: null as string | null, featured: false, sort_order: 0, status: 'draft' as string, verified: false };

export default function PressCRUD() {
  const { effectiveTenantId } = useTenant();
  const [entries, setEntries] = useState<any[]>([]);
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
    const { data } = await withTenant(supabase.from('press_items').select('*').order('sort_order', { ascending: true }).order('date', { ascending: false, nulls: 'last' }), effectiveTenantId);
    setEntries(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (entries.length + 1) * 10 }); setEditing('new'); setError(null); };
  const startEdit = (e: any) => { setForm({ title: e.title, subtitle: e.subtitle || '', publication: e.publication || '', author: e.author || '', date: e.date || '', url: e.url || '', source: e.source || '', excerpt: e.excerpt || '', body: e.body || '', featured_media_id: e.featured_media_id, featured: e.featured || false, sort_order: e.sort_order || 0, status: e.status || 'draft', verified: e.verified || false }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, title: form.title.trim(), subtitle: form.subtitle.trim() || null, publication: form.publication.trim() || null, author: form.author.trim() || null, date: form.date || null, url: form.url.trim() || null, source: form.source.trim() || null, excerpt: form.excerpt || null, body: form.body || null, featured_media_id: form.featured_media_id, featured: form.featured, sort_order: form.sort_order || 0, status: form.status || 'draft', verified: form.verified || false };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await supabase.from('press_items').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'press_items', record_id: c.id, entity_name: c.title, operation: 'create', snapshot_before: null, snapshot_after: { title: c.title }, summary: `Δημιουργία δημοσιεύματος: ${c.title}`, user_id: user?.id || null });
      } else {
        const before = entries.find(e => e.id === editing);
        const { data: u, error: ue } = await supabase.from('press_items').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'press_items', record_id: editing, entity_name: u.title, operation: 'update', snapshot_before: { title: before?.title }, snapshot_after: { title: u.title }, summary: `Ενημέρωση δημοσιεύματος: ${u.title}`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή δημοσιεύματος; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = entries.find(e => e.id === id);
    await supabase.from('press_items').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'press_items', record_id: id, entity_name: entry?.title, operation: 'delete', snapshot_before: { title: entry?.title }, snapshot_after: null, summary: `Διαγραφή δημοσιεύματος: ${entry?.title}`, user_id: user?.id || null });
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
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέο δημοσίευμα' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2"><button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Εικόνα</label>
            <div onClick={() => setPickerOpen(true)} className="relative aspect-[16/9] cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50">
              {form.featured_media_id ? <img src={`https://qhbgptlklsavezxpksao.supabase.co/storage/v1/object/public/site-images/${form.featured_media_id}`} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-600">Επιλέξτε εικόνα</span>}
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={form.verified} onChange={e => updateForm('verified', e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" /> Επαληθευμένο</label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => updateForm('featured', e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" /> Προβεβλημένο</label>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Στοιχεία</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Τίτλος *</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} /></div>
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Υπότιτλος</label><input value={form.subtitle} onChange={e => updateForm('subtitle', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Έκδοση / Μέσο</label><input value={form.publication} onChange={e => updateForm('publication', e.target.value)} className={inputCls} placeholder="π.χ. Espresso" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Συγγραφέας</label><input value={form.author} onChange={e => updateForm('author', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Ημερομηνία</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Πηγή</label><input value={form.source} onChange={e => updateForm('source', e.target.value)} className={inputCls} /></div>
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">URL</label><input value={form.url} onChange={e => updateForm('url', e.target.value)} className={inputCls} placeholder="https://..." /></div>
              <div className="space-y-1.5 sm:col-span-2"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περίληψη</h3>
            <textarea value={form.excerpt} onChange={e => updateForm('excerpt', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Σύντομη περίληψη..." />
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περιεχόμενο</h3>
            <textarea value={form.body} onChange={e => updateForm('body', e.target.value)} rows={6} className={inputCls + ' resize-none font-mono text-xs'} placeholder="Πλήρες κείμενο (HTML ή plain text)..." />
          </div>
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Press / Δημοσιεύματα</h2><p className="text-sm text-gray-500">Διαχείριση δημοσιευμάτων τύπου</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white"><RefreshCw size={14} /> Ανανέωση</button>
          <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"><Plus size={14} /> Νέο δημοσίευμα</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένα δημοσιεύματα.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400 hover:text-blue-300">+ Προσθέστε το πρώτο</button>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 group">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={16} className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                    {entry.featured && <span className="text-[10px] text-amber-400 shrink-0">★</span>}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {entry.publication && <span>{entry.publication}</span>}
                    {entry.date && <span>· {entry.date}</span>}
                    {entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"><ExternalLink size={10} /></a>}
                  </div>
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
