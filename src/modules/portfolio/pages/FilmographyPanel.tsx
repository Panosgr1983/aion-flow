import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { filmographyHelper } from '../db/queries';
import type { FilmographyEntry } from '../types/artist';
import { ExternalLink, Play } from 'lucide-react';

export default function FilmographyPanel() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<FilmographyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    filmographyHelper.getAll(effectiveTenantId).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (items.length === 0) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχουν καταχωρημένες ταινίες.</div>;

  return (
    <div className="space-y-3 p-6">
      {items.map(film => (
        <div key={film.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-medium text-white">{film.title}</h3>
              {film.title_en && <p className="text-xs text-gray-500">{film.title_en}</p>}
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                <span>{film.year}</span>
                {film.genre && <><span>•</span><span>{film.genre}</span></>}
                {film.director && <><span>•</span><span>{film.director}</span></>}
                {film.duration && <><span>•</span><span>{film.duration} min</span></>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {film.imdb_url && (
                <a href={film.imdb_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  IMDb <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {film.trailer_url && (
                <a href={film.trailer_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <Play className="h-3 w-3" /> Trailer
                </a>
              )}
            </div>
          </div>
          {film.description && <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{film.description}</p>}
          <div className="mt-2 flex gap-3 text-[10px] text-gray-600">
            <span>sort: {film.sort_order}</span>
            <span>status: {film.status}</span>
            {film.verified && <span>✓ verified</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
