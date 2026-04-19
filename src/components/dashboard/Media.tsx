import React, { useState, useEffect } from 'react';
import { Upload, Search, Download, Trash2, Image, File, Video } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function Media() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Mock data - θα αντικατασταθεί με Supabase storage
  useEffect(() => {
    const mockMedia: MediaItem[] = [
      {
        id: '1',
        name: 'product-image-1.jpg',
        url: 'https://via.placeholder.com/300x200',
        type: 'image/jpeg',
        size: 245760,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'banner-image.png',
        url: 'https://via.placeholder.com/800x400',
        type: 'image/png',
        size: 512000,
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        name: 'product-catalog.pdf',
        url: '#',
        type: 'application/pdf',
        size: 2048000,
        createdAt: '2024-02-01'
      }
    ];

    setTimeout(() => {
      setMediaItems(mockMedia);
      setLoading(false);
    }, 500);
  }, []);

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-green-400" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-blue-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // Mock upload - θα αντικατασταθεί με Supabase storage
    setTimeout(() => {
      const newItems = Array.from(files).map((file, i) => ({
        id: Date.now().toString() + i,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString().split('T')[0]
      }));

      setMediaItems([...mediaItems, ...newItems]);
      setUploading(false);
    }, 1000);
  };

  const handleDelete = (ids: string[]) => {
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε ${ids.length} αρχείο(α);`)) {
      setMediaItems(mediaItems.filter(item => !ids.includes(item.id)));
      setSelected([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Πολυμέσα</h1>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={() => handleDelete(selected)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Διαγραφή ({selected.length})
            </button>
          )}
          <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Ανέβασμα
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search */}
      <AdminCard>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Αναζήτηση αρχείων..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </AdminCard>

      {/* Upload Progress */}
      {uploading && (
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-white">Ανέβασμα αρχείων...</span>
          </div>
        </AdminCard>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className={`relative group bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden hover:border-blue-500 transition-colors cursor-pointer ${
              selected.includes(item.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              setSelected(prev =>
                prev.includes(item.id)
                  ? prev.filter(id => id !== item.id)
                  : [...prev, item.id]
              );
            }}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* File Preview */}
            <div className="aspect-square flex items-center justify-center p-4">
              {item.type.startsWith('image/') ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon(item.type)}
                  <span className="text-xs text-gray-400 text-center truncate w-full">
                    {item.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-3 bg-slate-900/50">
              <p className="text-white text-sm font-medium truncate" title={item.name}>
                {item.name}
              </p>
              <p className="text-gray-400 text-xs">
                {formatFileSize(item.size)}
              </p>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download logic
                }}
                className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 hover:text-white transition-colors"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <AdminCard>
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Δεν υπάρχουν αρχεία</p>
            <p className="text-gray-500 text-sm">Ανεβάστε αρχεία για να ξεκινήσετε</p>
          </div>
        </AdminCard>
      )}
    </div>
  );
}