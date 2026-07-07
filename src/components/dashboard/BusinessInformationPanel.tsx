import { useEffect, useState } from 'react';
import { Save, RefreshCw, History, ArrowLeft } from 'lucide-react';
import { coreEntitiesHelper } from '../../lib/coreEntitiesHelper';
import { useTenant } from '../../lib/useTenant';

const DEFAULT_BUSINESS = {
  address: {
    name: '', street: '', number: '', area: '', city: '', region: '', postal_code: '', country: '', floor: '', instructions: '',
  },
  contact: {
    phone: '', mobile: '', email: '', website: '',
  },
  maps: {
    url: '', embed_url: '', latitude: '', longitude: '', place_id: '',
  },
  social: {
    facebook: '', instagram: '', linkedin: '', youtube: '', tiktok: '', twitter: '', threads: '',
  },
  hours: {
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '',
  },
};

type BusinessInfo = typeof DEFAULT_BUSINESS;

export default function BusinessInformationPanel() {
  const tenant = useTenant();
  const [biz, setBiz] = useState<BusinessInfo>(DEFAULT_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('address');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const entityType = 'business_information';

  const loadData = async () => {
    const record = await coreEntitiesHelper.getByType(tenant.effectiveTenantId, entityType);
    if (record) {
      setBiz({ ...DEFAULT_BUSINESS, ...(record.data || {}) });
    }
    setLoading(false);
  };

  useEffect(() => { if (tenant.effectiveTenantId) loadData(); }, [tenant.effectiveTenantId]);

  const loadHistory = async () => {
    const record = await coreEntitiesHelper.getByType(tenant.effectiveTenantId, entityType);
    if (record) {
      const h = await coreEntitiesHelper.getHistory(record.id);
      setHistory(h);
      setShowHistory(true);
    }
  };

  const setVal = (group: keyof BusinessInfo, field: string, val: string) => {
    setBiz(prev => ({ ...prev, [group]: { ...(prev as any)[group], [field]: val } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await coreEntitiesHelper.upsert(tenant.effectiveTenantId, entityType, biz);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = () => { setLoading(true); loadData(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const renderField = (group: keyof BusinessInfo, field: string, label: string, opts?: { placeholder?: string; type?: string; rows?: number }) => {
    const val = (biz[group] as any)[field] || '';
    return (
      <div key={`${group}.${field}`}>
        <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
        {opts?.rows && opts.rows > 1 ? (
          <textarea value={val} onChange={e => setVal(group, field, e.target.value)} className="input" rows={opts.rows} placeholder={opts?.placeholder || ''} />
        ) : (
          <input value={val} onChange={e => setVal(group, field, e.target.value)} className="input" type={opts?.type || 'text'} placeholder={opts?.placeholder || ''} />
        )}
        <div className="text-[10px] text-gray-700 mt-0.5 font-mono">{field}</div>
      </div>
    );
  };

  if (showHistory) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(false)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><ArrowLeft size={16} /></button>
            <div><h2 className="text-xl font-semibold">Ιστορικό Εκδόσεων</h2><p className="text-sm text-gray-500">Προηγούμενες αποθηκευμένες εκδόσεις του Business Information</p></div>
          </div>
        </div>
        <div className="card p-6 space-y-3">
          {history.length === 0 && <p className="text-sm text-gray-500">Δεν υπάρχει ιστορικό ακόμα.</p>}
          {history.map((h, i) => (
            <div key={h.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
              <div>
                <span className="text-xs text-gray-400">Έκδοση {h.version}</span>
                <span className="text-xs text-gray-600 ml-3">{new Date(h.created_at).toLocaleString('el-GR')}</span>
              </div>
              <button
                onClick={async () => {
                  setBiz({ ...DEFAULT_BUSINESS, ...(h.data || {}) });
                  setShowHistory(false);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-900/40 hover:bg-blue-950/40 transition-colors"
              >
                Επαναφορά
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'address', label: '📍 Διεύθυνση', icon: '📍' },
    { id: 'contact', label: '📞 Επικοινωνία', icon: '📞' },
    { id: 'maps', label: '🗺️ Χάρτες', icon: '🗺️' },
    { id: 'social', label: '🌐 Social', icon: '🌐' },
    { id: 'hours', label: '🕐 Ωράριο', icon: '🕐' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Business Information</h2><p className="text-sm text-gray-500">Κεντρικά στοιχεία επιχείρησης — μία φορά, παντού</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadHistory} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" title="Ιστορικό εκδόσεων"><History size={14} /></button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-800 pb-px mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        {tab === 'address' && (
          <>
            <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">📍 Διεύθυνση</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField('address', 'name', 'Επωνυμία')}
              {renderField('address', 'country', 'Χώρα')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('address', 'street', 'Οδός')}
              {renderField('address', 'number', 'Αριθμός')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('address', 'area', 'Περιοχή')}
              {renderField('address', 'city', 'Πόλη')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('address', 'region', 'Νομός / Περιφέρεια')}
              {renderField('address', 'postal_code', 'Ταχυδρομικός Κώδικας')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('address', 'floor', 'Όροφος')}
            </div>
            {renderField('address', 'instructions', 'Σχόλια / Οδηγίες', { rows: 2, placeholder: 'π.χ. Παρκινγκ απέναντι, είσοδος από την πλαϊνή πόρτα' })}
          </>
        )}

        {tab === 'contact' && (
          <>
            <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">📞 Στοιχεία Επικοινωνίας</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField('contact', 'phone', 'Τηλέφωνο', { placeholder: '+30 697 437 1139' })}
              {renderField('contact', 'mobile', 'Κινητό', { placeholder: '+30 ...' })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('contact', 'email', 'Email', { type: 'email' })}
              {renderField('contact', 'website', 'Website', { type: 'url' })}
            </div>
          </>
        )}

        {tab === 'maps' && (
          <>
            <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">🗺️ Google Maps</h3>
            {renderField('maps', 'embed_url', 'Google Maps Embed URL', { rows: 3, placeholder: 'https://www.google.com/maps?q=...&output=embed' })}
            {renderField('maps', 'url', 'Google Maps URL (για directions)', { rows: 2, placeholder: 'https://www.google.com/maps/dir/?api=1&destination=...' })}
            <div className="grid grid-cols-3 gap-4">
              {renderField('maps', 'latitude', 'Latitude')}
              {renderField('maps', 'longitude', 'Longitude')}
              {renderField('maps', 'place_id', 'Place ID')}
            </div>
          </>
        )}

        {tab === 'social' && (
          <>
            <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">🌐 Social Media</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField('social', 'facebook', 'Facebook URL', { type: 'url' })}
              {renderField('social', 'instagram', 'Instagram URL', { type: 'url' })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('social', 'linkedin', 'LinkedIn URL', { type: 'url' })}
              {renderField('social', 'youtube', 'YouTube URL', { type: 'url' })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderField('social', 'tiktok', 'TikTok URL', { type: 'url' })}
              {renderField('social', 'twitter', 'X / Twitter URL', { type: 'url' })}
            </div>
            {renderField('social', 'threads', 'Threads URL', { type: 'url' })}
          </>
        )}

        {tab === 'hours' && (
          <>
            <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">🕐 Ωράριο Λειτουργίας</h3>
            <p className="text-xs text-gray-500 mb-4">Αφήστε κενό αν η μέρα είναι αργία.</p>
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, i) => {
                const labels = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-400 shrink-0">{labels[i]}</span>
                    <input
                      value={(biz.hours as any)[day] || ''}
                      onChange={e => setVal('hours', day, e.target.value)}
                      className="input flex-1"
                      placeholder="π.χ. 10:00 – 20:00"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
