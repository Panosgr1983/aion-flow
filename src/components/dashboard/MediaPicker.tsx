import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { mediaHelper, MEDIA_FOLDERS } from '../../lib/dataHelpers';
import { Media } from '../../types/supabase';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder?: string;
}

export default function MediaPicker({ open, onClose, onSelect, folder }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState(folder || 'all');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    mediaHelper.getAll().then(m => { setMedia(m); setLoading(false); });
  }, [open]);

  const filtered = media.filter(m => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase()) || m.folder.toLowerCase().includes(search.toLowerCase());
    const mf = folderFilter === 'all' || m.folder === folderFilter;
    return ms && mf;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-w-4xl w-full max-h-[80vh] flex flex-col p-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold">Επιλογή εικόνας</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9" />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {[['all', 'Όλα'] as const, ...MEDIA_FOLDERS.map(f => [f.value, f.label] as const)].map(([value, label]) => (
                <button key={value} onClick={() => setFolderFilter(value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${folderFilter === value ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="size-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map(item => (
                <button key={item.id} onClick={() => { onSelect(item.url); onClose(); }} className="card overflow-hidden hover:border-blue-500/50 transition-all text-left group">
                  <div className="aspect-square bg-gray-800">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="p-2">
                    <div className="text-xs truncate">{item.name}</div>
                    {item.folder && <div className="text-[10px] text-gray-500 mt-0.5">{item.folder}</div>}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Δεν βρέθηκαν αρχεία</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
