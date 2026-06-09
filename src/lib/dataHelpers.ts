import { supabase, isSupabaseAvailable } from './supabase';
import { mockCategories, mockProducts, mockCustomers, mockOrders, mockMedia, mockAnalytics, mockServices, mockBlogPosts, mockTestimonials, mockCredentials, mockCoreValues, mockSiteSettings, mockTenantId, mockContactSubmissions } from './mockData';
import { Category, Product, Customer, Order, Media, Service, BlogPost, Testimonial, Credential, CoreValue, SiteSetting, ContactSubmission, ContentHistory } from '../types/supabase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ENTITY_NAME_FIELDS: Record<string, string> = {
  services: 'title',
  blog_posts: 'title',
  testimonials: 'name',
  credentials: 'title',
  core_values: 'title',
  site_settings: 'key',
};

function getEntityName(tableName: string, record: any): string {
  const field = ENTITY_NAME_FIELDS[tableName];
  return field ? String(record?.[field] ?? '') : '';
}

function computeChangedFields(before: any, after: any): string[] {
  const skip = new Set(['id', 'tenant_id', 'created_at', 'updated_at', 'created_by']);
  if (!before || !after) return [];
  const changed: string[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    if (skip.has(k)) continue;
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) changed.push(k);
  }
  return changed;
}

function generateSummary(tableName: string, entityName: string | null, operation: string, fields: string[] | null): string {
  const labels: Record<string, string> = {
    services: 'υπηρεσία',
    blog_posts: 'άρθρο',
    testimonials: 'κριτική',
    credentials: 'πιστοποίηση',
    core_values: 'αξία',
    site_settings: 'ρύθμιση',
  };
  const label = labels[tableName] || tableName;
  const name = entityName || '';
  switch (operation) {
    case 'create': return `Δημιουργήθηκε ${label}${name ? ` «${name}»` : ''}`;
    case 'update': { const f = fields?.length ? fields.join(', ') : ''; return `Ενημερώθηκε ${label}${name ? ` «${name}»` : ''}${f ? ` — ${f}` : ''}`; }
    case 'delete': return `Διαγράφηκε ${label}${name ? ` «${name}»` : ''}`;
    case 'restore': return `Επαναφορά ${label}${name ? ` «${name}»` : ''}`;
    case 'backup': return `Δημιουργήθηκε backup${name ? ` «${name}»` : ''}`;
    default: return '';
  }
}

async function saveHistoryEntry(opts: {
  tableName: string; recordId: string | null; entityName: string | null;
  operation: ContentHistory['operation']; changedFields: string[] | null;
  snapshotBefore: any; snapshotAfter: any; summary: string;
}) {
  if (!isSupabaseAvailable()) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('content_history').insert({
      tenant_id: mockTenantId,
      table_name: opts.tableName,
      record_id: opts.recordId,
      entity_name: opts.entityName,
      operation: opts.operation,
      changed_fields: opts.changedFields,
      snapshot_before: opts.snapshotBefore,
      snapshot_after: opts.snapshotAfter,
      summary: opts.summary,
      user_id: user?.id || user?.email || null,
      metadata: { source: 'dashboard' },
    });
  } catch (err) {
    console.warn('Failed to save content history:', err);
  }
}

const FOLDER_OPTIONS = ['general', 'services', 'blog', 'about', 'testimonials', 'credentials'] as const;
export type FolderCategory = typeof FOLDER_OPTIONS[number];
export { FOLDER_OPTIONS };

export const FOLDER_LABELS: Record<string, string> = {
  general: 'Γενικά', services: 'Υπηρεσίες', blog: 'Blog', about: 'Σχετικά', testimonials: 'Κριτικές', credentials: 'Πιστοποιήσεις',
};

export const MEDIA_FOLDERS = FOLDER_OPTIONS.map(f => ({ value: f, label: FOLDER_LABELS[f] || f }));

export function getDataMode(): 'live' | 'demo' {
  return isSupabaseAvailable() ? 'live' : 'demo';
}

