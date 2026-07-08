import { useEffect, useState, useCallback } from 'react';
import { Save, RefreshCw, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';
import MediaPicker from '../../../components/dashboard/MediaPicker';
import RichEditor from '../../../components/dashboard/RichEditor';
import type { Biographies } from '../types/artist';

const PROFESSIONAL_TYPES = [
  { value: 'actor', label: 'Ηθοποιός' },
  { value: 'musician', label: 'Μουσικός' },
  { value: 'painter', label: 'Ζωγράφος' },
  { value: 'writer', label: 'Συγγραφέας' },
  { value: 'photographer', label: 'Φωτογράφος' },
  { value: 'director', label: 'Σκηνοθέτης' },
  { value: 'dancer', label: 'Χορευτής' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Άλλο' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

export default function BiographyCRUD() {
  const { effectiveTenantId } = useTenant();
  const [bio, setBio] = useState<Biographies | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [form, setForm] = useState({
    professional_type: 'actor',
    short_bio: '',
    birth_year: '',
    birth_place: '',
    pseudonyms: '',
    featured_media_id: null as string | null,
    featured_media_url: null as string | null,
    status: 'draft' as string,
    verified: false,
  });

  const [bioContent, setBioContent] = useState<any>(null);

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await withTenant(
      supabase.from('biographies').select('*').limit(1).order('created_at', { ascending: false }),
      effectiveTenantId
    ).maybeSingle();

    if (err) { setError(err.message); setLoading(false); return; }

    if (data) {
      setBio(data);
      setForm({
        professional_type: (data as any).professional_type || 'actor',
        short_bio: data.short_bio || '',
        birth_year: data.birth_year || '',
        birth_place: data.birth_place || '',
        pseudonyms: (data.pseudonyms || []).join(', '),
        featured_media_id: data.featured_media_id,
        featured_media_url: null,
        status: data.status || 'draft',
        verified: data.verified || false,
      });
      setBioContent(typeof data.content === 'string' ? data.content : data.content);
    } else {
      setBio(null);
      setForm({ professional_type: 'actor', short_bio: '', birth_year: '', birth_place: '', pseudonyms: '', featured_media_id: null, featured_media_url: null, status: 'draft', verified: false });
      setBioContent(null);
    }
    setLoading(false);
    setHasChanges(false);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);

  const updateForm = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const validate = (): string | null => {
    if (form.birth_year && !/^\d{4}$/.test(form.birth_year)) return 'Το έτος γέννησης πρέπει να είναι 4 ψηφία';
    return null;
  };

  const handleSave = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    const payload: any = {
      tenant_id: effectiveTenantId,
      professional_type: form.professional_type,
      short_bio: form.short_bio || null,
      birth_year: form.birth_year || null,
      birth_place: form.birth_place || null,
      pseudonyms: form.pseudonyms ? form.pseudonyms.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      featured_media_id: form.featured_media_id,
      content: bioContent,
      status: form.status || 'draft',
      verified: form.verified,
    };

    try {
      if (bio?.id) {
        // UPDATE
        const before = bio;
        const { data: updated, error: updateErr } = await supabase
          .from('biographies')
          .update(payload)
          .eq('id', bio.id)
          .eq('tenant_id', effectiveTenantId)
          .select()
          .single();

        if (updateErr) throw new Error(updateErr.message);
        setBio(updated);

        // History log
        await supabase.from('content_history').insert({
          tenant_id: effectiveTenantId,
          table_name: 'biographies',
          record_id: bio.id,
          entity_name: 'Βιογραφικό',
          operation: 'update',
          snapshot_before: { content: before.content?.slice(0, 200), short_bio: before.short_bio },
          snapshot_after: { content: payload.content?.slice(0, 200), short_bio: payload.short_bio },
          summary: 'Ενημέρωση βιογραφικού',
          user_id: user?.id || null,
        });
      } else {
        // INSERT
        const { data: inserted, error: insertErr } = await supabase
          .from('biographies')
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw new Error(insertErr.message);
        setBio(inserted);

        await supabase.from('content_history').insert({
          tenant_id: effectiveTenantId,
          table_name: 'biographies',
          record_id: inserted.id,
          entity_name: 'Βιογραφικό',
          operation: 'create',
          snapshot_before: null,
          snapshot_after: { content: payload.content?.slice(0, 200), short_bio: payload.short_bio },
          summary: 'Δημιουργία βιογραφικού',
          user_id: user?.id || null,
        });
      }
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!bio?.id || !effectiveTenantId) return;
    if (!window.confirm('Αρχειοθέτηση βιογραφικού; Μπορείτε πάντα να το επαναφέρετε.')) return;

    const { error: delErr } = await supabase
      .from('biographies')
      .update({ status: 'archived' })
      .eq('id', bio.id)
      .eq('tenant_id', effectiveTenantId);

    if (delErr) { setError(delErr.message); return; }
    load();
  };

  const handleMediaSelect = async (url: string) => {
    // Find media library entry by url
    const { data: media } = await supabase
      .from('media')
      .select('id')
      .eq('url', url)
      .maybeSingle();

    updateForm('featured_media_id', media?.id || null);
    updateForm('featured_media_url', url);
    setPickerOpen(false);
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Βιογραφικό / Προφίλ</h2>
          <p className="text-sm text-gray-500">Διαχείριση βιογραφικών στοιχείων και προφίλ καλλιτέχνη</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            <RefreshCw size={14} /> Επαναφορά
          </button>
          {bio && (
            <button onClick={handleArchive} className="flex items-center gap-1.5 rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:border-red-700 transition-colors">
              <RotateCcw size={14} /> Αρχειοθέτηση
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={14} /> {saving ? 'Αποθήκευση...' : saved ? 'Αποθηκεύτηκε ✓' : 'Αποθήκευση'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Main form grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Portrait + Status */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-3 block">Φωτογραφία προφίλ</label>
            <div
              onClick={() => setPickerOpen(true)}
              className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 flex items-center justify-center group hover:border-blue-500/50 transition-colors"
            >
              {form.featured_media_url ? (
                <img src={form.featured_media_url} alt="Προφίλ" className="h-full w-full object-cover" />
              ) : form.featured_media_id ? (
                <img src={`https://qhbgptlklsavezxpksao.supabase.co/storage/v1/object/public/site-images/${form.featured_media_id}`} alt="Προφίλ" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  <ImageIcon size={32} />
                  <span className="text-xs">Επιλέξτε εικόνα</span>
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

        {/* Right: Form fields */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Βασικές πληροφορίες</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Τύπος επαγγέλματος</label>
                <select value={form.professional_type} onChange={e => updateForm('professional_type', e.target.value)} className={inputCls}>
                  {PROFESSIONAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Έτος γέννησης</label>
                <input value={form.birth_year} onChange={e => updateForm('birth_year', e.target.value)} placeholder="π.χ. 1958" maxLength={4} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Τόπος γέννησης</label>
                <input value={form.birth_place} onChange={e => updateForm('birth_place', e.target.value)} placeholder="π.χ. Λαγκάδια Γορτυνίας" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Ψευδώνυμα (διαχωρισμένα με κόμμα)</label>
                <input value={form.pseudonyms} onChange={e => updateForm('pseudonyms', e.target.value)} placeholder="π.χ. Φάνης Χριστοδούλου" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Σύντομο βιογραφικό</h3>
            <textarea
              value={form.short_bio}
              onChange={e => updateForm('short_bio', e.target.value)}
              rows={3}
              placeholder="Σύντομη περιγραφή..."
              className={inputCls + ' resize-none'}
            />
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Πλήρες βιογραφικό</h3>
            <RichEditor
              content={bioContent}
              onChange={(json: any) => { setBioContent(json); setHasChanges(true); setSaved(false); }}
            />
          </div>

          {/* Metadata */}
          {bio && (
            <div className="flex gap-4 text-[10px] text-gray-600 border-t border-gray-800 pt-4">
              <span>Δημιουργήθηκε: {new Date(bio.created_at).toLocaleDateString('el-GR')}</span>
              <span>Ενημερώθηκε: {new Date(bio.updated_at).toLocaleDateString('el-GR')}</span>
              <span>ID: {bio.id.slice(0, 8)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
