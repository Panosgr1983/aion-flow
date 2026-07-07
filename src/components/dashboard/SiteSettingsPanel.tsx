import { useEffect, useState, useRef } from 'react';
import { Save, RefreshCw, Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { siteSettingsHelper, FOLDER_OPTIONS } from '../../lib/dataHelpers';
import { uploadCmsAsset } from '../../lib/media';
import { useTenant } from '../../lib/useTenant';
import { SiteSetting } from '../../types/supabase';
import MediaPicker from './MediaPicker';

const CATEGORIES = ['home', 'about', 'contact', 'site', 'footer', 'navigation', 'cta', 'seo'] as const;

const TAB_LABELS: Record<string, string> = {
  home: 'Αρχική', about: 'Σχετικά', contact: 'Επικοινωνία', site: 'Site Branding', footer: 'Footer', navigation: 'Πλοήγηση', cta: 'CTA Band', seo: 'SEO',
};

const TEXTAREA_KEYS = ['subtitle', 'description', 'paragraph', 'tagline', 'heading', 'title'];

function isTextarea(key: string) {
  return TEXTAREA_KEYS.some(k => key.includes(k));
}

interface NavLink { label: string; path: string; }
interface BioParagraphs { value: string[]; }
interface HeroSlides { slide: { image: string; heading: string; subtitle: string; cta_text: string; cta_link: string; }[]; }

interface SettingsMap { [key: string]: any; }

function PageHiddenBanner({ pageKey }: { pageKey: string }) {
  return (
    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs mb-5">
      Η σελίδα είναι αποκρυμμένη. Ενεργοποιήστε την από το panel <strong>Σελίδες</strong> για να εμφανίζεται στο site.
    </div>
  );
}

function TabVisibilityGuard({ children, visibility, pageKey }: { children: React.ReactNode; visibility: Record<string, boolean>; pageKey: string }) {
  const isHidden = visibility[pageKey] === false;
  return (
    <div className={isHidden ? 'opacity-50 pointer-events-none select-none' : ''}>
      {isHidden && <PageHiddenBanner pageKey={pageKey} />}
      {children}
    </div>
  );
}

function imageKeyToCategory(key: string): string {
  if (key.startsWith('logo') || key === 'site_logo' || key === 'site_logo_footer') return 'logo';
  if (key.includes('hero')) return 'hero';
  if (key.includes('portrait') || key.includes('avatar')) return 'about';
  if (key.includes('og_image') || key.includes('seo') || key === 'site_favicon') return 'seo';
  return 'general';
}

export default function SiteSettingsPanel() {
  const { effectiveTenantId } = useTenant();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [saved, setSaved] = useState(false);
  const [editNav, setEditNav] = useState<NavLink[]>([]);
  const [editFooterNav, setEditFooterNav] = useState<NavLink[]>([]);
  const [editBio, setEditBio] = useState<string[]>([]);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const dirtyKeys = useRef(new Set<string>());

  const loadSettings = async () => {
    const d = await siteSettingsHelper.getAll();
    setSettings(d);
    const navSetting = d.find(s => s.key === 'nav_links');
    if (navSetting) setEditNav(Array.isArray(navSetting.value) ? navSetting.value as NavLink[] : []);
    const footerNavSetting = d.find(s => s.key === 'footer_nav_links');
    if (footerNavSetting) setEditFooterNav(Array.isArray(footerNavSetting.value) ? footerNavSetting.value as NavLink[] : []);
    const bioSetting = d.find(s => s.key === 'about_bio_paragraphs');
    if (bioSetting) setEditBio(Array.isArray(bioSetting.value) ? bioSetting.value as string[] : []);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const getValue = (key: string): string => {
    const s = settings.find(s => s.key === key);
    if (!s) return '';
    const v = s.value;
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return '';
  };

  const setValue = (key: string, val: string) => {
    dirtyKeys.current.add(key);
    setSettings(prev => {
      const exists = prev.some(s => s.key === key);
      if (exists) return prev.map(s => s.key === key ? { ...s, value: val } : s);
      return [...prev, { id: '', key, value: val, category: imageKeyToCategory(key) } as SiteSetting];
    });
  };

  const handleImageUpload = async (file: File, targetKey: string) => {
    if (!effectiveTenantId) { alert('Δεν βρέθηκε tenant'); return; }
    try {
      const isLogo = targetKey === 'site_logo' || targetKey === 'site_logo_footer' || targetKey === 'site_favicon';
      const media = await uploadCmsAsset(file, {
        tenantId: effectiveTenantId,
        bucket: 'site-images',
        category: imageKeyToCategory(targetKey) as any,
        source: 'editor',
        keepFormat: isLogo,
      });
      setValue(targetKey, media.url);
      // auto-save αμέσως για να μη χρειάζεται ξεχωριστό Save
      const setting = settings.find(s => s.key === targetKey);
      if (setting) {
        await siteSettingsHelper.update(setting.id, { value: media.url });
        dirtyKeys.current.delete(targetKey);
      } else {
        const created = await siteSettingsHelper.create({ key: targetKey, value: media.url, category: imageKeyToCategory(targetKey), tenant_id: effectiveTenantId });
        setSettings(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      const detail = (err as any)?.details || (err as any)?.hint || '';
      alert('Αποτυχία μεταφόρτωσης: ' + msg + (detail ? ' (' + detail + ')' : ''));
    }
  };

  const updateJsonSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const addNavLink = (isFooter: boolean) => {
    const setter = isFooter ? setEditFooterNav : setEditNav;
    const current = isFooter ? editFooterNav : editNav;
    setter([...current, { label: '', path: '/' }]);
  };

  const updateNavLink = (idx: number, field: keyof NavLink, val: string, isFooter: boolean) => {
    const setter = isFooter ? setEditFooterNav : setEditNav;
    const current = isFooter ? editFooterNav : editNav;
    const updated = current.map((item, i) => i === idx ? { ...item, [field]: val } : item);
    setter(updated);
    updateJsonSetting(isFooter ? 'footer_nav_links' : 'nav_links', updated);
  };

  const removeNavLink = (idx: number, isFooter: boolean) => {
    const setter = isFooter ? setEditFooterNav : setEditNav;
    const current = isFooter ? editFooterNav : editNav;
    const updated = current.filter((_, i) => i !== idx);
    setter(updated);
    updateJsonSetting(isFooter ? 'footer_nav_links' : 'nav_links', updated);
  };

  const updateBioParagraph = (idx: number, text: string) => {
    const updated = editBio.map((p, i) => i === idx ? text : p);
    setEditBio(updated);
    updateJsonSetting('about_bio_paragraphs', updated);
  };

  const addBioParagraph = () => {
    setEditBio([...editBio, '']);
  };

  const removeBioParagraph = (idx: number) => {
    const updated = editBio.filter((_, i) => i !== idx);
    setEditBio(updated);
    updateJsonSetting('about_bio_paragraphs', updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const dirty = settings.filter(s => dirtyKeys.current.has(s.key));
    if (dirty.length > 0) {
      await Promise.all(dirty.map(s => {
        if (s.id && s.id.length > 0) {
          return siteSettingsHelper.update(s.id, { value: s.value });
        }
        return siteSettingsHelper.create({ key: s.key, value: s.value, category: 'general', tenant_id: effectiveTenantId });
      }));
      dirtyKeys.current.clear();
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadSettings();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const pageVisibilitySetting = settings.find(s => s.key === 'page_visibility');
  const pageVisibility: Record<string, boolean> = (pageVisibilitySetting?.value as Record<string, boolean>) || {};

  const TAB_PAGE_MAP: Record<string, string> = {
    home: '/',
    about: '/about',
    contact: '/contact',
  };

  const renderField = (key: string, label: string, opts?: { isUrl?: boolean; isImage?: boolean; rows?: number; isPassword?: boolean }) => {
    const val = getValue(key);
    return (
      <div key={key}>
        <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
        <div className="flex gap-2">
          {opts?.isImage || opts?.isUrl ? (
            <>
              <input value={val} onChange={e => setValue(key, e.target.value)} className="input flex-1 font-mono text-xs" placeholder="https://..." />
              {opts?.isImage && (
                <>
                  <button type="button" onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImageUpload(f, key); }; inp.click(); }} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-xs"><Upload size={14} /></button>
                  <button type="button" onClick={() => setPickerTarget(key)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-xs">Βιβλ.</button>
                </>
              )}
            </>
          ) : isTextarea(key) ? (
            <textarea value={val} onChange={e => setValue(key, e.target.value)} className="input flex-1 resize-none" style={{ minHeight: opts?.rows ? `${opts.rows * 1.5}rem` : '5rem' }} />
          ) : (
            <input value={val} onChange={e => setValue(key, e.target.value)} type={opts?.isPassword ? 'password' : 'text'} className="input flex-1" />
          )}
        </div>
        <div className="text-[10px] text-gray-700 mt-0.5 font-mono">{key}</div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Ρυθμίσεις Περιεχομένου</h2><p className="text-sm text-gray-500">{settings.length} ρυθμίσεις</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === cat ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {TAB_LABELS[cat] || cat}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-5">

          {/* HOME */}
          {activeTab === 'home' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Hero Section</h3>
              {renderField('hero_heading', 'Hero Heading (H1)', { rows: 3 })}
              {renderField('hero_subtitle', 'Hero Subtitle', { rows: 2 })}
              <div className="grid grid-cols-2 gap-4">
                {renderField('hero_cta_primary_text', 'Primary Button Text')}
                {renderField('hero_cta_primary_link', 'Primary Button Link')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('hero_cta_secondary_text', 'Secondary Link Text')}
                {renderField('hero_cta_secondary_link', 'Secondary Link')}
              </div>
              {renderField('hero_image', 'Hero Image URL', { isImage: true })}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Services Section</h3>
              {renderField('services_section_title', 'Section Title')}
              {renderField('services_section_link_text', '"View All" Link Text')}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">About Preview Section</h3>
              {renderField('about_section_eyebrow', 'Eyebrow')}
              {renderField('about_section_title', 'Title')}
              {renderField('about_section_paragraph_1', 'Paragraph 1', { rows: 3 })}
              {renderField('about_section_paragraph_2', 'Paragraph 2', { rows: 3 })}
              {renderField('about_section_cta_text', 'CTA Button Text')}
              {renderField('about_section_portrait', 'Portrait Image URL', { isImage: true })}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Books Showcase Section</h3>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                <label className="text-sm text-gray-300">Εμφάνιση βιβλίων στην Αρχική</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={getValue('home_books_showcase_enabled') === 'true'}
                  onClick={() => setValue('home_books_showcase_enabled', getValue('home_books_showcase_enabled') === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getValue('home_books_showcase_enabled') === 'true' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block size-4 rounded-full bg-white transition-transform ${getValue('home_books_showcase_enabled') === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('home_books_showcase_title', 'Section Title')}
                {renderField('home_books_showcase_link_text', '"View All" Link Text')}
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Homepage Contact Section</h3>
              {renderField('contact_section_eyebrow', 'Contact Section Eyebrow')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_cta_text', 'CTA Button Text')}
                {renderField('contact_cta_link', 'CTA Button Link')}
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Other Sections</h3>
              {renderField('testimonials_section_title', 'Testimonials Section Title')}
              {renderField('blog_section_title', 'Blog Section Title')}
              {renderField('blog_section_link_text', 'Blog "View All" Link Text')}
            </>
          )}

          {/* ABOUT */}
          {activeTab === 'about' && (
            <TabVisibilityGuard visibility={pageVisibility} pageKey="/about">
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Hero Section</h3>
              {renderField('about_hero_eyebrow', 'Eyebrow')}
              {renderField('about_hero_title', 'Title')}
              {renderField('about_hero_subtitle', 'Subtitle', { rows: 2 })}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Bio Section</h3>
              {renderField('about_bio_eyebrow', 'Bio Eyebrow')}
              {renderField('about_bio_title', 'Bio Title')}
              <div className="p-3 bg-gray-900/50 rounded-xl space-y-3">
                {editBio.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea value={p} onChange={e => updateBioParagraph(i, e.target.value)} className="input flex-1 resize-none text-xs" style={{ minHeight: '4rem' }} placeholder={`Paragraph ${i + 1}`} />
                    <button onClick={() => removeBioParagraph(i)} className="p-1.5 text-gray-500 hover:text-red-400 mt-1"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={addBioParagraph} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη παραγράφου</button>
              </div>
              {renderField('about_portrait', 'Portrait Image URL', { isImage: true })}
              {renderField('credentials_section_title', 'Credentials Section Title')}

              <h3 className={`text-sm font-semibold border-b border-gray-800 pb-2 mt-8 ${pageVisibility['/books'] === false ? 'text-amber-500' : 'text-blue-400'}`}>
                Books Page Hero {pageVisibility['/books'] === false && <span className="text-amber-500/70 font-normal">(αποκρυμμένο)</span>}
              </h3>
              <div className={pageVisibility['/books'] === false ? 'opacity-40 pointer-events-none' : ''}>
                {renderField('books_hero_title', 'Books Page Hero Title')}
                {renderField('books_hero_subtitle', 'Books Page Hero Subtitle', { rows: 2 })}
              </div>
            </TabVisibilityGuard>
          )}

          {/* CONTACT */}
          {activeTab === 'contact' && (
            <TabVisibilityGuard visibility={pageVisibility} pageKey="/contact">
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Hero Section</h3>
              {renderField('contact_hero_eyebrow', 'Eyebrow')}
              {renderField('contact_hero_title', 'Title')}
              {renderField('contact_hero_subtitle', 'Subtitle', { rows: 2 })}

              <div className="bg-blue-950/40 border border-blue-900/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-blue-400">
                  <strong>➡️ Τα στοιχεία επικοινωνίας</strong> (τηλέφωνο, email, διεύθυνση, social, maps, ωράριο)
                  μεταφέρθηκαν στο <strong>Business Information</strong> panel για κεντρική διαχείριση.
                </p>
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Contact Details (Labels Only)</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_phone_label', 'Phone Card Label')}
                {renderField('contact_phone_note', 'Phone Note')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_address_label', 'Address Label')}
                {renderField('contact_address_hint', 'Address Hint')}
              </div>
              {renderField('contact_hours_label', 'Hours Label')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_social_label', 'Social Label')}
                {renderField('contact_social_facebook_url', 'Facebook URL', { isUrl: true })}
              </div>
              {renderField('contact_map_title', 'Map Iframe Title')}
              {renderField('contact_open_maps_text', '"Άνοιγμα στους Χάρτες" Link Text')}
              {renderField('contact_form_heading', 'Form Heading')}
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Email Configuration</h3>
              {renderField('contact_email', 'Email λήψης (στο email αυτό θα στέλνονται τα μηνύματα)')}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">SMTP Server (για αποστολή email)</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField('smtp_host', 'SMTP Host (π.χ. smtp.gmail.com)')}
                {renderField('smtp_port', 'SMTP Port (π.χ. 587)')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('smtp_user', 'SMTP Username')}
                {renderField('smtp_pass', 'SMTP Password', { isPassword: true })}
              </div>
              {renderField('smtp_from_email', 'From Email (αποστολέας)')}
              {renderField('smtp_from_name', 'From Name (όνομα αποστολέα)')}
            </TabVisibilityGuard>
          )}

          {/* SITE */}
          {activeTab === 'site' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Branding</h3>
              {renderField('site_logo', 'Header Logo Image', { isImage: true })}
              {renderField('site_logo_footer', 'Footer Logo Image', { isImage: true })}
              {renderField('site_favicon', 'Favicon Image', { isImage: true })}
              <div className="grid grid-cols-2 gap-4">
                {renderField('site_name', 'Site Name')}
                {renderField('site_monogram', 'Monogram (e.g. ΝΚ)')}
              </div>
              {renderField('site_subtitle', 'Subtitle under name')}
              {renderField('site_tagline', 'Tagline (footer)', { rows: 2 })}
              {renderField('footer_copyright', 'Footer Copyright Text')}

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Header CTA</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField('header_cta_text', 'CTA Button Text')}
                {renderField('header_cta_link', 'CTA Button Link')}
              </div>
            </>
          )}

          {/* FOOTER */}
          {activeTab === 'footer' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Branding στο Footer</h3>
              {renderField('site_logo_footer', 'Footer Logo Image', { isImage: true })}
              <div className="grid grid-cols-2 gap-4">
                {renderField('site_name', 'Όνομα Site')}
                {renderField('site_monogram', 'Μονόγραμμα (π.χ. ΝΚ)')}
              </div>
              {renderField('site_subtitle', 'Υπότιτλος')}
              {renderField('site_tagline', 'Slogan / Περιγραφή', { rows: 2 })}
              {renderField('footer_copyright', 'Copyright Text')}

              <div className="bg-blue-950/40 border border-blue-900/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-blue-400">
                  <strong>➡️ Τα στοιχεία επικοινωνίας</strong> (τηλέφωνο, email, διεύθυνση, social)
                  μεταφέρθηκαν στο <strong>Business Information</strong> panel.
                  Εδώ έμειναν μόνο οι ετικέτες (labels).
                </p>
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Στοιχεία Επικοινωνίας (Ετικέτες)</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_email_label', 'Ετικέτα Email')}
                {renderField('contact_phone_label', 'Ετικέτα Τηλεφώνου')}
              </div>
              {renderField('contact_phone_note', 'Σημείωση Τηλεφώνου')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_address_label', 'Ετικέτα Διεύθυνσης')}
                {renderField('contact_address_hint', 'Υπόδειξη Διεύθυνσης')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('contact_social_label', 'Social Label')}
                {renderField('contact_social_facebook_url', 'Facebook URL', { isUrl: true })}
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Footer Section Labels</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField('footer_heading_nav', '"Πλοήγηση" Section Heading')}
                {renderField('footer_heading_contact', '"Επικοινωνία" Section Heading')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField('footer_privacy_text', 'Privacy Link Text')}
                {renderField('footer_terms_text', 'Terms Link Text')}
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Footer Navigation</h3>
              <p className="text-xs text-gray-500">Προσθέστε, αφαιρέστε ή τροποποιήστε τους συνδέσμους στο footer.</p>
              <div className="space-y-2">
                {editFooterNav.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <GripVertical size={14} className="text-gray-600 shrink-0" />
                    <input value={link.label} onChange={e => updateNavLink(i, 'label', e.target.value, true)} className="input flex-1 text-sm" placeholder="Label" />
                    <input value={link.path} onChange={e => updateNavLink(i, 'path', e.target.value, true)} className="input flex-1 text-sm" placeholder="/path" />
                    <button onClick={() => removeNavLink(i, true)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={() => addNavLink(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη συνδέσμου</button>
              </div>
            </>
          )}

          {/* NAVIGATION */}
          {activeTab === 'navigation' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Header Navigation</h3>
              <p className="text-xs text-gray-500">Προσθέστε, αφαιρέστε ή τροποποιήστε τους συνδέσμους στο κεντρικό μενού.</p>
              <div className="space-y-2">
                {editNav.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <GripVertical size={14} className="text-gray-600 shrink-0" />
                    <input value={link.label} onChange={e => updateNavLink(i, 'label', e.target.value, false)} className="input flex-1 text-sm" placeholder="Label" />
                    <input value={link.path} onChange={e => updateNavLink(i, 'path', e.target.value, false)} className="input flex-1 text-sm" placeholder="/path" />
                    <button onClick={() => removeNavLink(i, false)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={() => addNavLink(false)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη συνδέσμου</button>
              </div>

              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Footer Navigation</h3>
              <p className="text-xs text-gray-500">Προσθέστε, αφαιρέστε ή τροποποιήστε τους συνδέσμους στο footer.</p>
              <div className="space-y-2">
                {editFooterNav.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <GripVertical size={14} className="text-gray-600 shrink-0" />
                    <input value={link.label} onChange={e => updateNavLink(i, 'label', e.target.value, true)} className="input flex-1 text-sm" placeholder="Label" />
                    <input value={link.path} onChange={e => updateNavLink(i, 'path', e.target.value, true)} className="input flex-1 text-sm" placeholder="/path" />
                    <button onClick={() => removeNavLink(i, true)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={() => addNavLink(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη συνδέσμου</button>
              </div>
            </>
          )}

          {/* CTA */}
          {activeTab === 'cta' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">CTA Band (Call to Action)</h3>
              {renderField('cta_band_title', 'Title')}
              {renderField('cta_band_subtitle', 'Subtitle', { rows: 2 })}
              <div className="grid grid-cols-2 gap-4">
                {renderField('cta_band_button_text', 'Button Text')}
                {renderField('cta_band_button_link', 'Button Link')}
              </div>
            </>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <>
              <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Default SEO Settings</h3>
              <p className="text-xs text-gray-500">Αυτά τα meta tags χρησιμοποιούνται σε σελίδες χωρίς δυναμικά δεδομένα.</p>
              {renderField('seo_default_title', 'Default Meta Title')}
              {renderField('seo_default_description', 'Default Meta Description', { rows: 3 })}
              {renderField('seo_default_og_image', 'Default OG Image URL', { isImage: true })}
            </>
          )}

        </div>
      </div>

      {pickerTarget && (
        <MediaPicker
          open={!!pickerTarget}
          onClose={() => setPickerTarget(null)}
          onSelect={(url) => { setValue(pickerTarget, url); setPickerTarget(null); }}
        />
      )}
    </div>
  );
}