export const categoriesHelper = {
  async getAll(): Promise<Category[]> {
    if (!isSupabaseAvailable()) { await delay(300); return mockCategories; }
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string): Promise<Category | null> {
    if (!isSupabaseAvailable()) { await delay(200); return mockCategories.find(c => c.id === id) ?? null; }
    const { data } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
    return data;
  },
  async create(category: Partial<Category>): Promise<Category> {
    if (!isSupabaseAvailable()) { await delay(300); const newCat: Category = { ...category as Category, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 0 }; mockCategories.push(newCat); return newCat; }
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<Category>): Promise<Category> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockCategories.findIndex(c => c.id === id); if (idx !== -1) mockCategories[idx] = { ...mockCategories[idx], ...updates, updated_at: new Date().toISOString() }; return mockCategories[idx]; }
    const { data, error } = await supabase.from('categories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockCategories.findIndex(c => c.id === id); if (idx !== -1) mockCategories.splice(idx, 1); return; }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};

export const productsHelper = {
  async getAll(): Promise<Product[]> {
    if (!isSupabaseAvailable()) { await delay(300); return mockProducts.map(p => ({ ...p, categories: mockCategories.find(c => c.id === p.category_id) })); }
    const { data, error } = await supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string): Promise<Product | null> {
    if (!isSupabaseAvailable()) { await delay(200); return mockProducts.find(p => p.id === id) ?? null; }
    const { data } = await supabase.from('products').select('*, categories(*)').eq('id', id).maybeSingle();
    return data;
  },
  async create(product: Partial<Product>): Promise<Product> {
    if (!isSupabaseAvailable()) { await delay(300); const newProd: Product = { ...product as Product, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; mockProducts.push(newProd); return newProd; }
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockProducts.findIndex(p => p.id === id); if (idx !== -1) mockProducts[idx] = { ...mockProducts[idx], ...updates, updated_at: new Date().toISOString() }; return mockProducts[idx]; }
    const { data, error } = await supabase.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockProducts.findIndex(p => p.id === id); if (idx !== -1) mockProducts.splice(idx, 1); return; }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

export const customersHelper = {
  async getAll(): Promise<Customer[]> {
    if (!isSupabaseAvailable()) { await delay(300); return mockCustomers; }
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string): Promise<Customer | null> {
    if (!isSupabaseAvailable()) { await delay(200); return mockCustomers.find(c => c.id === id) ?? null; }
    const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
    return data;
  },
  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockCustomers.findIndex(c => c.id === id); if (idx !== -1) mockCustomers.splice(idx, 1); return; }
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },
};

