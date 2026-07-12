import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Mail, Phone, CalendarDays, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Νέο', color: 'bg-blue-900/30 text-blue-400' },
  { value: 'confirmed', label: 'Επιβεβαιωμένο', color: 'bg-green-900/30 text-green-400' },
  { value: 'cancelled', label: 'Ακυρωμένο', color: 'bg-red-900/30 text-red-400' },
  { value: 'completed', label: 'Ολοκληρωμένο', color: 'bg-gray-700 text-gray-400' },
];

export default function BookingsManager() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(supabase.from('booking_submissions').select('*').order('created_at', { ascending: false }), effectiveTenantId);
    setItems(data || []); setLoading(false);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filterStatus === 'all' ? items : items.filter(i => i.status === filterStatus);
  const unread = items.filter(i => !i.read).length;

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('booking_submissions').update({ status }).eq('id', id).eq('tenant_id', effectiveTenantId);
    if (selected?.id === id) setSelected({ ...selected, status });
    await load();
  };

  const markRead = async (id: string) => {
    await supabase.from('booking_submissions').update({ read: true }).eq('id', id).eq('tenant_id', effectiveTenantId);
    if (selected?.id === id) setSelected({ ...selected, read: true });
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">Κρατήσεις</h2><p className="text-sm text-gray-500">{items.length} συνολικά{unread > 0 ? ` · ${unread} μη αναγνωσμένες` : ''}</p></div>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white"><RefreshCw size={14} /> Ανανέωση</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filterStatus === 'all' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>Όλες</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setFilterStatus(s.value)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filterStatus === s.value ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>{s.label} ({items.filter(i => i.status === s.value).length})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">Δεν υπάρχουν κρατήσεις.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* List */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filtered.map(item => (
              <div key={item.id} onClick={() => { setSelected(item); if (!item.read) markRead(item.id); }} className={`cursor-pointer rounded-lg border px-4 py-3 transition-colors ${selected?.id === item.id ? 'border-blue-500/50 bg-blue-900/20' : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'} ${!item.read ? 'border-l-2 border-l-blue-500' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white truncate">{item.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${STATUS_OPTIONS.find(s => s.value === item.status)?.color || ''}`}>{STATUS_OPTIONS.find(s => s.value === item.status)?.label}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                  <span>{item.email}</span>
                  {item.arrival_date && <span>· {item.arrival_date}{item.departure_date ? ` → ${item.departure_date}` : ''}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-6">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{selected.name}</h3>
                  <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400"><Mail size={14} /><a href={`mailto:${selected.email}`} className="text-blue-400 hover:underline">{selected.email}</a></div>
                  {selected.phone && <div className="flex items-center gap-2 text-gray-400"><Phone size={14} /><span>{selected.phone}</span></div>}
                  {selected.arrival_date && <div className="flex items-center gap-2 text-gray-400"><CalendarDays size={14} /><span>{selected.arrival_date}{selected.departure_date ? ` → ${selected.departure_date}` : ''}</span></div>}
                  {selected.guests && <div className="flex items-center gap-2 text-gray-400"><UsersIcon size={14} /><span>{selected.guests} επισκέπτες</span></div>}
                  {selected.message && <div className="flex items-start gap-2 text-gray-400"><MessageSquare size={14} className="mt-0.5" /><p className="text-gray-300">{selected.message}</p></div>}
                </div>
                <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-600">
                  <p>Υποβλήθηκε: {new Date(selected.created_at).toLocaleString('el-GR')}</p>
                  <p>ID: {selected.id.slice(0, 8)}...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Επιλέξτε κράτηση για προβολή στοιχείων
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
