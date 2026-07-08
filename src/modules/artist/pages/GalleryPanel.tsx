import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { galleryHelper } from '../db/queries';
import type { GalleryItem } from '../types/artist';
import { ImageIcon } from 'lucide-react';

export default function GalleryPanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    galleryHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένες φωτογραφίες.</div>;

  return (
    <div className="p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
          <div key={item.id} className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.alt_text || item.caption || ''} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div className="p-3 space-y-1">
              {item.caption && <p className="text-xs text-gray-300 truncate">{item.caption}</p>}
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span>{item.category}</span>
                {item.photographer && <><span>•</span><span>© {item.photographer}</span></>}
                <span>sort: {item.sort_order}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
