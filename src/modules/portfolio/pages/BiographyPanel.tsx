import { useEffect, useState } from 'react';
import { useTenant } from '../../../lib/useTenant';
import { biographiesHelper } from '../db/queries';
import type { Biographies } from '../types/artist';

export default function BiographyPanel() {
  const { effectiveTenantId } = useTenant();
  const [data, setData] = useState<Biographies | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveTenantId) return;
    biographiesHelper.getAll(effectiveTenantId).then(items => {
      setData(items[0] || null);
      setLoading(false);
    });
  }, [effectiveTenantId]);

  if (loading) return <div className="text-gray-400 text-sm p-6">Φόρτωση...</div>;
  if (!data) return <div className="text-gray-400 text-sm p-6">Δεν υπάρχει καταχωρημένο βιογραφικό.</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Σύντομο βιογραφικό</span>
          <p className="text-sm text-gray-300">{data.short_bio || '—'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Έτος γέννησης</span>
          <p className="text-sm text-gray-300">{data.birth_year || '—'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Τόπος γέννησης</span>
          <p className="text-sm text-gray-300">{data.birth_place || '—'}</p>
        </div>
        {data.pseudonyms && data.pseudonyms.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Ψευδώνυμα</span>
            <p className="text-sm text-gray-300">{data.pseudonyms.join(', ')}</p>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">Περιεχόμενο</span>
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{data.content}</div>
      </div>
      <div className="flex gap-2 text-[10px] text-gray-500">
        <span>Κατάσταση: {data.status}</span>
        <span>•</span>
        <span>Επαληθευμένο: {data.verified ? 'Ναι' : 'Όχι'}</span>
      </div>
    </div>
  );
}
