import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, X, Tag, Package } from 'lucide-react';
import { categoriesHelper } from '../../lib/dataHelpers';
import { Category } from '../../types/supabase';

const emptyForm = { name: '', slug: '', description: '', seo_title: '', seo_description: '', is_active: true };

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    categoriesHelper.getAll().then(cats => { setCategories(cats); setLoading(false); });
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description, seo_title: c.seo_title, seo_description: c.seo_description, is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    if (editing) {
      const updated = await categoriesHelper.update(editing.id, payload);
      setCategories(prev => prev.map(c => c.id === editing.id ? updated : c));
    } else {
      const created = await categoriesHelper.create(payload);
      setCategories(prev => [...prev, created]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await categoriesHelper.delete(deleteId);
    setCategories(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Κατηγορίες</h2>
          <p className="text-sm text-gray-500">{categories.length} συνολικά κατηγορίες</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Νέα Κατηγορία</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση κατηγορίας..." className="input pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cat => (
          <div key={cat.id} className="card p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Tag size={18} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
            <p className="text-xs text-gray-500 mb-3 truncate">{cat.description || 'Χωρίς περιγραφή'}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-mono">/{cat.slug}</span>
              <div className="flex items-center gap-1">
                {cat.product_count !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Package size={11} />
                    {cat.product_count}
                  </div>
                )}
                <span className={`badge text-xs ml-2 ${cat.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                  {cat.is_active ? 'Ενεργή' : 'Ανενεργή'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500 card p-8">Δεν βρέθηκαν κατηγορίες</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Επεξεργασία' : 'Νέα'} Κατηγορία</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Όνομα</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="input" placeholder="Όνομα κατηγορίας" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input font-mono" placeholder="category-slug" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Περιγραφή</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input resize-none" placeholder="Περιγραφή κατηγορίας..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">SEO Τίτλος</label>
                <input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} className="input" placeholder="SEO Τίτλος" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">SEO Περιγραφή</label>
                <textarea value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} rows={2} className="input resize-none" placeholder="Meta description..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm text-gray-300">Ενεργή</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Ακύρωση</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Διαγραφή Κατηγορίας</h3>
            <p className="text-gray-400 text-sm mb-6">Είστε σίγουροι; Η ενέργεια δεν μπορεί να αναιρεθεί.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Ακύρωση</button>
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Διαγραφή</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
