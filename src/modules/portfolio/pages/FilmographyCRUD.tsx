import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, RefreshCw, GripVertical } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';
import RichEditor from '../../../components/dashboard/RichEditor';
import type { FilmographyEntry } from '../types/artist';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY_ENTRY = {
  title: '', title_en: '', year: new Date().getFullYear(), role: '', genre: '', director: '',
  duration: '', description: '', featured_media_id: null as string | null, trailer_url: '', imdb_url: '',
  sort_order: 0, status: 'draft' as string, verified: false,
};

export default function FilmographyCRUD() {
  const { effectiveTenantId } = useTenant();
  const [entries, setEntries] = useState<FilmographyEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null); // 'new' | id
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [descContent, setDescContent] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_ENTRY });

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(
      supabase.from('filmography_entries').select('*').order('sort_order', { ascending: true }).order('year', { ascending: false }),
      effectiveTenantId
    );
    setEntries(data || []);
    setLoading(false);
    setEditing(null);
    setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const startNew = () => {
    setForm({ ...EMPTY_ENTRY, sort_order: (entries.length + 1) * 10, year: new Date().getFullYear() });
    setDescContent(null);
    setEditing('new');
    setError(null);
  };

  const startEdit = (entry: FilmographyEntry) => {
    setForm({
      title: entry.title, title_en: entry.title_en || '', year: entry.year, role: entry.role || '',
      genre: entry.genre || '', director: entry.director || '', duration: entry.duration || '',
      description: entry.description || '', featured_media_id: entry.featured_media_id,
      trailer_url: entry.trailer_url || '', imdb_url: entry.imdb_url || '',
      sort_order: entry.sort_order, status: entry.status || 'draft', verified: entry.verified || false,
    });
    setDescContent(entry.description || null);
    setEditing(entry.id);
    setError(null);
  };

  const cancel = () => { setEditing(null); setForm({ ...EMPTY_ENTRY }); setDescContent(null); setError(null); };

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Ο τίτλος είναι υποχρεωτικός';
    if (form.year && (form.year < 1900 || form.year > 2030)) return 'Το έτος πρέπει να είναι μεταξύ 1900 και 2030';
    if (form.imdb_url && !form.imdb_url.startsWith('http')) return 'Το IMDb URL πρέπει να ξεκινά με http';
    if (form.trailer_url && !form.trailer_url.startsWith('http')) return 'Το trailer URL πρέπει να ξεκινά με http';
    return null;
  };

  const handleSave = async () => {
    const ve = validate();
    if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      tenant_id: effectiveTenantId,
      title: form.title.trim(),
      title_en: form.title_en.trim() || null,
      year: form.year || null,
      role: form.role.trim() || null,
      genre: form.genre.trim() || null,
      director: form.director.trim() || null,
      duration: form.duration.trim() || null,
      description: descContent,
      featured_media_id: form.featured_media_id,
      trailer_url: form.trailer_url.trim() || null,
      imdb_url: form.imdb_url.trim() || null,
      sort_order: form.sort_order || 0,
      status: form.status || 'draft',
      verified: form.verified || false,
    };

    try {
      if (editing === 'new') {
        const { data: created, error: ie } = await supabase.from('filmography_entries').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({
          tenant_id: effectiveTenantId, table_name: 'filmography_entries', record_id: created.id,
          entity_name: created.title, operation: 'create', snapshot_before: null, snapshot_after: { title: created.title },
          summary: `Δημιουργία ταινίας: ${created.title}`, user_id: user?.id || null,
        });
      } else {
        const before = entries.find(e => e.id === editing);
        const { data: updated, error: ue } = await supabase.from('filmography_entries').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({
          tenant_id: effectiveTenantId, table_name: 'filmography_entries', record_id: editing,
          entity_name: updated.title, operation: 'update',
          snapshot_before: { title: before?.title }, snapshot_after: { title: updated.title },
          summary: `Ενημέρωση ταινίας: ${updated.title}`, user_id: user?.id || null,
        });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή ταινίας; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = entries.find(e => e.id === id);
    await supabase.from('filmography_entries').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({
      tenant_id: effectiveTenantId, table_name: 'filmography_entries', record_id: id,
      entity_name: entry?.title, operation: 'delete',
      snapshot_before: { title: entry?.title }, snapshot_after: null,
      summary: `Διαγραφή ταινίας: ${entry?.title}`, user_id: user?.id || null,
    });
    setDeleting(null);
    await load();
  };

  const handleMediaSelect = async (url: string) => {
    const { data: media } = await supabase.from('media').select('id').eq('url', url).maybeSingle();
    updateForm('featured_media_id', media?.id || null);
    setPickerOpen(false);
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  // Editing mode
  if (editing) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα ταινία' : 'Επεξεργασία ταινίας'}</h2>
          <div className="flex gap-2">
            <button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">Ακύρωση</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors">
              <Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Poster */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
              <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Αφίσα / Εικόνα</label>
              <div onClick={() => setPickerOpen(true)} className="relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50 transition-colors">
                {form.featured_media_id ? (
                  <img src={`https://qhbgptlklsavezxpksao.supabase.co/storage/v1/object/public/site-images/${form.featured_media_id}`} alt={form.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <ImageIcon size={32} />
                    <span className="text-xs">Επιλέξτε αφίσα</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">Αλλαγή</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
              <label className="text-xs uppercase tracking-wider text-gray-500 block">Κατάσταση</label>
              <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.verified} onChange={e => updateForm('verified', e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500" />
                Επαληθευμένο
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-300">Βασικές πληροφορίες</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-gray-500">Τίτλος *</label>
                  <input value={form.title} onChange={e => updateForm('title', e.target.value)} className={inputCls} placeholder="π.χ. Άγγελος" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Τίτλος (Αγγλικά)</label>
                  <input value={form.title_en} onChange={e => updateForm('title_en', e.target.value)} className={inputCls} placeholder="π.χ. Angelos" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Έτος</label>
                  <input type="number" value={form.year} onChange={e => updateForm('year', parseInt(e.target.value) || '')} className={inputCls} placeholder="1982" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Σκηνοθεσία</label>
                  <input value={form.director} onChange={e => updateForm('director', e.target.value)} className={inputCls} placeholder="π.χ. Γιώργος Κατακουζηνός" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Είδος</label>
                  <input value={form.genre} onChange={e => updateForm('genre', e.target.value)} className={inputCls} placeholder="π.χ. Δράμα" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Διάρκεια (min)</label>
                  <input value={form.duration} onChange={e => updateForm('duration', e.target.value)} className={inputCls} placeholder="π.χ. 114" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Ρόλος</label>
                  <input value={form.role} onChange={e => updateForm('role', e.target.value)} className={inputCls} placeholder="π.χ. Ηθοποιός" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Σειρά προβολής</label>
                  <input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-300">Σύνδεσμοι</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">IMDb URL</label>
                  <input value={form.imdb_url} onChange={e => updateForm('imdb_url', e.target.value)} className={inputCls} placeholder="https://www.imdb.com/title/tt0252820" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Trailer URL</label>
                  <input value={form.trailer_url} onChange={e => updateForm('trailer_url', e.target.value)} className={inputCls} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Περιγραφή</h3>
              <RichEditor content={descContent} onChange={(json: any) => setDescContent(json)} />
            </div>
          </div>
        </div>

        <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelect} />
      </div>
    );
  }

  // List mode
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Ταινίες</h2>
          <p className="text-sm text-gray-500">Διαχείριση φιλμογραφίας</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={14} /> Ανανέωση
          </button>
          <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
            <Plus size={14} /> Νέα ταινία
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}

      {entries.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες ταινίες.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Προσθέστε την πρώτη</button>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={16} className="text-gray-700 shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                    {entry.year && <span className="text-[10px] font-mono text-blue-400 shrink-0">{entry.year}</span>}
                  </div>
                  {entry.director && <p className="text-xs text-gray-500 truncate">{entry.director}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${entry.status === 'published' ? 'bg-green-900/30 text-green-400' : entry.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                  {entry.status}
                </span>
                <button onClick={() => startEdit(entry)} className="text-xs text-gray-500 hover:text-white px-2 py-1 transition-colors">Επεξεργασία</button>
                <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 transition-colors disabled:opacity-40">
                  {deleting === entry.id ? '...' : 'Διαγραφή'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
