import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Image as ImageIcon, Check, X } from 'lucide-react';
import { servicesHelper, serviceRelatedArticlesHelper, blogPostsHelper, serviceFaqHelper } from '../../lib/dataHelpers';
import { uploadCmsAsset } from '../../lib/media';
import { useTenant } from '../../lib/useTenant';
import { trackEvent } from '../../lib/analytics';
import { Service, BlogPost, ServiceFaqEntry } from '../../types/supabase';
import MediaPicker from './MediaPicker';

type Tab = 'general' | 'related-articles' | 'faq' | 'seo';

const iconOptions = ['user', 'sparkles', 'brain', 'heart', 'users', 'book-open', 'lock', 'shield', 'star', 'globe', 'sun', 'moon', 'leaf', 'feather', 'compass'];
const modeOptions = [
  { value: 'manual', label: 'Χειροκίνητα' },
  { value: 'category', label: 'Από κατηγορία' },
  { value: 'latest', label: 'Πιο πρόσφατα' },
];

const emptyForm: Partial<Service> = { tenant_id: null, title: '', slug: '', short_description: '', long_description: '', icon: 'heart', image_url: '', sort_order: 0, is_active: true, meta_title: '', meta_description: '', og_image: '', show_related_articles: false, related_articles_mode: 'manual', related_articles_limit: 6, related_articles_title: 'Σχετικά άρθρα', related_articles_title_en: 'Related Articles' };

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function Services() {
  const { effectiveTenantId } = useTenant();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [postSearch, setPostSearch] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [faqEntries, setFaqEntries] = useState<{ question: string; answer: string }[]>([]);
  const [faqDirty, setFaqDirty] = useState(false);

  useEffect(() => { servicesHelper.getAll().then(d => { setItems(d); setLoading(false); }); }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: items.length + 1 });
    setActiveTab('general');
    setSelectedPostIds([]);
    setPostSearch('');
    setFaqEntries([]);
    setFaqDirty(false);
    setShowModal(true);
  };

  const openEdit = async (item: Service) => {
    setEditing(item);
    setForm(item);
    setActiveTab('general');
    setSelectedPostIds([]);
    setPostSearch('');
    setFaqEntries([]);
    setFaqDirty(false);
    setShowModal(true);
    setLoadingPosts(true);
    try {
      const relations = await serviceRelatedArticlesHelper.getByService(item.id);
      setSelectedPostIds(relations.map(r => r.blog_post_id));
    } catch {}
    setLoadingPosts(false);
    try {
      const faqs = await serviceFaqHelper.getByService(item.id);
      setFaqEntries(faqs.map(f => ({ question: f.question, answer: f.answer })));
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || slugify(form.title || '');
    const payload = { ...form, slug };

    if (editing) {
      const updated = await servicesHelper.update(editing.id, payload);
      setItems(prev => prev.map(i => i.id === editing.id ? updated : i));
      trackEvent('cms.service_updated', { service_title: form.title || '', fields_changed: Object.keys(payload) }).catch(() => {});
      await serviceRelatedArticlesHelper.setRelations(editing.id, selectedPostIds);
      await serviceFaqHelper.setFaq(editing.id, faqEntries);
    } else {
      const created = await servicesHelper.create(payload);
      setItems(prev => [...prev, created]);
      trackEvent('cms.service_created', { service_title: form.title || '' }).catch(() => {});
      await serviceRelatedArticlesHelper.setRelations(created.id, selectedPostIds);
      await serviceFaqHelper.setFaq(created.id, faqEntries);
    }

    if (form.image_url) {
      try {
        const { siteSettingsHelper } = await import('../../lib/dataHelpers');
        const all = await siteSettingsHelper.getAll();
        const existing = all.find(s => s.key === 'page_data');
        const pageData = existing?.value && typeof existing.value === 'object'
          ? JSON.parse(JSON.stringify(existing.value))
          : {};
        const svcKey = `/services/${slug}`;
        pageData[svcKey] = { ...(pageData[svcKey] || {}), hero_image: form.image_url, title: form.title };
        if (existing) {
          await siteSettingsHelper.update(existing.id, { value: pageData });
        } else {
          const { siteSettingsHelper: ssh } = await import('../../lib/dataHelpers');
          await ssh.create({
            key: 'page_data', value: pageData, category: 'general',
            tenant_id: '00000000-0000-0000-0000-000000000001',
          });
        }
      } catch {}
    }

    setSaving(false); setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const deletedItem = items.find(i => i.id === deleteId);
    await servicesHelper.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
    if (deletedItem) {
      trackEvent('cms.service_deleted', { service_title: deletedItem.title }).catch(() => {});
    }
  };

  const movePost = (postId: string, direction: 'up' | 'down') => {
    const idx = selectedPostIds.indexOf(postId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const next = [...selectedPostIds];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      setSelectedPostIds(next);
    } else if (direction === 'down' && idx < selectedPostIds.length - 1) {
      const next = [...selectedPostIds];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      setSelectedPostIds(next);
    }
  };

  const togglePost = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const postSearchOpen = async () => {
    if (allPosts.length === 0) {
      setLoadingPosts(true);
      try {
        const posts = await blogPostsHelper.getAll();
        setAllPosts(posts.filter(p => p.is_published));
      } catch {}
      setLoadingPosts(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'Γενικά' },
    { key: 'related-articles', label: 'Σχετικά Άρθρα' },
    { key: 'faq', label: 'Συχνές Ερωτήσεις' },
    { key: 'seo', label: 'SEO' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Υπηρεσίες</h2><p className="text-sm text-gray-500">{items.length} υπηρεσίες</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Νέα Υπηρεσία</button>
      </div>

      <div className="card p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9" /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="card p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><span className="text-blue-400 text-lg capitalize">{item.icon?.charAt(0) || '?'}</span></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{item.short_description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>{item.is_active ? 'Ενεργό' : 'Ανενεργό'}</span>
              <span className="text-xs text-gray-600">Σειρά: {item.sort_order}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">Δεν βρέθηκαν υπηρεσίες</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Επεξεργασία' : 'Νέα'} Υπηρεσία</h3>

            <div className="flex gap-1 mb-6 border-b border-gray-800">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeTab === 'general' && (
                <>
                  <div><label className="text-xs text-gray-500 block mb-1">Τίτλος</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 block mb-1">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Εικονίδιο</label><select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input">{iconOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Σύντομη περιγραφή</label><textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="input h-20 resize-none" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Αναλυτική περιγραφή</label><textarea value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} className="input h-24 resize-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 block mb-1">Σειρά</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Ενεργό</label><select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="input"><option value="true">Ναι</option><option value="false">Όχι</option></select></div>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Εικόνα Hero</label><div className="flex gap-2"><input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input flex-1" /><button type="button" onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async () => { const f = inp.files?.[0]; if (!f) return; setImageUploading(true); try { if (!effectiveTenantId) { alert('Δεν βρέθηκε tenant'); return; } const media = await uploadCmsAsset(f, { tenantId: effectiveTenantId, bucket: 'site-images', category: 'service', source: 'editor' }); setForm(prev => ({ ...prev, image_url: media.url })); } catch { alert('Αποτυχία'); } finally { setImageUploading(false); } }; inp.click(); }} disabled={imageUploading} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors disabled:opacity-50 text-xs"><Upload size={14} /></button><button type="button" onClick={() => setPickerOpen(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-xs"><ImageIcon size={14} /></button></div></div>
                </>
              )}

              {activeTab === 'related-articles' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-500">Εμφάνιση σχετικών άρθρων</label>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, show_related_articles: !f.show_related_articles }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.show_related_articles ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.show_related_articles ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-gray-500 block mb-1">Τρόπος επιλογής</label><select value={form.related_articles_mode || 'manual'} onChange={e => setForm(f => ({ ...f, related_articles_mode: e.target.value as any }))} className="input">{modeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Μέγιστος αριθμός</label><input type="number" value={form.related_articles_limit ?? 6} onChange={e => setForm(f => ({ ...f, related_articles_limit: parseInt(e.target.value) || 6 }))} className="input" min={1} max={50} /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Τίτλος ενότητας (EL)</label><input value={form.related_articles_title || 'Σχετικά άρθρα'} onChange={e => setForm(f => ({ ...f, related_articles_title: e.target.value }))} className="input" /></div>
                  </div>
                  <div className="grid grid-cols-1">
                    <div><label className="text-xs text-gray-500 block mb-1">Τίτλος ενότητας (EN)</label><input value={form.related_articles_title_en || 'Related Articles'} onChange={e => setForm(f => ({ ...f, related_articles_title_en: e.target.value }))} className="input" /></div>
                  </div>

                  {form.related_articles_mode === 'manual' && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-2">Επιλεγμένα άρθρα ({selectedPostIds.length})</label>
                      <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          value={postSearch}
                          onChange={e => setPostSearch(e.target.value)}
                          onFocus={postSearchOpen}
                          placeholder="Αναζήτηση άρθρων..."
                          className="input pl-9 text-sm"
                        />
                      </div>
                      {loadingPosts ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Φόρτωση άρθρων...</div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-800 rounded-xl p-2">
                          {(postSearch
                            ? allPosts.filter(p =>
                                p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
                                p.category.toLowerCase().includes(postSearch.toLowerCase())
                              )
                            : allPosts
                          ).map(post => {
                            const isSelected = selectedPostIds.includes(post.id);
                            return (
                              <div key={post.id} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500/10' : 'hover:bg-gray-800/50'}`}>
                                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => togglePost(post.id)}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/30 shrink-0"
                                  />
                                  <span className="text-sm truncate">{post.title}</span>
                                  <span className="text-xs text-gray-600 shrink-0">{post.category}</span>
                                </label>
                                {isSelected && (
                                  <div className="flex gap-1 shrink-0 ml-2">
                                    <button type="button" onClick={() => movePost(post.id, 'up')} disabled={selectedPostIds.indexOf(post.id) === 0} className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs">▲</button>
                                    <button type="button" onClick={() => movePost(post.id, 'down')} disabled={selectedPostIds.indexOf(post.id) === selectedPostIds.length - 1} className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs">▼</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {allPosts.length === 0 && <div className="text-center py-4 text-gray-500 text-sm">Δεν βρέθηκαν δημοσιευμένα άρθρα</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">{faqEntries.length} ερωτήσεις</label>
                    <button
                      type="button"
                      onClick={() => {
                        setFaqEntries(prev => [...prev, { question: '', answer: '' }]);
                        setFaqDirty(true);
                      }}
                      className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      + Προσθήκη ερώτησης
                    </button>
                  </div>

                  {faqEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">Δεν υπάρχουν ερωτήσεις. Πατήστε "Προσθήκη ερώτησης" για να ξεκινήσετε.</div>
                  )}

                  <div className="space-y-3">
                    {faqEntries.map((entry, idx) => (
                      <div key={idx} className="border border-gray-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500 shrink-0">#{idx + 1}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === 0) return;
                                const next = [...faqEntries];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                setFaqEntries(next);
                                setFaqDirty(true);
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                            >▲</button>
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === faqEntries.length - 1) return;
                                const next = [...faqEntries];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                setFaqEntries(next);
                                setFaqDirty(true);
                              }}
                              disabled={idx === faqEntries.length - 1}
                              className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                            >▼</button>
                            <button
                              type="button"
                              onClick={() => {
                                setFaqEntries(prev => prev.filter((_, i) => i !== idx));
                                setFaqDirty(true);
                              }}
                              className="p-1 rounded text-red-500 hover:text-red-400 text-xs"
                            >✕</button>
                          </div>
                        </div>
                        <div><label className="text-xs text-gray-500 block mb-1">Ερώτηση</label><textarea value={entry.question} onChange={e => { const next = [...faqEntries]; next[idx] = { ...next[idx], question: e.target.value }; setFaqEntries(next); setFaqDirty(true); }} className="input h-16 resize-none" placeholder="Π.χ. Πόσο διαρκεί μια συνεδρία;" /></div>
                        <div><label className="text-xs text-gray-500 block mb-1">Απάντηση</label><textarea value={entry.answer} onChange={e => { const next = [...faqEntries]; next[idx] = { ...next[idx], answer: e.target.value }; setFaqEntries(next); setFaqDirty(true); }} className="input h-20 resize-none" placeholder="Π.χ. Κάθε συνεδρία διαρκεί περίπου 50 λεπτά." /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-3">
                  <div><label className="text-xs text-gray-500 block mb-1">Meta Title</label><input value={form.meta_title || ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="input" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Meta Description</label><textarea value={form.meta_description || ''} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} className="input h-16 resize-none" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">OG Image (social)</label><input value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} className="input" placeholder="π.χ. για sharing σε social media" /></div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Ακύρωση</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
            </div>
          </div>
        </div>
      )}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => setForm(f => ({ ...f, image_url: url }))} folder="services" />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Διαγραφή</h3><p className="text-sm text-gray-400 mb-4">Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την υπηρεσία;</p>
            <div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary">Ακύρωση</button><button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium">Διαγραφή</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
