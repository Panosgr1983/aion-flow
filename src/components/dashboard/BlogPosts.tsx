import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { blogPostsHelper } from '../../lib/dataHelpers';
import { uploadCmsAsset } from '../../lib/media';
import { useTenantContext } from '../../lib/TenantContext';
import { BlogPost } from '../../types/supabase';
import RichEditor from './RichEditor';
import MediaPicker from './MediaPicker';

const emptyForm: Partial<BlogPost> = { tenant_id: null, title: '', slug: '', excerpt: '', content: {}, category: '', image_url: '', is_published: false, published_at: null, meta_title: '', meta_description: '', og_image: '' };

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function BlogPosts() {
  const { selectedTenantId } = useTenantContext();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [heroUploading, setHeroUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { blogPostsHelper.getAll().then(d => { setItems(d); setLoading(false); }); }, []);

  const filtered = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'published') return i.is_published;
    if (filterStatus === 'draft') return !i.is_published;
    return true;
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item: BlogPost) => {
    const c = item.content;
    let content = c || {};
    if (c && typeof c === 'object' && !c.type && (c as any).html) {
      content = (c as any).html;
    }
    setEditing(item);
    setForm({ ...item, content });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.title || ''), published_at: form.is_published ? (form.published_at || new Date().toISOString()) : null };
    if (editing) {
      const updated = await blogPostsHelper.update(editing.id, payload);
      setItems(prev => prev.map(i => i.id === editing.id ? updated : i));
    } else {
      const created = await blogPostsHelper.create(payload);
      setItems(prev => [...prev, created]);
    }
    setSaving(false); setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await blogPostsHelper.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('el-GR', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Blog</h2><p className="text-sm text-gray-500">{items.filter(i => i.is_published).length} δημοσιευμένα · {items.filter(i => !i.is_published).length} προσχέδια</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Νέο Άρθρο</button>
      </div>

      <div className="card p-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση άρθρων..." className="input pl-9" /></div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>
                {s === 'all' ? 'Όλα' : s === 'published' ? 'Δημοσιευμένα' : 'Προσχέδια'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="card overflow-hidden hover:border-gray-700 transition-colors">
            {item.image_url && <div className="h-32 bg-gray-800 overflow-hidden"><img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /></div>}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>{item.is_published ? 'Δημοσιευμένο' : 'Προσχέδιο'}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{item.category}</span>
                <span>{formatDate(item.published_at)}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Δεν βρέθηκαν άρθρα</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Επεξεργασία' : 'Νέο'} Άρθρο</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1">Τίτλος</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1">Κατηγορία</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Εικόνα URL</label><div className="flex gap-2"><input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input flex-1" /><button type="button" onClick={() => heroInputRef.current?.click()} disabled={heroUploading} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors disabled:opacity-50 text-xs" title="Μεταφόρτωση"><Upload size={14} /></button><button type="button" onClick={() => setPickerOpen(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-xs" title="Από τη βιβλιοθήκη"><ImageIcon size={14} /></button></div><input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setHeroUploading(true); try { if (!selectedTenantId) { alert('Δεν βρέθηκε tenant'); return; } const media = await uploadCmsAsset(file, { tenantId: selectedTenantId, bucket: 'blog-images', category: 'blog', source: 'editor' }); setForm(f => ({ ...f, image_url: media.url })); } catch (err) { alert('Αποτυχία μεταφόρτωσης'); } finally { setHeroUploading(false); e.target.value = ''; } }} /><MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => setForm(f => ({ ...f, image_url: url }))} folder="blog" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Κατάσταση</label><select value={form.is_published ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_published: e.target.value === 'true' }))} className="input"><option value="false">Προσχέδιο</option><option value="true">Δημοσιευμένο</option></select></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Απόσπασμα</label><textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="input h-16 resize-none" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Περιεχόμενο</label><RichEditor content={form.content} onChange={json => setForm(f => ({ ...f, content: json }))} /></div>
              <div className="border-t border-gray-800 pt-4"><p className="text-xs text-gray-500 mb-2">SEO</p><div className="grid grid-cols-3 gap-3"><div><label className="text-xs text-gray-500 block mb-1">Meta Title</label><input value={form.meta_title || ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="input" /></div><div><label className="text-xs text-gray-500 block mb-1">Meta Description</label><textarea value={form.meta_description || ''} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} className="input h-16 resize-none" /></div><div><label className="text-xs text-gray-500 block mb-1">OG Image</label><input value={form.og_image || ''} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} className="input" /></div></div></div>
              <div className="flex justify-end gap-3 pt-2"><button onClick={() => setShowModal(false)} className="btn-secondary">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Διαγραφή</h3><p className="text-sm text-gray-400 mb-4">Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το άρθρο;</p>
            <div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary">Ακύρωση</button><button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium">Διαγραφή</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
