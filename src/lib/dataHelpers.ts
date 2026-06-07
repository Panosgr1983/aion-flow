import { supabase, isSupabaseAvailable } from './supabase';
import { mockCategories, mockProducts, mockCustomers, mockOrders, mockMedia, mockAnalytics, mockServices, mockBlogPosts, mockTestimonials, mockCredentials, mockCoreValues, mockSiteSettings, mockTenantId } from './mockData';
import { Category, Product, Customer, Order, Media, Service, BlogPost, Testimonial, Credential, CoreValue, SiteSetting } from '../types/supabase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      return data as T;
    },
    async update(id: string, updates: Partial<T>): Promise<T> {
      if (!isSupabaseAvailable()) {
        await delay(300);
        const idx = (mockData as T[]).findIndex(d => d.id === id);
        if (idx !== -1) (mockData as T[])[idx] = { ...(mockData as T[])[idx], ...updates, updated_at: new Date().toISOString() };
        return (mockData as T[])[idx];
      }
      const { data, error } = await supabase.from(tableName).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data as T;
    },
    async delete(id: string): Promise<void> {
      if (!isSupabaseAvailable()) {
        await delay(300);
        const idx = (mockData as T[]).findIndex(d => d.id === id);
        if (idx !== -1) (mockData as T[]).splice(idx, 1);
        return;
      }
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
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
export const siteSettingsHelper = {
  ...createMockHelper<SiteSetting>(mockSiteSettings, 'site_settings'),
  async getAll(): Promise<SiteSetting[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockSiteSettings]; }
    const { data, error } = await supabase.from('site_settings').select('*').order('category').order('key');
    if (error) throw error;
    return data ?? [];
  },
};