export const ordersHelper = {
  async getAll(): Promise<Order[]> {
    if (!isSupabaseAvailable()) { await delay(300); return mockOrders; }
    const { data, error } = await supabase.from('orders').select('*, customers(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async update(id: string, updates: Partial<Order>): Promise<Order> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockOrders.findIndex(o => o.id === id); if (idx !== -1) mockOrders[idx] = { ...mockOrders[idx], ...updates, updated_at: new Date().toISOString() }; return mockOrders[idx]; }
    const { data, error } = await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*, customers(*)').single();
    if (error) throw error;
    return data;
  },
};

const SITE_FOLDERS = ['general', 'services', 'blog', 'about', 'testimonials', 'credentials'];

export const mediaHelper = {
  async getAll(): Promise<Media[]> {
    if (!isSupabaseAvailable()) { await delay(300); return mockMedia; }
    const { data, error } = await supabase.from('media').select('*').in('folder', SITE_FOLDERS).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string): Promise<Media | null> {
    if (!isSupabaseAvailable()) { await delay(200); return mockMedia.find(m => m.id === id) ?? null; }
    const { data } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
    return data as Media | null;
  },
  async upload(file: File, folder: string = 'general', options?: { alt_text?: string; caption?: string }): Promise<Media> {
    if (!isSupabaseAvailable()) {
      await delay(500);
      const newMedia: Media = {
        id: crypto.randomUUID(), name: file.name, original_name: file.name, url: URL.createObjectURL(file),
        public_id: '', mime_type: file.type, size: file.size, width: null, height: null,
        folder, alt_text: options?.alt_text || '', caption: options?.caption || '', tags: [],
        created_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      mockMedia.push(newMedia);
      return newMedia;
    }
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('site-images').upload(fileName, file, { cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl(fileName);

    const { data, error } = await supabase.from('media').insert({
      name: file.name, original_name: file.name, url: publicUrl,
      mime_type: file.type, size: file.size, folder,
      alt_text: options?.alt_text || '', caption: options?.caption || '',
    }).select().single();
    if (error) throw error;
    return data as Media;
  },
  async update(id: string, updates: Partial<Media>): Promise<Media> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockMedia.findIndex(m => m.id === id); if (idx !== -1) mockMedia[idx] = { ...mockMedia[idx], ...updates, updated_at: new Date().toISOString() }; return mockMedia[idx]; }
    const { data, error } = await supabase.from('media').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data as Media;
  },
  async delete(id: string): Promise<void> {
    if (!isSupabaseAvailable()) { await delay(300); const idx = mockMedia.findIndex(m => m.id === id); if (idx !== -1) { mockMedia.splice(idx, 1); } return; }
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) throw error;
  },
};

export const analyticsHelper = {
  async getDashboardData() {
    await delay(isSupabaseAvailable() ? 0 : 400);
    return mockAnalytics;
  },
};

function createMockHelper<T extends { id: string }>(mockData: T[], tableName: string) {
  return {
    async getAll(): Promise<T[]> {
      if (!isSupabaseAvailable()) { await delay(300); return [...mockData]; }
      const { data, error } = await supabase.from(tableName).select('*').order('sort_order').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    async getById(id: string): Promise<T | null> {
      if (!isSupabaseAvailable()) { await delay(200); return mockData.find(d => d.id === id) ?? null; }
      const { data } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      return data as T | null;
    },
    async create(item: Partial<T>): Promise<T> {
      if (!isSupabaseAvailable()) {
        await delay(300);
        const newItem = { ...item as T, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        (mockData as T[]).push(newItem);
        return newItem;
      }
      const { data, error } = await supabase.from(tableName).insert({ ...item, tenant_id: mockTenantId }).select().single();
      if (error) throw error;
      const created = data as T;
      const entityName = getEntityName(tableName, created);
      const summary = generateSummary(tableName, entityName, 'create', null);
      void saveHistoryEntry({ tableName, recordId: created.id, entityName, operation: 'create', changedFields: null, snapshotBefore: null, snapshotAfter: created, summary });
      return created;
    },
    async update(id: string, updates: Partial<T>): Promise<T> {
      if (!isSupabaseAvailable()) {
        await delay(300);
        const idx = (mockData as T[]).findIndex(d => d.id === id);
        if (idx !== -1) (mockData as T[])[idx] = { ...(mockData as T[])[idx], ...updates, updated_at: new Date().toISOString() };
        return (mockData as T[])[idx];
      }
      const { data: before } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      const { data, error } = await supabase.from(tableName).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      const after = data as T;
      const changed = computeChangedFields(before, after);
      const entityName = getEntityName(tableName, before || after);
      const summary = generateSummary(tableName, entityName, 'update', changed);
      void saveHistoryEntry({ tableName, recordId: id, entityName, operation: 'update', changedFields: changed, snapshotBefore: before, snapshotAfter: after, summary });
      return after;
    },
    async delete(id: string): Promise<void> {
      if (!isSupabaseAvailable()) {
        await delay(300);
        const idx = (mockData as T[]).findIndex(d => d.id === id);
        if (idx !== -1) (mockData as T[]).splice(idx, 1);
        return;
      }
      const { data: before } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      if (before) {
        const entityName = getEntityName(tableName, before);
        const summary = generateSummary(tableName, entityName, 'delete', null);
        void saveHistoryEntry({ tableName, recordId: id, entityName, operation: 'delete', changedFields: null, snapshotBefore: before, snapshotAfter: null, summary });
      }
    },
  };
}

export const servicesHelper = createMockHelper<Service>(mockServices, 'services');
export const blogPostsHelper = {
  ...createMockHelper<BlogPost>(mockBlogPosts, 'blog_posts'),
  async getAll(): Promise<BlogPost[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockBlogPosts]; }
    const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
export const testimonialsHelper = createMockHelper<Testimonial>(mockTestimonials, 'testimonials');
export const credentialsHelper = createMockHelper<Credential>(mockCredentials, 'credentials');
export const coreValuesHelper = createMockHelper<CoreValue>(mockCoreValues, 'core_values');
export const contactSubmissionsHelper = {
  ...createMockHelper<ContactSubmission>(mockContactSubmissions, 'contact_submissions'),
  async getAll(): Promise<ContactSubmission[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockContactSubmissions]; }
    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const siteSettingsHelper = {
  ...createMockHelper<SiteSetting>(mockSiteSettings, 'site_settings'),
  async getAll(): Promise<SiteSetting[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockSiteSettings]; }
    const { data, error } = await supabase.from('site_settings').select('*').order('category').order('key');
    if (error) throw error;
    return data ?? [];
  },
};

export const restoreHelper = {
  async restore(entry: ContentHistory): Promise<void> {
    if (!entry.snapshot_before) throw new Error('Δεν υπάρχει snapshot προς επαναφορά');
    if (!entry.table_name || !entry.record_id) throw new Error('Λείπει table_name ή record_id');
    if (!isSupabaseAvailable()) throw new Error('Η επαναφορά δεν είναι διαθέσιμη σε demo mode');

    const { data: current } = await supabase.from(entry.table_name).select('*').eq('id', entry.record_id).maybeSingle();

    const restored = typeof structuredClone === 'function'
      ? structuredClone(entry.snapshot_before)
      : JSON.parse(JSON.stringify(entry.snapshot_before));
    delete restored.id;
    delete restored.created_at;
    delete restored.updated_at;
    delete restored.tenant_id;

    if (current) {
      await supabase.from(entry.table_name).update({ ...restored, updated_at: new Date().toISOString() }).eq('id', entry.record_id);
    } else {
      await supabase.from(entry.table_name).insert({ ...restored, id: entry.record_id, tenant_id: mockTenantId });
    }

    const entityName = entry.entity_name || getEntityName(entry.table_name, entry.snapshot_before);
    const summary = generateSummary(entry.table_name, entityName, 'restore', null);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('content_history').insert({
      tenant_id: mockTenantId,
      table_name: entry.table_name,
      record_id: entry.record_id,
      entity_name: entityName,
      operation: 'restore',
      restored_from_history_id: entry.id,
      snapshot_before: current || null,
      snapshot_after: entry.snapshot_before,
      summary,
      user_id: user?.id || user?.email || null,
      metadata: { source: 'dashboard', action: 'restore' },
    });
  },
};
