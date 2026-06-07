import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { siteSettingsHelper } from '../../lib/dataHelpers';

const CTA_KEYS = [
  { key: 'hero_cta_primary_text', label: 'Hero Primary Button Text', tab: 'hero', rows: 1 },
  { key: 'hero_cta_primary_link', label: 'Hero Primary Button Link', tab: 'hero', rows: 1 },
  { key: 'hero_cta_secondary_text', label: 'Hero Secondary Link Text', tab: 'hero', rows: 1 },
  { key: 'hero_cta_secondary_link', label: 'Hero Secondary Link', tab: 'hero', rows: 1 },
  { key: 'header_cta_text', label: 'Header CTA Button Text', tab: 'header', rows: 1 },
  { key: 'header_cta_link', label: 'Header CTA Button Link', tab: 'header', rows: 1 },
  { key: 'cta_band_title', label: 'CTA Band Title', tab: 'band', rows: 2 },
  { key: 'cta_band_subtitle', label: 'CTA Band Subtitle', tab: 'band', rows: 2 },
  { key: 'cta_band_button_text', label: 'CTA Band Button Text', tab: 'band', rows: 1 },
  { key: 'cta_band_button_link', label: 'CTA Band Button Link', tab: 'band', rows: 1 },
];

export default function CtaPanel() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    const all = await siteSettingsHelper.getAll();
    const map: Record<string, any> = {};
    for (const s of all) if (CTA_KEYS.find(k => k.key === s.key)) map[s.key] = s.value;
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const setVal = (key: string, val: any) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    for (const s of await siteSettingsHelper.getAll()) {
      if (CTA_KEYS.find(k => k.key === s.key) && settings[s.key] !== undefined) {
        await siteSettingsHelper.update(s.id, { value: settings[s.key] });
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = () => { setLoading(true); loadSettings(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const renderField = (def: typeof CTA_KEYS[0]) => {
    const val = settings[def.key] || '';
    return (
      <div key={def.key}>
        <label className="text-xs text-gray-500 block mb-1.5">{def.label}</label>
        <input value={val} onChange={e => setVal(def.key, e.target.value)} className="input" />
        <div className="text-[10px] text-gray-700 mt-0.5 font-mono">{def.key}</div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Κουμπιά CTA</h2><p className="text-sm text-gray-500">Κουμπιά δράσης και προτροπές σε όλο το site</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Hero Section CTA</h3>
        <div className="grid grid-cols-2 gap-4">
          {CTA_KEYS.filter(k => k.tab === 'hero').map(renderField)}
        </div>

        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Header CTA</h3>
        <div className="grid grid-cols-2 gap-4">
          {CTA_KEYS.filter(k => k.tab === 'header').map(renderField)}
        </div>

        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">CTA Band</h3>
        {CTA_KEYS.filter(k => k.tab === 'band').map(renderField)}
      </div>
    </div>
  );
}
