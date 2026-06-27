/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Τύποι & Διεπαφές TypeScript
  Κεντρικό αρχείο: όλοι οι τύποι δεδομένων της πλατφόρμας.
  
  Δομή:
    1. Χρήστες & Roles
    2. Es hop / Παραγγελίες
    3. Multi-Tenant (SaaS)
    4. CRM (Inbox, Pipeline, Tasks)
    5. Email Workspace
    6. Ιστορικό & Backups
  ═══════════════════════════════════════════════════════════════
*/

// ──────────────────────────────────────────────────────────────
// 1. ΧΡΗΣΤΕΣ & ΔΙΚΑΙΩΜΑΤΑ
// ──────────────────────────────────────────────────────────────

/** Επίπεδα πρόσβασης χρηστών (ανά tenant) */
export type UserRole = 'admin' | 'editor' | 'sales' | 'viewer';
/*  admin  = Πλήρης πρόσβαση σε όλα τα modules του tenant
 *  editor = Μόνο CMS modules (services, blog, pages)
 *  sales  = CRM, Pipeline, Tasks (όχι CMS edit)
 *  viewer = Μόνο ανάγνωση */

export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  timezone: string;
  locale: string;
  is_active: boolean;
  is_super_admin: boolean;
  tenant_id: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantFeatureEntry {
  id: string;
  tenant_id: string;
  feature: TenantFeature;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  sku: string;
  barcode: string;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  weight: number | null;
  category_id: string | null;
  image_url: string;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  date_of_birth: string | null;
  gender: string;
  membership_level: MembershipLevel;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_at: string | null;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  tags: string[];
  notes: string;
  is_active: boolean;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  tracking_number: string;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string;
  created_at: string;
}

export type MediaCategory = 'service' | 'blog' | 'product' | 'page' | 'about' | 'logo' | 'hero' | 'gallery' | 'seo' | 'avatar' | 'inline-content' | 'general';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export interface UploadOptions {
  tenantId: string;
  bucket?: string;
  folder?: string;
  category?: MediaCategory;
  source?: 'editor' | 'inline-content' | 'import';
  alt?: string;
  caption?: string;
  createdBy?: string | null;
}

export interface Media {
  id: string;
  name: string;
  original_name: string;
  url: string;
  public_id: string;
  path: string;
  storage_bucket: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  category: MediaCategory;
  source: string;
  tenant_id: string | null;
  metadata: Record<string, any>;
  alt_text: string;
  caption: string;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// AION BUSINESS CMS — Content Types
// ============================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  domain: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  og_image: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
  category: string;
  image_url: string;
  is_published: boolean;
  published_at: string | null;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  og_image: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  tenant_id: string | null;
  name: string;
  title: string;
  content: string;
  rating: number;
  avatar_url: string;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoreValue {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pageview {
  id: string;
  tenant_id: string;
  path: string;
  referrer: string;
  user_agent: string;
  ip_hash: string;
  created_at: string;
}

export interface DailyStat {
  id: string;
  tenant_id: string;
  date: string;
  pageviews: number;
  unique_visitors: number;
  top_pages: { path: string; count: number }[];
}

export interface SiteSetting {
  id: string;
  tenant_id: string | null;
  key: string;
  value: unknown;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type HistoryOperation = 'create' | 'update' | 'delete' | 'restore' | 'backup';

export type MessageDirection = 'incoming' | 'outgoing';
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';
export type ConversationStatus = 'active' | 'closed' | 'archived' | 'spam';
export type TenantStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type TenantFeature = 'cms' | 'crm' | 'inbox' | 'pipeline' | 'email_workspace' | 'eshop' | 'bookings';
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
export type DraftStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface Attachment {
  name: string;
  url: string;
  size: number;
  mime_type: string;
}

export interface EmailDraft {
  id: string;
  conversation_id: string | null;
  from_email: string;
  reply_to: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: Attachment[];
  status: DraftStatus;
  scheduled_at: string | null;
  updated_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: ConversationStatus;
  lead_stage: LeadStage;
  lead_value: number;
  won_at: string | null;
  last_message_at: string;
  assigned_to: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  conversation_id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  direction: MessageDirection;
  status: MessageStatus;
  parent_id: string | null;
  attachments: Attachment[];
  is_starred: boolean;
  last_message_at: string;
  created_at: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'imap';
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  last_sync_at: string | null;
  sync_enabled: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface FollowUpTask {
  id: string;
  conversation_id: string;
  title: string;
  completed: boolean;
  due_at: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ContentHistory {
  id: string;
  tenant_id: string | null;
  table_name: string;
  record_id: string | null;
  entity_name: string | null;
  operation: HistoryOperation;
  changed_fields: string[] | null;
  snapshot_before: any | null;
  snapshot_after: any | null;
  restored_from_history_id: string | null;
  metadata: Record<string, unknown> | null;
  summary: string | null;
  user_id: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface ContentBackup {
  id: string;
  tenant_id: string | null;
  name: string | null;
  snapshot: any | null;
  snapshot_version: number;
  size_bytes: number | null;
  user_id: string | null;
  created_at: string;
}
