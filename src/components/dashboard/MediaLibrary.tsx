import { useEffect, useState, useRef } from 'react';
import { Search, Trash2, Grid2x2 as Grid, List, CheckSquare, Square, Upload } from 'lucide-react';
import { mediaHelper, FOLDER_OPTIONS, FOLDER_LABELS, MEDIA_FOLDERS, FolderCategory } from '../../lib/dataHelpers';
import { trackEvent } from '../../lib/analytics';
import { Media } from '../../types/supabase';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
}

export default function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => mediaHelper.getAll().then(m => { setMedia(m); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = media.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.folder.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = folderFilter === 'all' || m.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const folder = window.prompt('Φάκελος προορισμού:\n\nΔιαθέσιμοι: ' + FOLDER_OPTIONS.map(f => FOLDER_LABELS[f] || f).join(', '), 'general') || 'general';
    const normalizedFolder = FOLDER_OPTIONS.includes(folder as any) ? folder : 'general';
    try {
      await mediaHelper.upload(file, normalizedFolder);
      await load();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Αποτυχία μεταφόρτωσης.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    const count = selected.size;
    for (const id of selected) { await mediaHelper.delete(id); }
    setMedia(prev => prev.filter(m => !selected.has(m.id)));
    setSelected(new Set());
    trackEvent('cms.media_deleted', { count }).catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Πολυμέσα</h2>
          <p className="text-sm text-gray-500">{media.length} αρχεία</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleDeleteSelected} className="btn-danger"><Trash2 size={14} /> Διαγραφή ({selected.size})</button>
          )}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary">
            {uploading ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={14} />} Μεταφόρτωση
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []); files.forEach(handleUpload); e.target.value = ''; }} />
          <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl transition-colors ${view === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:bg-gray-800'}`}><Grid size={16} /></button>
          <button onClick={() => setView('list')} className={`p-2.5 rounded-xl transition-colors ${view === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:bg-gray-800'}`}><List size={16} /></button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση αρχείων..." className="input pl-9" />
          </div>
          <div className="flex gap-1">
            {[['all', 'Όλα'] as const, ...MEDIA_FOLDERS.map(f => [f.value, f.label] as const)].map(([value, label]) => (
              <button key={value} onClick={() => setFolderFilter(value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${folderFilter === value ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className={`card overflow-hidden group cursor-pointer transition-all duration-200 ${selected.has(item.id) ? 'border-blue-500/50 ring-1 ring-blue-500/30' : 'hover:border-gray-700'}`}
              onClick={() => { if (onSelect) onSelect(item); else setPreview(item); }}
            >
              <div className="relative aspect-square bg-gray-800">
                <img src={item.url} alt={item.alt_text || item.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <button onClick={e => { e.stopPropagation(); toggleSelect(item.id); }} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {selected.has(item.id) ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} className="text-white/70" />}
                </button>
              </div>
              <div className="p-2.5">
                <div className="text-xs font-medium truncate">{item.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatSize(item.size)}</span>
                  {item.folder && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{FOLDER_LABELS[item.folder] || item.folder}</span>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-5 text-center py-12 text-gray-500 card p-8">Δεν βρέθηκαν αρχεία</div>}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 w-10" />
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Αρχείο</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Φάκελος</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Μέγεθος</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Διαστάσεις</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors" onClick={() => { if (onSelect) onSelect(item); }}>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); toggleSelect(item.id); }}>
                      {selected.has(item.id) ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} className="text-gray-600" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={item.url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.mime_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{FOLDER_LABELS[item.folder] || item.folder || '—'}</span></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-gray-400">{formatSize(item.size)}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-gray-400">{item.width && item.height ? `${item.width}×${item.height}` : '—'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); mediaHelper.delete(item.id).then(load); }} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Δεν βρέθηκαν αρχεία</div>}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="card max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
            <img src={preview.url} alt={preview.alt_text || preview.name} className="w-full rounded-xl object-contain max-h-96" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div><div className="text-xs text-gray-500">Όνομα</div><div className="font-medium">{preview.name}</div></div>
              <div><div className="text-xs text-gray-500">Μέγεθος</div><div className="font-medium">{formatSize(preview.size)}</div></div>
              <div><div className="text-xs text-gray-500">Τύπος</div><div className="font-medium">{preview.mime_type}</div></div>
            </div>
            <div className="mt-3 p-2 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">URL</div>
              <div className="text-xs font-mono text-gray-300 truncate">{preview.url}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
