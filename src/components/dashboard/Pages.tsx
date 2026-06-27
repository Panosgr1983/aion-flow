import { useEffect, useState, useRef } from 'react';
import { Save, RefreshCw, Eye, EyeOff, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { siteSettingsHelper } from '../../lib/dataHelpers';
import { uploadCmsAsset } from '../../lib/media';
import { useTenantContext } from '../../lib/TenantContext';
import { trackEvent } from '../../lib/analytics';
import MediaPicker from './MediaPicker';

const DEFAULT_PAGES = [
  { path: '/', label: 'Αρχική', icon: '🏠' },
  { path: '/about', label: 'Σχετικά', icon: '👤' },
  { path: '/services', label: 'Υπηρεσίες', icon: '📋' },
  { path: '/blog', label: 'Blog', icon: '📝' },
  { path: '/books', label: 'Βιβλία', icon: '📚' },
  { path: '/contact', label: 'Επικοινωνία', icon: '📞' },
  { path: '/privacy', label: 'Πολιτική Απορρήτου', icon: '🔒' },
  { path: '/terms', label: 'Όροι Χρήσης', icon: '📄' },
];

interface PageData {
  hero_image: string;
  title: string;
  subtitle: string;
}

interface PageContent {
  [path: string]: PageData;
}

const emptyPageData = (): PageData => ({ hero_image: '', title: '', subtitle: '' });

export default function Pages() {
  const { selectedTenantId } = useTenantContext();
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [contentSettingsId, setContentSettingsId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadPages = async () => {
    setLoading(true);
    const all = await siteSettingsHelper.getAll();

    const visSetting = all.find(s => s.key === 'page_visibility');
    if (visSetting) {
      setSettingsId(visSetting.id);
      setVisibility(typeof visSetting.value === 'object' && visSetting.value !== null ? visSetting.value as Record<string, boolean> : {});
    }

    const contentSetting = all.find(s => s.key === 'page_data');
    if (contentSetting) {
      setContentSettingsId(contentSetting.id);
      setPageContent(typeof contentSetting.value === 'object' && contentSetting.value !== null ? contentSetting.value as PageContent : {});
    }

    setLoading(false);
  };

  useEffect(() => { loadPages(); }, []);

  const togglePage = (path: string) => {
    setVisibility(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleAll = (visible: boolean) => {
    const updated: Record<string, boolean> = {};
    DEFAULT_PAGES.forEach(p => { updated[p.path] = visible; });
    setVisibility(updated);
  };

  const updateContent = (path: string, field: keyof PageData, value: string) => {
    setPageContent(prev => ({
      ...prev,
      [path]: { ...emptyPageData(), ...prev[path], [field]: value },
    }));
  };

  const handleImageUpload = async (path: string, file: File) => {
    setUploadingFor(path);
    try {
      if (!selectedTenantId) { alert('Δεν βρέθηκε tenant'); return; }
      const media = await uploadCmsAsset(file, { tenantId: selectedTenantId, bucket: 'site-images', category: 'page', source: 'editor' });
      updateContent(path, 'hero_image', media.url);
    } catch {
      alert('Αποτυχία μεταφόρτωσης');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        await siteSettingsHelper.update(settingsId, { value: visibility });
      }
      if (contentSettingsId) {
        await siteSettingsHelper.update(contentSettingsId, { value: pageContent });
      } else {
        // Create new page_data setting
        const created = await siteSettingsHelper.create({
          key: 'page_data',
          value: pageContent,
          category: 'general',
          tenant_id: '00000000-0000-0000-0000-000000000001',
        });
        setContentSettingsId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      trackEvent('cms.page_updated', { page_slug: 'multiple', fields_changed: ['visibility', 'content'] }).catch(() => {});
    } catch {
      alert('Αποτυχία αποθήκευσης');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => { loadPages(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold">Διαχείριση Σελίδων</h2>
            <p className="text-sm text-gray-500">Ορατότητα, εικόνα και κείμενα κάθε σελίδας</p>
          </div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-400">Όλες οι σελίδες ({DEFAULT_PAGES.length})</span>
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-1.5"><Eye size={12} /> Ενεργοποίηση όλων</button>
            <button onClick={() => toggleAll(false)} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-1.5"><EyeOff size={12} /> Απενεργοποίηση όλων</button>
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {DEFAULT_PAGES.map(page => {
            const isVisible = visibility[page.path] !== false;
            const isExpanded = expanded === page.path;
            const data = { ...emptyPageData(), ...pageContent[page.path] };

            return (
              <div key={page.path}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg shrink-0">{page.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">{page.label}</p>
                      <p className="text-xs text-gray-600 font-mono truncate">{page.path}</p>
                    </div>
                    {data.title && <span className="text-xs text-gray-500 truncate max-w-[200px] hidden md:block">{data.title}</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isVisible}
                      onClick={() => togglePage(page.path)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block size-4 rounded-full bg-white transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : page.path)}
                      className={`p-1 text-gray-500 hover:text-gray-300 transition-colors ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 bg-gray-900/20 space-y-3">
                    <div className="border-t border-gray-800/50 pt-3">
                      <label className="text-xs text-gray-500 block mb-1">Εικόνα Hero</label>
                      <div className="flex gap-2">
                        <input
                          value={data.hero_image}
                          onChange={e => updateContent(page.path, 'hero_image', e.target.value)}
                          className="input flex-1 text-sm font-mono"
                          placeholder="URL εικόνας"
                        />
                        <button
                          type="button"
                          onClick={() => uploadRefs.current[page.path]?.click()}
                          disabled={uploadingFor === page.path}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors disabled:opacity-50 text-xs"
                          title="Μεταφόρτωση"
                        >
                          <Upload size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickerTarget(page.path)}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-xs"
                          title="Βιβλιοθήκη"
                        >
                          <ImageIcon size={14} />
                        </button>
                        <input
                          ref={el => uploadRefs.current[page.path] = el}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(page.path, f); e.target.value = ''; }}
                        />
                      </div>
                      {data.hero_image && (
                        <img src={data.hero_image} alt="" className="mt-2 h-20 rounded-lg object-cover border border-gray-800" />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Τίτλος σελίδας</label>
                      <input
                        value={data.title}
                        onChange={e => updateContent(page.path, 'title', e.target.value)}
                        className="input text-sm"
                        placeholder={page.label}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Υπότιτλος</label>
                      <input
                        value={data.subtitle}
                        onChange={e => updateContent(page.path, 'subtitle', e.target.value)}
                        className="input text-sm"
                        placeholder="Περιγραφή σελίδας"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MediaPicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(url) => {
          if (pickerTarget) updateContent(pickerTarget, 'hero_image', url);
          setPickerTarget(null);
        }}
        folder="pages"
      />

      <p className="text-xs text-gray-600">
        Ορίστε εικόνα hero, τίτλο και υπότιτλο για κάθε σελίδα. Η ορατότητα ελέγχει αν η σελίδα εμφανίζεται στο κοινό.
      </p>
    </div>
  );
}
