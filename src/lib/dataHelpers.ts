/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Data Helpers (CRUD για όλους τους πίνακες)
  
  Παρέχει typed CRUD operations για κάθε entity της πλατφόρμας.
  
  Κάθε helper ακολουθεί το ίδιο pattern:
    - getAll()      → SELECT * (με ordering)
    - getById()     → SELECT με id
    - create()      → INSERT
    - update()      → UPDATE + history logging
    - delete()      → DELETE (ή soft delete όπου υποστηρίζεται)
  
  Τα helpers λειτουργούν και σε live mode (Supabase) 
  και σε demo mode (mock data in memory).
  
  Περιλαμβάνει:
    conversationsHelper    → Συνομιλίες CRM (με soft delete + trash)
    contactMessagesHelper → Μηνύματα (με reply, archive, auto-conversation)
    draftsHelper          → Προσχέδια email (με auto-save)
    crmHealthHelper       → Έλεγχοι συστήματος (SMTP, sync, edge functions)
    crmMetricsHelper      → Μετρικές pipeline (leads, conversion, revenue)
    monitoringHelper      → Monitoring (errors, SMTP stats, storage)
    emailAccountsHelper   → Συνδεδεμένα email accounts
  ═══════════════════════════════════════════════════════════════
*/

import { supabase, isSupabaseAvailable } from './supabase';
import { mockCategories, mockProducts, mockCustomers, mockOrders, mockMedia, mockAnalytics, mockServices, mockBlogPosts, mockTestimonials, mockCredentials, mockCoreValues, mockSiteSettings, mockTenantId, mockContactSubmissions, mockConversations, mockContactMessages, mockFollowUpTasks } from './mockData';
import { Category, Product, Customer, Order, Media, Service, BlogPost, Testimonial, Credential, CoreValue, SiteSetting, ContactSubmission, Conversation, ContactMessage, FollowUpTask, EmailAccount, EmailDraft, ContentHistory } from '../types/supabase';
import { trackEvent } from './analytics';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ENTITY_NAME_FIELDS: Record<string, string> = {
  services: 'title',
  blog_posts: 'title',
  testimonials: 'name',
  credentials: 'title',
  core_values: 'title',
  site_settings: 'key',
  contact_conversations: 'email',
  contact_messages: 'email',
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

export const conversationsHelper = {
  ...createMockHelper<Conversation>(mockConversations, 'contact_conversations'),
  async getAll(): Promise<Conversation[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockConversations]; }
    const { data, error } = await supabase.from('contact_conversations').select('*').is('deleted_at', null).order('last_message_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getTrash(): Promise<Conversation[]> {
    if (!isSupabaseAvailable()) { await delay(300); return []; }
    const { data, error } = await supabase.from('contact_conversations').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getActiveByEmail(email: string): Promise<Conversation | null> {
    const all = await this.getAll();
    return all.find(c => c.email.toLowerCase() === email.toLowerCase() && c.status === 'active') ?? null;
  },
  async softDelete(id: string): Promise<void> {
    await this.update(id, { deleted_at: new Date().toISOString() } as any);
  },
  async restore(id: string): Promise<void> {
    await this.update(id, { deleted_at: null } as any);
  },
  async getUnreadCount(): Promise<number> {
    if (!isSupabaseAvailable()) { await delay(100); return mockContactMessages.filter(m => m.status === 'new').length; }
    const { data, error } = await supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new');
    if (error) throw error;
    return data?.length ?? 0;
  },
  async getLeads(): Promise<Conversation[]> {
    const all = await this.getAll();
    return all.filter(c => c.lead_stage);
  },
  async setLeadStage(id: string, stage: string): Promise<void> {
    const updates: any = { lead_stage: stage };
    if (stage === 'won') updates.won_at = new Date().toISOString();
    await this.update(id, updates as any);
  },
  async setLeadValue(id: string, value: number): Promise<void> {
    await this.update(id, { lead_value: value } as any);
  },
};

export const contactMessagesHelper = {
  ...createMockHelper<ContactMessage>(mockContactMessages, 'contact_messages'),
  async getAll(): Promise<ContactMessage[]> {
    if (!isSupabaseAvailable()) { await delay(300); return [...mockContactMessages]; }
    const { data, error } = await supabase.from('contact_messages').select('*').order('last_message_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getByConversation(conversationId: string): Promise<ContactMessage[]> {
    if (!isSupabaseAvailable()) { await delay(200); return mockContactMessages.filter(m => m.conversation_id === conversationId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); }
    const { data, error } = await supabase.from('contact_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  async createIncoming(msg: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<ContactMessage> {
    const existingConv = await conversationsHelper.getActiveByEmail(msg.email);
    let conversationId: string;
    if (existingConv) {
      conversationId = existingConv.id;
      await conversationsHelper.update(existingConv.id, { last_message_at: new Date().toISOString() });
    } else {
      conversationId = crypto.randomUUID();
      await conversationsHelper.create({
        id: conversationId,
        email: msg.email,
        name: msg.name,
        phone: msg.phone || '',
        status: 'active',
        last_message_at: new Date().toISOString(),
      } as any);
    }
    const newMsg = await this.create({
      conversation_id: conversationId,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || '',
      subject: msg.subject || '',
      message: msg.message,
      direction: 'incoming',
      status: 'new',
      attachments: [],
      last_message_at: new Date().toISOString(),
    } as any);
    await conversationsHelper.update(conversationId, { last_message_at: newMsg.created_at });
    return newMsg;
  },
  async reply(parentId: string, data: { message: string; attachments?: any[] }): Promise<ContactMessage> {
    const parent = await this.getById(parentId);
    if (!parent) throw new Error('Parent message not found');
    const reply = await this.create({
      conversation_id: parent.conversation_id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      subject: parent.subject.startsWith('Re:') ? parent.subject : `Re: ${parent.subject}`,
      message: data.message,
      direction: 'outgoing',
      status: 'read',
      parent_id: parentId,
      attachments: data.attachments || [],
      last_message_at: new Date().toISOString(),
    } as any);
    await this.update(parentId, { status: 'replied' });
    await conversationsHelper.update(parent.conversation_id, { last_message_at: reply.created_at });
    if (typeof window !== 'undefined') {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'reply',
          to: parent.email,
          subject: reply.subject,
          message: data.message,
          email: parent.email,
          attachments: data.attachments || [],
        }),
      }).catch(e => console.error('Email send error:', e));
    }
    trackEvent('crm.message_sent', { channel: 'email' }).catch(() => {});
    return reply;
  },
  async markRead(id: string): Promise<void> {
    await this.update(id, { status: 'read' } as any);
  },
  async archive(id: string): Promise<void> {
    const msg = await this.getById(id);
    if (!msg) return;
    await this.update(id, { status: 'archived' } as any);
    if (msg.conversation_id) {
      const allMsgs = await this.getByConversation(msg.conversation_id);
      const allArchived = allMsgs.every(m => (m.id === id ? true : m.status === 'archived'));
      if (allArchived) await conversationsHelper.update(msg.conversation_id, { status: 'archived' });
    }
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

export const emailAccountsHelper = {
  ...createMockHelper<EmailAccount>([], 'email_accounts'),
  async getAll(): Promise<EmailAccount[]> {
    if (!isSupabaseAvailable()) { await delay(300); return []; }
    const { data, error } = await supabase.from('email_accounts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const crmHealthHelper = {
  async getStatus(): Promise<{
    smtp: { ok: boolean; lastCheck?: string; error?: string };
    sync: { ok: boolean; submissions: number; messages: number; lastSync?: string };
    storage: { ok: boolean; fileCount: number };
    edgeFunction: { ok: boolean };
  }> {
    if (!isSupabaseAvailable()) {
      await delay(200);
      return { smtp: { ok: false }, sync: { ok: true, submissions: 0, messages: 0 }, storage: { ok: true, fileCount: 0 }, edgeFunction: { ok: false } };
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const smtpSettings = await supabase.from('site_settings').select('key, value').in('key', ['smtp_host', 'smtp_user', 'smtp_pass']);
    const smtpMap: Record<string, string> = {};
    (smtpSettings.data || []).forEach(s => { smtpMap[s.key] = String(s.value || ''); });
    const smtpOk = !!(smtpMap['smtp_host'] && smtpMap['smtp_user'] && smtpMap['smtp_pass']);

    const subCount = await supabase.from('contact_submissions').select('id', { count: 'exact', head: true });
    const msgCount = await supabase.from('contact_messages').select('id', { count: 'exact', head: true });
    const lastMsg = await supabase.from('contact_messages').select('created_at').order('created_at', { ascending: false }).limit(1);

    let fileCount = 0;
    try {
      const { data: files, error } = await supabase.storage.from('contact-attachments').list('', { limit: 0 });
      if (!error) fileCount = files?.length ?? 0;
    } catch {}

    let edgeOk = false;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new', name: 'health', email: 'health@check.com', message: 'health' }),
      });
      edgeOk = res.status === 200 || res.status === 400;
    } catch {}

    return {
      smtp: { ok: smtpOk, lastCheck: new Date().toISOString() },
      sync: {
        ok: Math.abs((subCount.count || 0) - (msgCount.count || 0)) <= 1,
        submissions: subCount.count || 0,
        messages: msgCount.count || 0,
        lastSync: lastMsg.data?.[0]?.created_at || undefined,
      },
      storage: { ok: true, fileCount },
      edgeFunction: { ok: edgeOk },
    };
  },
};

export const draftsHelper = {
  ...createMockHelper<EmailDraft>([], 'email_drafts'),
  async getAll(): Promise<EmailDraft[]> {
    if (!isSupabaseAvailable()) { await delay(300); return []; }
    const { data, error } = await supabase.from('email_drafts').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getDrafts(): Promise<EmailDraft[]> {
    const all = await this.getAll();
    return all.filter(d => d.status === 'draft');
  },
  async getScheduled(): Promise<EmailDraft[]> {
    const all = await this.getAll();
    return all.filter(d => d.status === 'scheduled');
  },
  async save(id: string | null, data: Partial<EmailDraft>): Promise<EmailDraft> {
    if (id) return this.update(id, { ...data, updated_at: new Date().toISOString() } as any);
    return this.create({ ...data, status: 'draft', updated_at: new Date().toISOString() } as any);
  },
};

export const tasksHelper = createMockHelper<FollowUpTask>(mockFollowUpTasks, 'follow_up_tasks');

export const monitoringHelper = {
  async getStatus(): Promise<{
    errors24h: number;
    smtp: { sent24h: number; failed24h: number; lastFailure?: string };
    edgeFunctions: { name: string; lastRun?: string; lastStatus?: string; duration?: number }[];
    storage: { totalFiles: number; uploaded24h: number; totalSizeMB: number };
    frontendErrors: { critical: number; warning: number };
  }> {
    if (!isSupabaseAvailable()) {
      await delay(200);
      return { errors24h: 0, smtp: { sent24h: 0, failed24h: 0 }, edgeFunctions: [], storage: { totalFiles: 0, uploaded24h: 0, totalSizeMB: 0 }, frontendErrors: { critical: 0, warning: 0 } };
    }
    const since24h = new Date(Date.now() - 86400000).toISOString();

    // SMTP via contact_messages
    const outgoing24h = await supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('direction', 'outgoing').gte('created_at', since24h);
    const smtpSent = outgoing24h.count || 0;

    // Backup jobs as proxy for edge function runs
    const { data: recentJobs } = await supabase.from('backup_jobs').select('*').order('created_at', { ascending: false }).limit(10);
    const failedJobs = (recentJobs || []).filter(j => j.status === 'failed' && j.created_at >= since24h).length;

    // Storage
    let storageFiles = 0; let storageSize = 0;
    try {
      const { data: files } = await supabase.storage.from('contact-attachments').list();
      storageFiles = files?.length ?? 0;
    } catch {}

    const edgeFunctions = [
      { name: 'send-contact-email', lastRun: recentJobs?.[0]?.created_at, lastStatus: recentJobs?.[0]?.status, duration: recentJobs?.[0]?.completed_at ? Math.round((new Date(recentJobs[0].completed_at!).getTime() - new Date(recentJobs[0].started_at).getTime()) / 1000) : undefined },
      { name: 'crm-backup', lastRun: recentJobs?.[0]?.created_at, lastStatus: recentJobs?.[0]?.status, duration: recentJobs?.[0]?.completed_at ? Math.round((new Date(recentJobs[0].completed_at!).getTime() - new Date(recentJobs[0].started_at).getTime()) / 1000) : undefined },
    ];

    return {
      errors24h: failedJobs,
      smtp: { sent24h: smtpSent, failed24h: failedJobs, lastFailure: recentJobs?.find(j => j.status === 'failed')?.created_at },
      edgeFunctions,
      storage: { totalFiles: storageFiles, uploaded24h: storageFiles, totalSizeMB: Math.round(storageSize / 1024 / 1024) },
      frontendErrors: { critical: 0, warning: 0 },
    };
  },
};

export const crmMetricsHelper = {
  async getMetrics(): Promise<{
    newLeads30d: number;
    contacted: number;
    proposals: number;
    won: number;
    lost: number;
    pipelineValue: number;
    wonValue: number;
    conversionRate: number;
  }> {
    if (!isSupabaseAvailable()) {
      await delay(200);
      return { newLeads30d: 0, contacted: 0, proposals: 0, won: 0, lost: 0, pipelineValue: 0, wonValue: 0, conversionRate: 0 };
    }
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const all = await supabase.from('contact_conversations').select('*');
    const convs = all.data || [];
    const new30d = convs.filter(c => c.created_at >= thirtyDaysAgo).length;
    const contacted = convs.filter(c => c.lead_stage === 'contacted').length;
    const proposals = convs.filter(c => c.lead_stage === 'proposal').length;
    const won = convs.filter(c => c.lead_stage === 'won').length;
    const lost = convs.filter(c => c.lead_stage === 'lost').length;
    const pipelineValue = convs.filter(c => ['new', 'contacted', 'proposal'].includes(c.lead_stage)).reduce((s, c) => s + (Number(c.lead_value) || 0), 0);
    const wonValue = convs.filter(c => c.lead_stage === 'won').reduce((s, c) => s + (Number(c.lead_value) || 0), 0);
    const totalClosed = won + lost;
    const conversionRate = totalClosed > 0 ? Math.round((won / totalClosed) * 100) : 0;
    return { newLeads30d: new30d, contacted, proposals, won, lost, pipelineValue, wonValue, conversionRate };
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
