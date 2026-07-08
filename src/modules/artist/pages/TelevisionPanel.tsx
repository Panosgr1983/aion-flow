import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { televisionHelper } from '../db/queries';
import type { TelevisionEntry } from '../types/artist';

export default function TelevisionPanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<TelevisionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    televisionHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένες τηλεοπτικές εμφανίσεις.</div>;

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-lg border border-gray-800">
        {items.map((show, i) => (
          <details key={show.id} className={`group border-b border-gray-800 last:border-b-0 ${i % 2 === 0 ? 'bg-gray-900/30' : 'bg-transparent'}`}>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-mono text-blue-400 shrink-0">{show.year}</span>
                <span className="text-gray-300 truncate">{show.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-gray-500">{show.channel}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500">{show.role}</span>
              </div>
            </summary>
            {show.description && (
              <div className="border-t border-gray-800 px-4 pb-3 pt-2">
                <p className="text-xs text-gray-500 leading-relaxed">{show.description}</p>
              </div>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
