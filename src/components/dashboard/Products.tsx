import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, X, Package, Star, Upload, Image as ImageIcon, GripVertical } from 'lucide-react';
import { productsHelper, categoriesHelper, siteSettingsHelper } from '../../lib/dataHelpers';
import { uploadImage } from '../../lib/storage';
import { Product, Category } from '../../types/supabase';
import MediaPicker from './MediaPicker';

const emptyForm = { name: '', slug: '', description: '', price: '', compare_price: '', sku: '', stock_quantity: '', category_id: '', image_url: '', is_active: true, is_featured: false, sort_order: 0 };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([productsHelper.getAll(), categoriesHelper.getAll()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description, price: p.price.toString(),
      compare_price: p.compare_price?.toString() ?? '', sku: p.sku,
      stock_quantity: p.stock_quantity.toString(), category_id: p.category_id ?? '',
      image_url: p.image_url, is_active: p.is_active, is_featured: p.is_featured, sort_order: p.sort_order ?? 0,
    });
    setShowModal(true);
  };

  const syncImageToAboutBooks = async (imageUrl: string, name: string) => {
    if (!imageUrl || !name) return;
    const all = await siteSettingsHelper.getAll();
    const booksSetting = all.find(s => s.key === 'about_books');
    if (!booksSetting || !Array.isArray(booksSetting.value)) return;
    const books = booksSetting.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ]+/g, '-').replace(/^-|-$/g, '');
    let idx = -1;
    for (let i = 0; i < books.length; i++) {
      const bSlug = (books[i].title || '').toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ]+/g, '-').replace(/^-|-$/g, '');
      if (bSlug === slug || bSlug.includes(slug) || slug.includes(bSlug)) { idx = i; break; }
    }
    if (idx === -1) return;
    books[idx] = { ...books[idx], cover_image: imageUrl };
    await siteSettingsHelper.update(booksSetting.id, { value: books });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description, price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      sku: form.sku, stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || null, image_url: form.image_url,
      is_active: form.is_active, is_featured: form.is_featured, sort_order: parseInt(form.sort_order as any) || 0,
    };
    if (editing) {
      const updated = await productsHelper.update(editing.id, payload);
      setProducts(prev => prev.map(p => p.id === editing.id ? updated : p));
    } else {
      const created = await productsHelper.create(payload);
      setProducts(prev => [created, ...prev]);
    }
    if (form.image_url && form.sku?.startsWith('BOOK-')) {
      try { await syncImageToAboutBooks(form.image_url, form.name); } catch {}
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await productsHelper.delete(deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  const sorted = [...filtered].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setProducts(reordered.map((p, i) => ({ ...p, sort_order: (i + 1) * 10 })));
    setDragIdx(idx);
  }, [dragIdx, sorted]);

  const handleDragEnd = () => {
    setDragIdx(null);
    const updated = sorted.map((p, i) => ({ ...p, sort_order: (i + 1) * 10 }));
    setProducts(updated);
    const promises = updated.map(p => productsHelper.update(p.id, { sort_order: p.sort_order }));
    // Sync sort_order to about_books so frontend reflects the change
    Promise.all(promises).then(() => {
      siteSettingsHelper.getAll().then(all => {
        const bs = all.find(s => s.key === 'about_books');
        if (!bs || !Array.isArray(bs.value)) return;
        const books = [...bs.value];
        let changed = false;
        for (const p of updated) {
          if (!p.sku?.startsWith('BOOK-')) continue;
          const match = books.find((b: any) =>
            b.title.toLowerCase().includes(p.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()) ||
            p.name.toLowerCase().includes(b.title.toLowerCase())
          );
          if (match && match.sort_order !== p.sort_order) {
            match.sort_order = p.sort_order;
            changed = true;
          }
        }
        if (changed) siteSettingsHelper.update(bs.id, { value: books }).catch(() => {});
      });
    });
  };

  const formatter = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Προϊόντα</h2>
          <p className="text-sm text-gray-500">{products.length} συνολικά προϊόντα</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Νέο Προϊόν
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση προϊόντος..."
            className="input pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Προϊόν</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Κατηγορία</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Τιμή</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Απόθεμα</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Κατάσταση</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {sorted.map((product, idx) => (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`hover:bg-gray-800/30 transition-colors ${dragIdx === idx ? 'opacity-50 bg-gray-800/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 shrink-0"><GripVertical size={16} /></span>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                          <Package size={16} className="text-gray-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">{product.name}</span>
                          {product.is_featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="text-xs text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{(product.categories as Category)?.name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{formatter.format(product.price)}</div>
                    {product.compare_price && (
                      <div className="text-xs text-gray-600 line-through">{formatter.format(product.compare_price)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${product.stock_quantity <= 5 ? 'text-red-400' : product.stock_quantity <= 20 ? 'text-amber-400' : 'text-green-400'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${product.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                      {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(product.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">Δεν βρέθηκαν προϊόντα</div>
          )}
          {sorted.length > 0 && (
            <div className="px-4 py-2 text-[10px] text-gray-600 border-t border-gray-800/50 text-center">Σύρετε τις γραμμές για αλλαγή σειράς</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Επεξεργασία' : 'Νέο'} Προϊόν</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Όνομα</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Όνομα προϊόντος" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Τιμή (€)</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" step="0.01" className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Τιμή Σύγκρισης (€)</label>
                  <input value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} type="number" step="0.01" className="input" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="input" placeholder="SKU-001" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Απόθεμα</label>
                  <input value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} type="number" className="input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Κατηγορία</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input">
                  <option value="">— Χωρίς κατηγορία —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Εικόνα</label>
                <div className="flex gap-2">
                  <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input flex-1" placeholder="https://..." />
                  <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors disabled:opacity-50 text-xs" title="Μεταφόρτωση"><Upload size={14} /></button>
                  <button type="button" onClick={() => setPickerOpen(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-xs" title="Από τη βιβλιοθήκη"><ImageIcon size={14} /></button>
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageUploading(true);
                  try {
                    const url = await uploadImage(file, 'site-images');
                    setForm(f => ({ ...f, image_url: url }));
                  } catch { alert('Αποτυχία μεταφόρτωσης'); }
                  finally { setImageUploading(false); e.target.value = ''; }
                }} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Περιγραφή</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Περιγραφή προϊόντος..." />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-gray-300">Ενεργό</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-gray-300">Επιλεγμένο</span>
                </label>
                <div className="ml-auto">
                  <label className="text-xs text-gray-500 block mb-0.5">Σειρά</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input w-20 text-xs" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Ακύρωση</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => setForm(f => ({ ...f, image_url: url }))} />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Διαγραφή Προϊόντος</h3>
            <p className="text-gray-400 text-sm mb-6">Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν; Η ενέργεια δεν μπορεί να αναιρεθεί.</p>
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
