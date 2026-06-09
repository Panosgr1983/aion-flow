import { useEffect, useState } from 'react';
import { Search, Trash2, Mail, MailOpen, RefreshCw } from 'lucide-react';
import { contactSubmissionsHelper } from '../../lib/dataHelpers';
import { ContactSubmission } from '../../types/supabase';

export default function ContactMessages() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const d = await contactSubmissionsHelper.getAll();
    const sorted = d.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setItems(sorted);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (item: ContactSubmission) => {
    const updated = await contactSubmissionsHelper.update(item.id, { read: !item.read });
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await contactSubmissionsHelper.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    i.message.toLowerCase().includes(search.toLowerCase())
  );

  const unread = items.filter(i => !i.read).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Μηνύματα Επικοινωνίας</h2>
          <p className="text-sm text-gray-500">
            {items.length} μηνύματα
            {unread > 0 && <span className="text-blue-400 ml-1">({unread} αδιάβαστα)</span>}
          </p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={16} /></button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className={`card p-5 transition-colors ${!item.read ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${!item.read ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <a href={`mailto:${item.email}`} className="hover:text-blue-400">{item.email}</a>
                      {item.phone && <span>{item.phone}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.message}</p>
                <p className="text-xs text-gray-600 mt-2">{new Date(item.created_at).toLocaleString('el-GR')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleRead(item)}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  title={item.read ? 'Σημείωση ως μη αναγνωσμένο' : 'Σημείωση ως αναγνωσμένο'}
                >
                  {item.read ? <MailOpen size={15} /> : <Mail size={15} />}
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Διαγραφή"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <MailOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Δεν υπάρχουν μηνύματα</p>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Διαγραφή μηνύματος;</h3>
            <p className="text-sm text-gray-400 mb-5">Η ενέργεια δεν μπορεί να αναιρεθεί.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-ghost">Ακύρωση</button>
              <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700">Διαγραφή</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
