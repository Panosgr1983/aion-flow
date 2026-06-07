import { useEffect, useState, useRef } from 'react';
import { Save, RefreshCw, Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { siteSettingsHelper, productsHelper } from '../../lib/dataHelpers';
import { uploadImage } from '../../lib/storage';
import MediaPicker from './MediaPicker';

const ICON_OPTIONS = ['clock', 'book', 'heart', 'sparkles', 'award', 'graduation'];

export default function AboutPanel() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bioParagraphs, setBioParagraphs] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleBookDragStart = (idx: number) => setDragIdx(idx);
  const handleBookDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...books];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setBooks(reordered.map((b, i) => ({ ...b, sort_order: (i + 1) * 10 })));
    setDragIdx(idx);
  };
  const handleBookDragEnd = () => {
    setDragIdx(null);
    const updated = books.map((b, i) => ({ ...b, sort_order: (i + 1) * 10 }));
    setBooks(updated);
    setVal('about_books', updated);
  };

  const ALL_KEYS = [
    'about_hero_eyebrow', 'about_hero_title', 'about_hero_subtitle',
    'about_hero_image', 'about_hero_positioning',
    'about_bio_eyebrow', 'about_bio_title', 'about_bio_paragraphs',
    'about_portrait',
    'about_achievements',
    'about_books', 'about_books_cta_text', 'about_books_cta_url',
    'about_pull_quote', 'about_pull_quote_author',
    'credentials_section_title',
  ];

  const loadSettings = async () => {
    const all = await siteSettingsHelper.getAll();
    const map: Record<string, any> = {};
    for (const s of all) map[s.key] = s.value;
    setSettings(map);
    if (Array.isArray(map.about_bio_paragraphs)) setBioParagraphs(map.about_bio_paragraphs as string[]);
    if (Array.isArray(map.about_achievements)) setAchievements(map.about_achievements as any[]);
    if (Array.isArray(map.about_books)) setBooks(map.about_books as any[]);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const setVal = (key: string, val: any) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = async (file: File, targetKey: string) => {
    try { const url = await uploadImage(file, 'site-images'); setVal(targetKey, url); }
    catch { alert('Αποτυχία μεταφόρτωσης'); }
  };

  const updateBio = (idx: number, text: string) => {
    const updated = bioParagraphs.map((p, i) => i === idx ? text : p);
    setBioParagraphs(updated);
    setVal('about_bio_paragraphs', updated);
  };
  const addBio = () => setBioParagraphs([...bioParagraphs, '']);
  const removeBio = (idx: number) => {
    const updated = bioParagraphs.filter((_, i) => i !== idx);
    setBioParagraphs(updated);
    setVal('about_bio_paragraphs', updated);
  };

  const updateAchievement = (idx: number, field: string, val: string) => {
    const updated = achievements.map((a, i) => i === idx ? { ...a, [field]: val } : a);
    setAchievements(updated);
    setVal('about_achievements', updated);
  };
  const addAchievement = () => setAchievements([...achievements, { value: '', label: '', icon: 'award' }]);
  const removeAchievement = (idx: number) => {
    const updated = achievements.filter((_, i) => i !== idx);
    setAchievements(updated);
    setVal('about_achievements', updated);
  };

  const updateBook = (idx: number, field: string, val: any) => {
    const updated = books.map((b, i) => i === idx ? { ...b, [field]: val } : b);
    setBooks(updated);
    setVal('about_books', updated);
  };
  const addBook = () => setBooks([...books, { title: '', subtitle: '', type: '', cover_image: '', url: '', featured: false, sort_order: books.length + 1, description: '', publisher: '', isbn: '', year: 0 }]);
  const removeBook = (idx: number) => {
    const updated = books.filter((_, i) => i !== idx);
    setBooks(updated);
    setVal('about_books', updated);
  };

  const syncBooksToProducts = async (books: any[]) => {
    if (!Array.isArray(books)) return;
    const allProducts = await productsHelper.getAll();
    for (const book of books) {
      if (!book.cover_image || !book.title) continue;
      const match = allProducts.find(p =>
        p.sku?.startsWith('BOOK-') && (
          p.name.toLowerCase().includes(book.title.toLowerCase()) ||
          book.title.toLowerCase().includes(p.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim())
        )
      );
      if (match && match.image_url !== book.cover_image) {
        try { await productsHelper.update(match.id, { image_url: book.cover_image }); } catch {}
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    for (const s of await siteSettingsHelper.getAll()) {
      if (ALL_KEYS.includes(s.key) && settings[s.key] !== undefined) {
        await siteSettingsHelper.update(s.id, { value: settings[s.key] });
      }
    }
    if (settings['about_books']) {
      try { await syncBooksToProducts(settings['about_books']); } catch {}
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRefresh = () => { setLoading(true); loadSettings(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  const textField = (key: string, label: string, opts?: { rows?: number }) => {
    const val = settings[key] || '';
    return (
      <div key={key}>
        <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
        {opts?.rows && opts.rows > 1 ? (
          <textarea value={val} onChange={e => setVal(key, e.target.value)} className="input flex-1 resize-none" style={{ minHeight: `${opts.rows * 1.5}rem` }} />
        ) : (
          <input value={val} onChange={e => setVal(key, e.target.value)} className="input flex-1" />
        )}
        <div className="text-[10px] text-gray-700 mt-0.5 font-mono">{key}</div>
      </div>
    );
  };

  const imageField = (key: string, label: string) => {
    const val = settings[key] || '';
    return (
      <div key={key}>
        <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
        <div className="flex gap-2">
          <input value={val} onChange={e => setVal(key, e.target.value)} className="input flex-1 font-mono text-xs" />
          <button type="button" onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImageUpload(f, key); }; inp.click(); }} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-xs"><Upload size={14} /></button>
          <button type="button" onClick={() => setPickerTarget(key)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-xs">Βιβλ.</button>
        </div>
        <div className="text-[10px] text-gray-700 mt-0.5 font-mono">{key}</div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div><h2 className="text-xl font-semibold">Σχετικά με εμένα</h2><p className="text-sm text-gray-500">Περιεχόμενο σελίδας About</p></div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"><RefreshCw size={14} /></button>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Αποθήκευση...</> : <><Save size={16} /> {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</>}
        </button>
      </div>

      <div className="card p-6 space-y-5">
        {/* HERO */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textField('about_hero_eyebrow', 'Eyebrow')}
          {textField('about_hero_positioning', 'Positioning Tagline')}
        </div>
        {textField('about_hero_title', 'Title', { rows: 2 })}
        {textField('about_hero_subtitle', 'Subtitle', { rows: 2 })}
        {imageField('about_hero_image', 'Hero Background Image')}

        {/* BIO */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Bio Section</h3>
        <div className="grid grid-cols-2 gap-4">
          {textField('about_bio_eyebrow', 'Bio Eyebrow')}
          {textField('about_bio_title', 'Bio Title')}
        </div>
        <div className="p-3 bg-gray-900/50 rounded-xl space-y-3">
          <p className="text-xs text-gray-500">Παράγραφοι βιογραφικού</p>
          {bioParagraphs.map((p, i) => (
            <div key={i} className="flex gap-2 items-start">
              <textarea value={p} onChange={e => updateBio(i, e.target.value)} className="input flex-1 resize-none text-xs" style={{ minHeight: '4rem' }} />
              <button onClick={() => removeBio(i)} className="p-1.5 text-gray-500 hover:text-red-400 mt-1"><Trash2 size={13} /></button>
            </div>
          ))}
          <button onClick={addBio} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη παραγράφου</button>
        </div>
        {imageField('about_portrait', 'Portrait Image')}

        {/* ACHIEVEMENTS */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Achievement Strip</h3>
        <p className="text-xs text-gray-500">Στατιστικά που εμφανίζονται μεταξύ Hero και Bio.</p>
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <div key={i} className="flex gap-2 items-center bg-gray-900/30 rounded-xl p-3">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input value={a.value} onChange={e => updateAchievement(i, 'value', e.target.value)} className="input text-sm" placeholder="15+" />
                <input value={a.label} onChange={e => updateAchievement(i, 'label', e.target.value)} className="input text-sm" placeholder="Χρόνια εμπειρίας" />
                <select value={a.icon} onChange={e => updateAchievement(i, 'icon', e.target.value)} className="input text-sm">
                  {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button onClick={() => removeAchievement(i)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
          ))}
          <button onClick={addAchievement} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη achievement</button>
        </div>

        {/* BOOKS */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Books Showcase</h3>
        <p className="text-xs text-gray-500">Βιβλία που εμφανίζονται μεταξύ Bio και Credentials.</p>
        <div className="grid grid-cols-2 gap-4">
          {textField('about_books_cta_text', 'CTA Text')}
          {textField('about_books_cta_url', 'CTA Link')}
        </div>
        <div className="space-y-3">
          {books.map((b, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleBookDragStart(i)}
              onDragOver={(e) => handleBookDragOver(e, i)}
              onDragEnd={handleBookDragEnd}
              className={`flex gap-3 items-start bg-gray-900/30 rounded-xl p-3 ${dragIdx === i ? 'opacity-50 ring-1 ring-blue-500/30' : ''}`}
            >
              <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 shrink-0"><GripVertical size={16} /></div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={b.title} onChange={e => updateBook(i, 'title', e.target.value)} className="input text-sm" placeholder="Τίτλος βιβλίου" />
                  <input value={b.subtitle} onChange={e => updateBook(i, 'subtitle', e.target.value)} className="input text-sm" placeholder="Υπότιτλος" />
                </div>
                <input value={b.type || ''} onChange={e => updateBook(i, 'type', e.target.value)} className="input text-sm" placeholder="Τύπος (π.χ. Μυθιστόρημα, Ποίηση, Διηγήματα)" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex gap-2">
                    <input value={b.cover_image} onChange={e => updateBook(i, 'cover_image', e.target.value)} className="input flex-1 text-sm font-mono" placeholder="URL εξωφύλλου" />
                    <button type="button" onClick={() => setPickerTarget(`book_cover_${i}`)} className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-xs">Βιβλ.</button>
                  </div>
                  <input value={b.url} onChange={e => updateBook(i, 'url', e.target.value)} className="input text-sm font-mono" placeholder="URL αγοράς" />
                </div>
                <textarea value={b.description || ''} onChange={e => updateBook(i, 'description', e.target.value)} className="input resize-none text-sm" rows={2} placeholder="Σύνοψη / περιγραφή" />
                <div className="grid grid-cols-3 gap-2">
                  <input value={b.publisher || ''} onChange={e => updateBook(i, 'publisher', e.target.value)} className="input text-sm" placeholder="Εκδόσεις" />
                  <input value={b.isbn || ''} onChange={e => updateBook(i, 'isbn', e.target.value)} className="input text-sm font-mono" placeholder="ISBN" />
                  <input type="number" value={b.year || ''} onChange={e => updateBook(i, 'year', parseInt(e.target.value) || 0)} className="input text-sm" placeholder="Έτος" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" checked={!!b.featured} onChange={e => updateBook(i, 'featured', e.target.checked)} className="rounded" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    Σειρά:
                    <input type="number" value={b.sort_order || i + 1} onChange={e => updateBook(i, 'sort_order', parseInt(e.target.value) || 0)} className="input w-16 text-xs" />
                  </label>
                </div>
              </div>
              <button onClick={() => removeBook(i)} className="p-1.5 text-gray-500 hover:text-red-400 mt-1"><Trash2 size={13} /></button>
            </div>
          ))}
          <button onClick={addBook} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Προσθήκη βιβλίου</button>
        </div>

        {/* PULL QUOTE */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Pull Quote</h3>
        <p className="text-xs text-gray-500">Εμπνευσμένο απόσπασμα που εμφανίζεται μέσα στο Bio.</p>
        <div className="grid grid-cols-1 gap-4">
          {textField('about_pull_quote', 'Quote Text', { rows: 3 })}
          {textField('about_pull_quote_author', 'Author Name')}
        </div>

        {/* CREDENTIALS */}
        <h3 className="text-sm font-semibold text-blue-400 border-b border-gray-800 pb-2 mt-8">Credentials Section</h3>
        {textField('credentials_section_title', 'Section Title')}
      </div>

      {pickerTarget && (
        <MediaPicker
          open={!!pickerTarget}
          onClose={() => setPickerTarget(null)}
          onSelect={(url) => {
            if (pickerTarget.startsWith('book_cover_')) {
              const idx = parseInt(pickerTarget.replace('book_cover_', ''));
              updateBook(idx, 'cover_image', url);
            } else {
              setVal(pickerTarget, url);
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
