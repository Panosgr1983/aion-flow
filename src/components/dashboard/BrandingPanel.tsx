import { useEffect, useState } from 'react';
import { Save, RefreshCw, History, ArrowLeft, Upload } from 'lucide-react';
import { coreEntitiesHelper } from '../../lib/coreEntitiesHelper';
import { useTenant } from '../../lib/useTenant';
import { uploadCmsAsset } from '../../lib/media';

const DEFAULT_BRANDING = {
  site_name: '',
  site_subtitle: '',
  monogram: '',
  tagline: '',
  copyright: '',
  logo: '',
  logo_footer: '',
  favicon: '',
  apple_icon: '',
  primary_color: '#6b8f3a',
  background_color: '#faf8f5',
};

type Branding = typeof DEFAULT_BRANDING;

export default function BrandingPanel() {
  const tenant = useTenant();
  const [data, setData] = useState<Branding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const entityType = 'branding';
  const [uploading, setUploading] = useState<string | null>(null);

  const loadData = async () => {
    const record = await coreEntitiesHelper.getByType(tenant.effectiveTenantId, entityType);
    if (record) setData({ ...DEFAULT_BRANDING, ...(record.data || {}) });
    setLoading(false);
  };

  useEffect(() => { if (tenant.effectiveTenantId) loadData(); }, [tenant.effectiveTenantId]);

  const loadHistory = async () => {
    const record = await coreEntitiesHelper.getByType(tenant.effectiveTenantId, entityType);
    if (record) {
      setHistory(await coreEntitiesHelper.getHistory(record.id));
      setShowHistory(true);
    }
  };

  const setVal = (field: string, val: string) => setData(prev => ({ ...prev, [field]: val }));

  const handleImageUpload = async (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(field);
      try {
        const url = await uploadCmsAsset(file, 'branding');
        setVal(field, url);
      } catch (e) {
        console.error('Upload failed:', e);
      }
      setUploading(null);
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await coreEntitiesHelper.upsert(tenant.effectiveTenantId, entityType, data);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save failed:', e);
      setSaving(false);
    }
  };

  const handleRefresh = () => { setLoading(true); loadData(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  if (showHistory) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(false)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><ArrowLeft size={16} /></button>
            <div><h2 className="text-xl font-semibold">Ιστορικό Branding</h2></div>
          </div>
        </div>
        <div className="card p-6 space-y-3">
          {history.length === 0 && <p className="text-sm text-gray-500">Δεν υπάρχει ιστορικό.</p>}
          {history.map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
              <div>
                <span className="text-xs text-gray-400">Έκδοση {h.version}</span>
                <span className="text-xs text-gray-600 ml-3">{new Date(h.created_at).toLocaleString('el-GR')}</span>
              </div>
              <button onClick={() => { setData({ ...DEFAULT_BRANDING, ...(h.data || {}) }); setShowHistory(false); }} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-900/40 hover:bg-blue-950/40 transition-colors">Επαναφορά</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const imageField = (field: string, label: string) => (
    <div>
      <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input value={(data as any)[field] || ''} onChange={e => setVal(field, e.target.value)} className="input flex-1" placeholder="URL ή ανεβάστε εικόνα" />
        <button onClick={() => handleImageUpload(field)} disabled={uploading === field} className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap border border-gray-700">
          {uploading === field ? '...' : <><Upload size={12} className="mr-1 inline" /> Ανέβασμα</>}
        </button>
      </div>
      {(data as any)[field] && (
        <img src={(data as any)[field]} alt={label} className="mt-2 h-12 rounded border border-gray-800 object-contain bg-gray-900" />
      )}
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Branding</h2><p className="text-sm text-gray-500">Λογότυπο, χρώματα, όνομα και ταυτότητα του site</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadHistory} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" title="Ιστορικό"><History size={14} /></button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Λογότυπα & Εικόνες</h3>
        {imageField('logo', 'Λογότυπο (Header)')}
        {imageField('logo_footer', 'Λογότυπο (Footer)')}
        {imageField('favicon', 'Favicon')}
        {imageField('apple_icon', 'Apple Touch Icon')}

        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Επωνυμία</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Όνομα Site</label>
            <input value={data.site_name} onChange={e => setVal('site_name', e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Μονόγραμμα (π.χ. ΝΚ)</label>
            <input value={data.monogram} onChange={e => setVal('monogram', e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">Υπότιτλος</label>
          <input value={data.site_subtitle} onChange={e => setVal('site_subtitle', e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">Tagline (slogan)</label>
          <textarea value={data.tagline} onChange={e => setVal('tagline', e.target.value)} className="input" rows={2} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">Copyright Text</label>
          <input value={data.copyright} onChange={e => setVal('copyright', e.target.value)} className="input" />
        </div>

        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Χρώματα</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Primary Color</label>
            <div className="flex gap-2">
              <input value={data.primary_color} onChange={e => setVal('primary_color', e.target.value)} className="input flex-1 font-mono text-xs" />
              <input type="color" value={data.primary_color} onChange={e => setVal('primary_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-700" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Background Color</label>
            <div className="flex gap-2">
              <input value={data.background_color} onChange={e => setVal('background_color', e.target.value)} className="input flex-1 font-mono text-xs" />
              <input type="color" value={data.background_color} onChange={e => setVal('background_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
