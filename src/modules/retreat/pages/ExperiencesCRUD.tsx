import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';
import type { Experience } from '../types/retreat';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { title: '', description: '', duration: '', level: '', includes: [] as string[], image_url: '', sort_order: 0, status: 'draft' as string };

export default function ExperiencesCRUD() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [includesInput, setIncludesInput] = useState('');

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(supabase.from('experiences').select('*').order('sort_order', { ascending: true }), effectiveTenantId);
    setItems(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (items.length + 1) * 10 }); setEditing('new'); setError(null); };
  const startEdit = (e: Experience) => { setForm({ title: e.title, description: e.description || '', duration: e.duration || '', level: e.level || '', includes: e.includes || [], image_url: e.image_url || '', sort_order: e.sort_order || 0, status: e.status || 'draft' }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const addInclude = () => {
    if (!includesInput.trim()) return;
    setForm(p => ({ ...p, includes: [...p.includes, includesInput.trim()] }));
    setIncludesInput('');
  };
  const removeInclude = (idx: number) => setForm(p => ({ ...p, includes: p.includes.filter((_, i) => i !== idx) }));

  const validate = () => { if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, title: form.title.trim(), description: form.description || null, duration: form.duration || null, level: form.level || null, includes: form.includes, image_url: form.image_url || null, sort_order: form.sort_order || 0, status: form.status || 'draft' };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await supabase.from('experiences').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'experiences', record_id: c.id, entity_name: c.title, operation: 'create', snapshot_before: null, snapshot_after: { title: c.title }, summary: `Δημιουργία εμπειρίας: ${c.title}`, user_id: user?.id || null });
      } else {
        const before = items.find(e => e.id === editing);
        const { data: u, error: ue } = await supabase.from('experiences').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'experiences', record_id: editing, entity_name: u.title, operation: 'update', snapshot_before: { title: before?.title }, snapshot_after: { title: u.title }, summary: `Ενημέρωση εμπειρίας: ${u.title}`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή εμπειρίας; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = items.find(e => e.id === id);
    await supabase.from('experiences').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'experiences', record_id: id, entity_name: entry?.title, operation: 'delete', snapshot_before: { title: entry?.title }, snapshot_after: null, summary: `Διαγραφή εμπειρίας: ${entry?.title}`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const handleMediaSelect = (url: string) => { updateForm('image_url', url); setPickerOpen(false); };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα εμπειρία' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2"><button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
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
            <h3 className="text-sm font-medium text-gray-300">Στοιχεία</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Τίτλος *</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Διάρκεια</label><input value={form.duration} onChange={e => updateForm('duration', e.target.value)} className={inputCls} placeholder="π.χ. 75 λεπτά" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Επίπεδο</label>
                <select value={form.level} onChange={e => updateForm('level', e.target.value)} className={inputCls}>
                  <option value="">—</option><option value="Αρχάριο">Αρχάριο</option><option value="Μεσαίο">Μεσαίο</option><option value="Προχωρημένο">Προχωρημένο</option><option value="Όλα τα επίπεδα">Όλα τα επίπεδα</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Περιγραφή</h3>
            <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className={inputCls + ' resize-none'} />
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Συμπεριλαμβάνονται</h3>
            <div className="flex gap-2">
              <input value={includesInput} onChange={e => setIncludesInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInclude())} className={inputCls} placeholder="Προσθέστε στοιχείο..." />
              <button onClick={addInclude} className="px-3 py-2 text-xs bg-gray-700 text-white rounded-lg hover:bg-gray-600">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.includes.map((item, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                  {item}
                  <button onClick={() => removeInclude(i)} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                </span>
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
        <div><h2 className="text-lg font-semibold text-white">Εμπειρίες</h2><p className="text-sm text-gray-500">Διαχείριση εμπειριών & δραστηριοτήτων</p></div>
        <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"><Plus size={14} /> Νέα εμπειρία</button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες εμπειρίες.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400">+ Προσθέστε την πρώτη</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(e => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 group">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={16} className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{e.title}</span>
                    {e.duration && <span className="text-[10px] text-gray-500 shrink-0">· {e.duration}</span>}
                  </div>
                  {e.level && <p className="text-xs text-gray-500">{e.level}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-green-900/30 text-green-400' : e.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{e.status}</span>
                <button onClick={() => startEdit(e)} className="text-xs text-gray-500 hover:text-white px-2 py-1">Επεξεργασία</button>
                <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 disabled:opacity-40">{deleting === e.id ? '...' : 'Διαγραφή'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
