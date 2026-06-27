import { useEffect, useState } from 'react';
import { Search, Trash2, X, Users, Mail, Phone, Award } from 'lucide-react';
import { customersHelper } from '../../lib/dataHelpers';
import { Customer } from '../../types/supabase';

const MEMBERSHIP_COLORS: Record<string, string> = {
  bronze: 'bg-amber-700/30 text-amber-600',
  silver: 'bg-gray-500/20 text-gray-400',
  gold: 'bg-amber-500/20 text-amber-400',
  platinum: 'bg-blue-500/20 text-blue-400',
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum',
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    customersHelper.getAll().then(c => { setCustomers(c); setLoading(false); });
  }, []);

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    await customersHelper.delete(deleteId);
    setCustomers(prev => prev.filter(c => c.id !== deleteId));
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
  };

  const formatter = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Πελάτες</h2>
          <p className="text-sm text-gray-500">{customers.length} συνολικά πελάτες</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['platinum', 'gold', 'silver', 'bronze'].map(level => {
          const count = customers.filter(c => c.membership_level === level).length;
          return (
            <div key={level} className="card p-4 text-center">
              <div className={`badge mx-auto mb-2 ${MEMBERSHIP_COLORS[level]}`}>{MEMBERSHIP_LABELS[level]}</div>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-gray-500">πελάτες</div>
            </div>
          );
        })}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση πελάτη..." className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Πελάτης</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Membership</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Παραγγελίες</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Σύνολο Αγορών</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                        {customer.first_name[0]}{customer.last_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{customer.first_name} {customer.last_name}</div>
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Award size={12} className="text-amber-400" />
                      <span className={`badge text-xs ${MEMBERSHIP_COLORS[customer.membership_level]}`}>{MEMBERSHIP_LABELS[customer.membership_level]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm font-medium">{customer.total_orders}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold">{formatter.format(customer.total_spent)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setSelected(customer)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Προφίλ</button>
                      <button onClick={() => setDeleteId(customer.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Δεν βρέθηκαν πελάτες</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Προφίλ Πελάτη</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">
                  {selected.first_name[0]}{selected.last_name[0]}
                </div>
                <div>
                  <div className="text-lg font-semibold">{selected.first_name} {selected.last_name}</div>
                  <span className={`badge text-xs ${MEMBERSHIP_COLORS[selected.membership_level]}`}>{MEMBERSHIP_LABELS[selected.membership_level]}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400 shrink-0" /><span className="text-xs truncate">{selected.email}</span></div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Τηλέφωνο</div>
                  <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400 shrink-0" /><span className="text-xs">{selected.phone || '—'}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 text-center">
                  <div className="text-xl font-bold">{selected.total_orders}</div>
                  <div className="text-xs text-gray-500">Παραγγελίες</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-lg font-bold">{formatter.format(selected.total_spent)}</div>
                  <div className="text-xs text-gray-500">Σύνολο</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-xl font-bold">{selected.loyalty_points}</div>
                  <div className="text-xs text-gray-500">Πόντοι</div>
                </div>
              </div>
              {selected.notes && (
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Σημειώσεις</div>
                  <div className="text-sm text-gray-300">{selected.notes}</div>
                </div>
              )}
              <div className="text-xs text-gray-600">Μέλος από: {new Date(selected.created_at).toLocaleDateString('el-GR')}</div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Διαγραφή Πελάτη</h3>
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
