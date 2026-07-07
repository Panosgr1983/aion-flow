import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Award } from 'lucide-react';
import { credentialsHelper } from '../../lib/dataHelpers';
import { Credential } from '../../types/supabase';

const emptyForm: Partial<Credential> = { tenant_id: null, title: '', description: '', icon: 'graduation-cap', image_url: '', sort_order: 0, is_active: true };

export default function Credentials() {
  const [items, setItems] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Credential | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { credentialsHelper.getAll().then(d => { setItems(d); setLoading(false); }); }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, sort_order: items.length + 1 }); setShowModal(true); };
  const openEdit = (item: Credential) => { setEditing(item); setForm(item); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) { const updated = await credentialsHelper.update(editing.id, form); setItems(prev => prev.map(i => i.id === editing.id ? updated : i)); }
    else { const created = await credentialsHelper.create(form); setItems(prev => [...prev, created]); }
    setSaving(false); setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return; await credentialsHelper.delete(deleteId); setItems(prev => prev.filter(i => i.id !== deleteId)); setDeleteId(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Πιστοποιήσεις</h2><p className="text-sm text-gray-500">{items.length} πιστοποιήσεις</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Νέα Πιστοποίηση</button>
      </div>
      <div className="card p-4"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9" /></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="card p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center"><Award size={18} className="text-purple-400" /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500">{item.description}</p>
            <div className="mt-3"><span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>{item.is_active ? 'Ενεργό' : 'Ανενεργό'}</span></div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Δεν βρέθηκαν πιστοποιήσεις</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Επεξεργασία' : 'Νέα'} Πιστοποίηση</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 block mb-1">Τίτλος</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Περιγραφή</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input h-16 resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1">Σειρά</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Ενεργό</label><select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="input"><option value="true">Ναι</option><option value="false">Όχι</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Εικόνα URL</label><input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2"><button onClick={() => setShowModal(false)} className="btn-secondary">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Διαγραφή</h3><p className="text-sm text-gray-400 mb-4">Είσαι σίγουρος;</p>
            <div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary">Ακύρωση</button><button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium">Διαγραφή</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
