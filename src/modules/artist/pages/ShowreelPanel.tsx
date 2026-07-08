import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { showreelHelper } from '../db/queries';
import type { Showreel } from '../types/artist';
import { Play, ExternalLink } from 'lucide-react';

export default function ShowreelPanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<Showreel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    showreelHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένα showreels.</div>;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {items.map(reel => (
        <div key={reel.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-medium text-white">{reel.title}</h3>
              {reel.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{reel.description}</p>}
              {reel.platform && <span className="text-[10px] text-gray-600">{reel.platform}</span>}
            </div>
            {reel.url && (
              <a href={reel.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:text-white shrink-0">
                <Play className="h-3 w-3" /> Play
              </a>
            )}
          </div>
          <div className="mt-2 text-[10px] text-gray-600">sort: {reel.sort_order}</div>
        </div>
      ))}
    </div>
  );
}
