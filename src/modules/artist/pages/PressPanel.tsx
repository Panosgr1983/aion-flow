import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { pressHelper } from '../db/queries';
import type { PressItem } from '../types/artist';
import { ExternalLink } from 'lucide-react';

export default function PressPanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    pressHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένα δημοσιεύματα.</div>;

  return (
    <div className="space-y-3 p-6">
      {items.map(item => (
        <div key={item.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-medium text-white">{item.title}</h3>
              <div className="flex gap-2 text-[10px] text-gray-500">
                {item.publication && <span>{item.publication}</span>}
                {item.date && <><span>•</span><span>{item.date}</span></>}
              </div>
              {item.excerpt && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.excerpt}</p>}
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:text-white shrink-0">
                Άνοιγμα <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="mt-2 flex gap-2 text-[10px] text-gray-600">
            <span>sort: {item.sort_order}</span>
            <span>status: {item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
