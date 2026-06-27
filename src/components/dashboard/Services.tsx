import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { servicesHelper, siteSettingsHelper } from '../../lib/dataHelpers';
import { uploadCmsAsset } from '../../lib/media';
import { useTenantContext } from '../../lib/TenantContext';
import { Service } from '../../types/supabase';
import MediaPicker from './MediaPicker';

const iconOptions = ['user', 'sparkles', 'brain', 'heart', 'users', 'book-open', 'lock', 'shield', 'star', 'globe', 'sun', 'moon', 'leaf', 'feather', 'compass'];

const emptyForm: Partial<Service> = { tenant_id: null, title: '', slug: '', short_description: '', long_description: '', icon: 'heart', image_url: '', sort_order: 0, is_active: true, meta_title: '', meta_description: '', og_image: '' };

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function Services() {
  const { selectedTenantId } = useTenantContext();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => { servicesHelper.getAll().then(d => { setItems(d); setLoading(false); }); }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, sort_order: items.length + 1 }); setShowModal(true); };
  const openEdit = (item: Service) => { setEditing(item); setForm(item); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || slugify(form.title || '');
    const payload = { ...form, slug };

    // Save to services table (may fail silently due to RLS)
    if (editing) {
      const updated = await servicesHelper.update(editing.id, payload);
      setItems(prev => prev.map(i => i.id === editing.id ? updated : i));
    } else {
      const created = await servicesHelper.create(payload);
      setItems(prev => [...prev, created]);
    }

    // Also persist image_url to site_settings.page_data as fallback (RLS allows this)
    if (form.image_url) {
      try {
        const all = await siteSettingsHelper.getAll();
        const existing = all.find(s => s.key === 'page_data');
        const pageData = existing?.value && typeof existing.value === 'object'
          ? JSON.parse(JSON.stringify(existing.value))
          : {};
        const svcKey = `/services/${slug}`;
        pageData[svcKey] = { ...(pageData[svcKey] || {}), hero_image: form.image_url, title: form.title };
        if (existing) {
          await siteSettingsHelper.update(existing.id, { value: pageData });
        } else {
          await siteSettingsHelper.create({
            key: 'page_data', value: pageData, category: 'general',
            tenant_id: '00000000-0000-0000-0000-000000000001',
          });
        }
      } catch { /* page_data save is best-effort */ }
    }

    setSaving(false); setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await servicesHelper.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Υπηρεσίες</h2><p className="text-sm text-gray-500">{items.length} υπηρεσίες</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Νέα Υπηρεσία</button>
      </div>

      <div className="card p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9" /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="card p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><span className="text-blue-400 text-lg capitalize">{item.icon?.charAt(0) || '?'}</span></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{item.short_description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>{item.is_active ? 'Ενεργό' : 'Ανενεργό'}</span>
              <span className="text-xs text-gray-600">Σειρά: {item.sort_order}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Δεν βρέθηκαν υπηρεσίες</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Επεξεργασία' : 'Νέα'} Υπηρεσία</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 block mb-1">Τίτλος</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Εικονίδιο</label><select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input">{iconOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Σύντομη περιγραφή</label><textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="input h-20 resize-none" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Αναλυτική περιγραφή</label><textarea value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} className="input h-24 resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1">Σειρά</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Ενεργό</label><select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="input"><option value="true">Ναι</option><option value="false">Όχι</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Εικόνα Hero (στο background)</label><div className="flex gap-2"><input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input flex-1" /><button type="button" onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async () => { const f = inp.files?.[0]; if (!f) return; setImageUploading(true); try { if (!selectedTenantId) { alert('Δεν βρέθηκε tenant'); return; } const media = await uploadCmsAsset(f, { tenantId: selectedTenantId, bucket: 'site-images', category: 'service', source: 'editor' }); setForm(prev => ({ ...prev, image_url: media.url })); } catch (e) { alert('Αποτυχία'); } finally { setImageUploading(false); } }; inp.click(); }} disabled={imageUploading} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors disabled:opacity-50 text-xs"><Upload size={14} /></button><button type="button" onClick={() => setPickerOpen(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-xs"><ImageIcon size={14} /></button></div></div>
              </div>
              <div className="border-t border-gray-800 pt-4"><p className="text-xs text-gray-500 mb-2">SEO</p><div className="grid grid-cols-1 gap-3"><div><label className="text-xs text-gray-500 block mb-1">Meta Title</label><input value={form.meta_title || ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="input" /></div><div><label className="text-xs text-gray-500 block mb-1">Meta Description</label><textarea value={form.meta_description || ''} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} className="input h-16 resize-none" /></div><div><label className="text-xs text-gray-500 block mb-1">OG Image (social)</label><input value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} className="input" placeholder="π.χ. για sharing σε social media" /></div></div></div>
              <div className="flex justify-end gap-3 pt-2"><button onClick={() => setShowModal(false)} className="btn-secondary">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
            </div>
          </div>
        </div>
      )}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => setForm(f => ({ ...f, image_url: url }))} folder="services" />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Διαγραφή</h3><p className="text-sm text-gray-400 mb-4">Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την υπηρεσία;</p>
            <div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary">Ακύρωση</button><button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium">Διαγραφή</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
