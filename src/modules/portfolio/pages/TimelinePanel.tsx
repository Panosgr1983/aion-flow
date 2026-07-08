import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { timelineHelper } from '../db/queries';
import type { CareerTimeline } from '../types/artist';
import { Film, Monitor, Theater, Award, User, FileText } from 'lucide-react';

const iconMap: Record<string, any> = { film: Film, tv: Monitor, theatre: Theater, award: Award, personal: User };
const categoryLabels: Record<string, string> = { film: 'Κινηματογράφος', tv: 'Τηλεόραση', theatre: 'Θέατρο', award: 'Βραβείο', personal: 'Προσωπικό' };

export default function TimelinePanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<CareerTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    timelineHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένα γεγονότα χρονολογίου.</div>;

  return (
    <div className="p-6">
      <div className="relative pl-10">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-800" />
        {items.map((event, i) => {
          const Icon = iconMap[event.category] || FileText;
          return (
            <div key={event.id} className="relative pb-8 last:pb-0">
              <div className="absolute left-[-31px] top-0 flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gray-900">
                <Icon className="h-4 w-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-blue-400">{event.year}{event.month ? `/${event.month}` : ''}</span>
                  <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-500">{categoryLabels[event.category] || event.category}</span>
                  <span className="text-[10px] text-gray-600">sort: {event.sort_order}</span>
                </div>
                <h3 className="text-sm font-medium text-white">{event.title}</h3>
                {event.title_en && <p className="text-xs text-gray-500">{event.title_en}</p>}
                {event.description && <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
