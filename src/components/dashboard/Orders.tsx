import { useEffect, useState } from 'react';
import { Search, ChevronDown, X, ShoppingCart } from 'lucide-react';
import { ordersHelper } from '../../lib/dataHelpers';
import { Order, OrderStatus } from '../../types/supabase';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  shipped: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Εκκρεμεί', confirmed: 'Επιβεβαιωμένη', processing: 'Επεξεργασία',
  shipped: 'Εστάλη', delivered: 'Παραδόθηκε', cancelled: 'Ακυρώθηκε', refunded: 'Επιστράφηκε',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Εκκρεμεί', paid: 'Πληρώθηκε', failed: 'Απέτυχε', refunded: 'Επιστράφηκε', partially_refunded: 'Μερ. Επιστροφή',
};

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    ordersHelper.getAll().then(o => { setOrders(o); setLoading(false); });
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      `${o.customers?.first_name} ${o.customers?.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const updated = await ordersHelper.update(orderId, { status: newStatus });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    setUpdatingId(null);
  };

  const formatter = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Παραγγελίες</h2>
          <p className="text-sm text-gray-500">{orders.length} συνολικά παραγγελίες</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση παραγγελίας..." className="input pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-full sm:w-48">
          <option value="">Όλες οι καταστάσεις</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Αρ. Παραγγελίας</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Πελάτης</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Σύνολο</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Κατάσταση</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Πληρωμή</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ημερομηνία</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={14} className="text-gray-600" />
                      <span className="font-medium text-sm">{order.order_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm">{order.customers?.first_name} {order.customers?.last_name}</div>
                    <div className="text-xs text-gray-500">{order.customers?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold">{formatter.format(order.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                        className={`badge border text-xs cursor-pointer appearance-none pr-5 ${STATUS_COLORS[order.status]} disabled:opacity-50`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`badge text-xs ${order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                      {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('el-GR')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Λεπτομέρειες</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Δεν βρέθηκαν παραγγελίες</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{selected.order_number}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Πελάτης</div>
                  <div className="text-sm font-medium">{selected.customers?.first_name} {selected.customers?.last_name}</div>
                  <div className="text-xs text-gray-500">{selected.customers?.email}</div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Πληρωμή</div>
                  <div className="text-sm font-medium">{formatter.format(selected.total)}</div>
                  <div className="text-xs text-gray-500">{selected.payment_method}</div>
                </div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-gray-500 mb-2">Κατάσταση</div>
                <span className={`badge border text-sm ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span>
              </div>
              {selected.tracking_number && (
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Αριθμός Παρακολούθησης</div>
                  <div className="text-sm font-mono">{selected.tracking_number}</div>
                </div>
              )}
              {selected.notes && (
                <div className="card p-3">
                  <div className="text-xs text-gray-500 mb-1">Σημειώσεις</div>
                  <div className="text-sm text-gray-300">{selected.notes}</div>
                </div>
              )}
              <div className="text-xs text-gray-600">Δημιουργήθηκε: {new Date(selected.created_at).toLocaleString('el-GR')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
