import { useEffect, useState } from 'react';
import { Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { siteSettingsHelper } from '../../lib/dataHelpers';

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

interface PageVisibility {
  [path: string]: boolean;
}

export default function Pages() {
  const [visibility, setVisibility] = useState<PageVisibility>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const loadPages = async () => {
    setLoading(true);
    const all = await siteSettingsHelper.getAll();
    const setting = all.find(s => s.key === 'page_visibility');
    if (setting) {
      setSettingsId(setting.id);
      setVisibility(typeof setting.value === 'object' && setting.value !== null ? setting.value as PageVisibility : {});
    }
    setLoading(false);
  };

  useEffect(() => { loadPages(); }, []);

  const togglePage = (path: string) => {
    setVisibility(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleAll = (visible: boolean) => {
    const updated: PageVisibility = {};
    DEFAULT_PAGES.forEach(p => { updated[p.path] = visible; });
    setVisibility(updated);
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    await siteSettingsHelper.update(settingsId, { value: visibility });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadPages();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Ορατότητα Σελίδων</h2><p className="text-sm text-gray-500">Ενεργοποιήστε ή απενεργοποιήστε σελίδες στον ιστότοπο</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <button onClick={handleSave} disabled={saving || !settingsId} className="btn-primary">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-400">Όλες οι σελίδες</span>
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-1.5"><Eye size={12} /> Ενεργοποίηση όλων</button>
            <button onClick={() => toggleAll(false)} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-1.5"><EyeOff size={12} /> Απενεργοποίηση όλων</button>
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {DEFAULT_PAGES.map(page => {
            const isVisible = visibility[page.path] !== false;
            return (
              <div key={page.path} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{page.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{page.label}</p>
                    <p className="text-xs text-gray-600 font-mono">{page.path}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => togglePage(page.path)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${isVisible ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block size-4 rounded-full bg-white transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-600">Οι σελίδες που είναι απενεργοποιημένες δεν εμφανίζονται στο κοινό. Η πλοήγηση προσαρμόζεται αυτόματα.</p>
    </div>
  );
}
