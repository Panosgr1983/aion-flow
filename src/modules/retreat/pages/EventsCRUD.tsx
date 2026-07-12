import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { title: '', title_en: '', date: '', organizer: '', capacity: 0, price: 0, description: '', description_en: '', includes: [] as string[], includes_en: [] as string[], image_url: '', sort_order: 0, status: 'draft' as string };

export default function EventsCRUD() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [includeInput, setIncludeInput] = useState('');
  const [includeEnInput, setIncludeEnInput] = useState('');
  const [langTab, setLangTab] = useState<'el' | 'en'>('el');

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(supabase.from('retreat_events').select('*').order('sort_order', { ascending: true }).order('date', { ascending: false, nulls: 'last' }), effectiveTenantId);
    setItems(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (items.length + 1) * 10 }); setEditing('new'); setError(null); };
  const startEdit = (e: any) => { setForm({ title: e.title, title_en: e.title_en || '', date: e.date || '', organizer: e.organizer || '', capacity: e.capacity || 0, price: e.price || 0, description: e.description || '', description_en: e.description_en || '', includes: e.includes || [], includes_en: e.includes_en || [], image_url: e.image_url || '', sort_order: e.sort_order || 0, status: e.status || 'draft' }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, title: form.title.trim(), title_en: form.title_en.trim() || null, date: form.date || null, organizer: form.organizer.trim() || null, capacity: form.capacity || null, price: form.price || null, description: form.description || null, description_en: form.description_en || null, includes: form.includes, includes_en: form.includes_en, image_url: form.image_url || null, sort_order: form.sort_order || 0, status: form.status || 'draft' };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await supabase.from('retreat_events').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'retreat_events', record_id: c.id, entity_name: c.title, operation: 'create', snapshot_before: null, snapshot_after: { title: c.title }, summary: `Δημιουργία εκδήλωσης: ${c.title}`, user_id: user?.id || null });
      } else {
        const before = items.find(e => e.id === editing);
        const { data: u, error: ue } = await supabase.from('retreat_events').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'retreat_events', record_id: editing, entity_name: u.title, operation: 'update', snapshot_before: { title: before?.title }, snapshot_after: { title: u.title }, summary: `Ενημέρωση εκδήλωσης: ${u.title}`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή εκδήλωσης; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = items.find(e => e.id === id);
    await supabase.from('retreat_events').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'retreat_events', record_id: id, entity_name: entry?.title, operation: 'delete', snapshot_before: { title: entry?.title }, snapshot_after: null, summary: `Διαγραφή εκδήλωσης: ${entry?.title}`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const handleMediaSelect = (url: string) => { updateForm('image_url', url); setPickerOpen(false); };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα εκδήλωση' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2"><button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}

      {/* Language tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button onClick={() => setLangTab('el')} className={`px-4 py-2 text-xs rounded-t-lg ${langTab === 'el' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Ελληνικά</button>
        <button onClick={() => setLangTab('en')} className={`px-4 py-2 text-xs rounded-t-lg ${langTab === 'en' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>English</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Εικόνα</label>
            <div onClick={() => setPickerOpen(true)} className="relative aspect-[16/9] cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50">
              {form.image_url ? <img src={form.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-gray-600"><ImageIcon size={32} /><span className="text-xs">Επιλέξτε εικόνα</span></div>}
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Γενικές πληροφορίες</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Τίτλος *</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Title (EN)</label><input value={form.title_en} onChange={e => updateForm('title_en', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Ημερομηνία</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Διοργανωτής</label><input value={form.organizer} onChange={e => updateForm('organizer', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Χωρητικότητα</label><input type="number" value={form.capacity} onChange={e => updateForm('capacity', parseInt(e.target.value) || 0)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Τιμή (€)</label><input type="number" step="0.01" value={form.price} onChange={e => updateForm('price', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περιγραφή ({langTab === 'el' ? 'GR' : 'EN'})</h3>
            <textarea value={langTab === 'el' ? form.description : form.description_en} onChange={e => updateForm(langTab === 'el' ? 'description' : 'description_en', e.target.value)} rows={4} className={inputCls + ' resize-none'} />
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Συμπεριλαμβάνονται ({langTab === 'el' ? 'GR' : 'EN'})</h3>
            <div className="flex gap-2">
              <input value={langTab === 'el' ? includeInput : includeEnInput} onChange={e => langTab === 'el' ? setIncludeInput(e.target.value) : setIncludeEnInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), langTab === 'el' ? (includeInput.trim() && (updateForm('includes', [...form.includes, includeInput.trim()]), setIncludeInput(''))) : (includeEnInput.trim() && (updateForm('includes_en', [...form.includes_en, includeEnInput.trim()]), setIncludeEnInput(''))))} className={inputCls} placeholder="Προσθέστε..." />
              <button onClick={() => langTab === 'el' ? (includeInput.trim() && (updateForm('includes', [...form.includes, includeInput.trim()]), setIncludeInput(''))) : (includeEnInput.trim() && (updateForm('includes_en', [...form.includes_en, includeEnInput.trim()]), setIncludeEnInput('')))} className="px-3 py-2 text-xs bg-gray-700 text-white rounded-lg hover:bg-gray-600">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(langTab === 'el' ? form.includes : form.includes_en).map((item: string, i: number) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">{item}<button onClick={() => updateForm(langTab === 'el' ? 'includes' : 'includes_en', (langTab === 'el' ? form.includes : form.includes_en).filter((_: string, idx: number) => idx !== i))} className="text-gray-500 hover:text-red-400 ml-1">×</button></span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Εκδηλώσεις</h2><p className="text-sm text-gray-500">Διαχείριση εκδηλώσεων & σεμιναρίων (GR/EN)</p></div>
        <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"><Plus size={14} /> Νέα εκδήλωση</button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center"><p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες εκδηλώσεις.</p><button onClick={startNew} className="mt-4 text-xs text-blue-400">+ Προσθέστε την πρώτη</button></div>
      ) : (
        <div className="space-y-2">{items.map(e => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 group">
            <div className="flex items-center gap-3 min-w-0">
              <GripVertical size={16} className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100" />
              <div className="min-w-0">
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-white truncate">{e.title}</span>{e.date && <span className="text-[10px] text-gray-500">· {e.date}</span>}</div>
                {e.organizer && <p className="text-xs text-gray-500">{e.organizer}{e.price ? ` · €${e.price}` : ''}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-green-900/30 text-green-400' : e.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{e.status}</span>
              <button onClick={() => startEdit(e)} className="text-xs text-gray-500 hover:text-white px-2 py-1">Επεξεργασία</button>
              <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 disabled:opacity-40">{deleting === e.id ? '...' : 'Διαγραφή'}</button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
