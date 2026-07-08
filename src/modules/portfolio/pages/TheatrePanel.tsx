import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { theatreHelper } from '../db/queries';
import type { TheatreEntry } from '../types/artist';

export default function TheatrePanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<TheatreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    theatreHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένες θεατρικές παραστάσεις.</div>;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {items.map(play => (
        <div key={play.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-blue-400">{play.year}</span>
            {play.venue && <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-500">{play.venue}</span>}
          </div>
          <h3 className="text-sm font-medium text-white">{play.title}</h3>
          {play.playwright && <p className="mt-1 text-xs text-gray-500">Συγγραφέας: {play.playwright}</p>}
          {play.role && <p className="text-xs text-gray-500">Ρόλος: {play.role}</p>}
          {play.notes && <p className="mt-2 text-xs text-gray-500 leading-relaxed">{play.notes}</p>}
          <div className="mt-2 flex gap-2 text-[10px] text-gray-600">
            <span>sort: {play.sort_order}</span>
            <span>status: {play.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
