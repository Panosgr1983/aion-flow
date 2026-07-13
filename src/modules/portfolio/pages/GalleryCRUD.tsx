import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, Image as ImageIcon, X, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getCurrentContentClient } from '../../../lib/multiProjectClient';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';

const CATEGORY_OPTIONS = [
  { value: 'film_stills', label: 'Στιγμιότυπα ταινιών' },
  { value: 'behind_scenes', label: 'Παρασκήνιο' },
  { value: 'portraits', label: 'Πορτρέτα' },
  { value: 'theatre', label: 'Θέατρο' },
  { value: 'events', label: 'Εκδηλώσεις' },
  { value: 'other', label: 'Άλλο' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { image_url: '', media_id: null as string | null, caption: '', alt_text: '', category: 'film_stills', photographer: '', copyright: '', sort_order: 0, status: 'draft' as string };

export default function GalleryCRUD() {
  const { effectiveTenantId } = useTenant();
  const db = getCurrentContentClient();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(db.from('gallery_items').select('*').order('sort_order', { ascending: true }), effectiveTenantId);
    setItems(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (items.length + 1) * 10 }); setEditing('new'); setError(null); };
  const startEdit = (e: any) => { setForm({ image_url: e.image_url, media_id: e.media_id, caption: e.caption || '', alt_text: e.alt_text || '', category: e.category || 'film_stills', photographer: e.photographer || '', copyright: e.copyright || '', sort_order: e.sort_order || 0, status: e.status || 'draft' }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.image_url) return 'Επιλέξτε εικόνα'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, image_url: form.image_url, media_id: form.media_id, caption: form.caption || null, alt_text: form.alt_text || null, category: form.category, photographer: form.photographer || null, copyright: form.copyright || null, sort_order: form.sort_order || 0, status: form.status || 'draft' };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await db.from('gallery_items').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'gallery_items', record_id: c.id, operation: 'create', snapshot_before: null, snapshot_after: { caption: c.caption }, summary: `Προσθήκη φωτογραφίας`, user_id: user?.id || null });
      } else {
        const before = items.find(e => e.id === editing);
        const { data: u, error: ue } = await db.from('gallery_items').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'gallery_items', record_id: editing, operation: 'update', snapshot_before: { caption: before?.caption }, snapshot_after: { caption: u.caption }, summary: `Ενημέρωση φωτογραφίας`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή φωτογραφίας; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = items.find(e => e.id === id);
    await db.from('gallery_items').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'gallery_items', record_id: id, operation: 'delete', snapshot_before: { caption: entry?.caption }, snapshot_after: null, summary: `Διαγραφή φωτογραφίας`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const handleMediaSelect = (url: string) => {
    updateForm('image_url', url);
    // Try to get media_id from the url
    supabase.from('media').select('id').eq('url', url).maybeSingle().then(({ data }) => {
      if (data) updateForm('media_id', data.id);
    });
    setPickerOpen(false);
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  // Lightbox modal
  if (lightbox !== null && items[lightbox]) {
    const item = items[lightbox];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightbox(null)}>
        <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20" aria-label="Κλείσιμο"><X className="h-5 w-5" /></button>
        {lightbox > 0 && <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }} className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"><ChevronLeft className="h-6 w-6" /></button>}
        {lightbox < items.length - 1 && <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }} className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"><ChevronRight className="h-6 w-6" /></button>}
        <div className="flex h-full w-full flex-col items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative max-h-[75vh] w-full max-w-4xl">
            <img src={item.image_url} alt={item.alt_text || item.caption || ''} className="mx-auto max-h-[75vh] w-auto object-contain" />
          </div>
          <div className="mt-4 max-w-lg text-center space-y-1">
            {item.caption && <p className="text-sm text-white/90">{item.caption}</p>}
            {(item.photographer || item.copyright) && <p className="text-[10px] text-white/50 uppercase tracking-wider">{item.photographer && `© ${item.photographer}`}{item.photographer && item.copyright && ' — '}{item.copyright}</p>}
            <p className="text-[10px] text-white/30">{lightbox + 1} / {items.length}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  // Edit form
  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα φωτογραφία' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2">
          <button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">Ακύρωση</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image preview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Εικόνα</label>
            <div onClick={() => setPickerOpen(true)} className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50 transition-colors">
              {form.image_url ? <img src={form.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-gray-600"><ImageIcon size={32} /><span className="text-xs">Επιλέξτε εικόνα</span></div>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"><span className="text-white text-xs opacity-0 group-hover:opacity-100">Αλλαγή</span></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
        </div>
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Λεζάντα &amp; Metadata</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Λεζάντα</label><input value={form.caption} onChange={e => updateForm('caption', e.target.value)} className={inputCls} placeholder="Σύντομη περιγραφή..." /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Alt text (προσβασιμότητα)</label><input value={form.alt_text} onChange={e => updateForm('alt_text', e.target.value)} className={inputCls} placeholder="Περιγραφή για screen readers" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Κατηγορία</label><select value={form.category} onChange={e => updateForm('category', e.target.value)} className={inputCls}>{CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Πνευματικά δικαιώματα</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Φωτογράφος</label><input value={form.photographer} onChange={e => updateForm('photographer', e.target.value)} className={inputCls} placeholder="© Όνομα φωτογράφου" /></div>
              <div className="space-y-1.5"><label className="text-xs text-gray-500">Copyright</label><input value={form.copyright} onChange={e => updateForm('copyright', e.target.value)} className={inputCls} placeholder="π.χ. Ταινιοθήκη Ελλάδος" /></div>
            </div>
          </div>
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );

  // Grid view
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Gallery</h2><p className="text-sm text-gray-500">Διαχείριση φωτογραφιών — {items.length} φωτογραφίες</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"><RefreshCw size={14} /> Ανανέωση</button>
          <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"><Plus size={14} /> Νέα φωτογραφία</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center"><ImageIcon size={24} className="text-gray-600" /></div>
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες φωτογραφίες.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400 hover:text-blue-300">+ Προσθέστε την πρώτη</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, idx) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-colors">
              <div className="relative aspect-[4/3] cursor-pointer bg-gray-800" onClick={() => setLightbox(idx)}>
                <img src={item.image_url} alt={item.alt_text || item.caption || ''} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="p-3 space-y-2">
                {item.caption && <p className="text-xs text-gray-300 truncate">{item.caption}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{CATEGORY_OPTIONS.find(o => o.value === item.category)?.label || item.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.status === 'published' ? 'bg-green-900/30 text-green-400' : item.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{item.status}</span>
                </div>
                {item.photographer && <p className="text-[10px] text-gray-600">© {item.photographer}</p>}
                <div className="flex gap-2 pt-1 border-t border-gray-800">
                  <button onClick={() => startEdit(item)} className="text-[10px] text-gray-500 hover:text-white">Επεξεργασία</button>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="text-[10px] text-red-500 hover:text-red-400 disabled:opacity-40">{deleting === item.id ? '...' : 'Διαγραφή'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
