/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Usage Telemetry (MT-2)
  
  Σύστημα καταγραφής γεγονότων χρήσης (events) για:
    - Μέτρηση ενεργών χρηστών (Active Days)
    - Ανίχνευση churn (Churn Risk)
    - Feature adoption metrics
    - Business intelligence (αργότερα)
  
  Κεντρική αρχή: trackEvent() ΠΟΤΕ δεν πετάει exception.
  Αν αποτύχει, το σφάλμα καταγράφεται στο console μόνο.
  
  Τύποι events:
    cms.*        → Ενέργειες CMS (login, page_updated, blog_published)
    crm.*        → Ενέργειες CRM (lead_created, message_sent)
    platform.*   → Ενέργειες συστήματος (backup_created, user_created)
  ═══════════════════════════════════════════════════════════════
*/

import { supabase } from './supabase';

/** Προέλευση του event (για filtering στο dashboard) */
export type EventSource = 'dashboard' | 'public_site' | 'api' | 'worker' | 'system';

/**
 * Χάρτης όλων των events με strict typing για τα metadata.
 * 
 * Διαχωρισμός:
 * - CMS: διαχείριση περιεχομένου (σελίδες, υπηρεσίες, blog, media)
 * - CRM: επικοινωνίες και πωλήσεις (leads, μηνύματα, tasks)
 * - Platform: λειτουργίες συστήματος (backups, χρήστες)
 */
export type UsageEventMap = {
  /* ═══ CMS ═══ */
  'cms.login': { session_source?: string };                          // Είσοδος χρήστη
  'cms.logout': { session_duration_seconds?: number };               // Αποσύνδεση
  'cms.page_created': { page_slug: string };
  'cms.page_updated': { page_slug: string; fields_changed: string[] };
  'cms.page_deleted': { page_slug: string };
  'cms.service_created': { service_title: string };
  'cms.service_updated': { service_title: string; fields_changed: string[] };
  'cms.service_deleted': { service_title: string };
  'cms.blog_created': { title: string };
  'cms.blog_updated': { title: string };
  'cms.blog_deleted': { title: string };
  'cms.blog_published': { title: string; word_count: number };       // Δημοσίευση άρθρου
  'cms.product_created': { name: string; category: string };
  'cms.product_updated': { name: string; fields_changed: string[] };
  'cms.product_deleted': { name: string };
  'cms.media_uploaded': { file_size: number; file_type: string };
  'cms.media_deleted': { count: number };
  'cms.media_replaced': { file_size: number; file_type: string };

  /* ═══ CRM ═══ */
  'crm.lead_created': { source: string; name: string };               // Νέο lead από φόρμα/booking
  'crm.lead_updated': { lead_id: string; fields_changed: string[] };
  'crm.lead_stage_changed': { from_stage: string; to_stage: string }; // Μετακίνηση σε pipeline
  'crm.message_sent': { channel: 'email' | 'form' | 'chat' };        // Αποστολή απάντησης
  'crm.message_received': { channel: 'email' | 'form' | 'chat' };    // Λήψη μηνύματος
  'crm.task_created': { due_date?: string };
  'crm.task_completed': { days_to_complete: number };

  /* ═══ PLATFORM ═══ */
  'platform.backup_created': { size_mb: number; status: 'success' | 'failed' };
  'platform.user_created': { role: string };
  'platform.user_invited': { email: string; role: string };
  'platform.feature_enabled': { feature_name: string; enabled_by: 'admin' | 'user' };
};

export const EVENT_VERSIONS: Record<keyof UsageEventMap, number> = {
  'cms.login': 1,
  'cms.logout': 1,
  'cms.page_created': 1,
  'cms.page_updated': 1,
  'cms.page_deleted': 1,
  'cms.service_created': 1,
  'cms.service_updated': 1,
  'cms.service_deleted': 1,
  'cms.blog_created': 1,
  'cms.blog_updated': 1,
  'cms.blog_deleted': 1,
  'cms.blog_published': 1,
  'cms.product_created': 1,
  'cms.product_updated': 1,
  'cms.product_deleted': 1,
  'cms.media_uploaded': 1,
  'cms.media_deleted': 1,
  'cms.media_replaced': 1,
  'crm.lead_created': 1,
  'crm.lead_updated': 1,
  'crm.lead_stage_changed': 1,
  'crm.message_sent': 1,
  'crm.message_received': 1,
  'crm.task_created': 1,
  'crm.task_completed': 1,
  'platform.backup_created': 1,
  'platform.user_created': 1,
  'platform.user_invited': 1,
  'platform.feature_enabled': 1,
};

export interface TrackEventOptions {
  userId?: string;
  sessionId?: string;
  tenantId?: string;
  source?: EventSource;
  entityType?: string;
  entityId?: string;
}

async function sendEvent(payload: Record<string, unknown>): Promise<void> {
  try {
    const { error } = await supabase.from('usage_events').insert(payload);
    if (error) console.error('[AION Telemetry] insert error:', error.message);
  } catch (err) {
    console.error('[AION Telemetry] silent fail:', err);
  }
}

export async function trackEvent<T extends keyof UsageEventMap>(
  eventName: T,
  metadata: UsageEventMap[T],
  options?: TrackEventOptions,
): Promise<void> {
  await sendEvent({
    tenant_id: options?.tenantId ?? null,
    user_id: options?.userId ?? null,
    session_id: options?.sessionId ?? null,
    event_name: eventName,
    event_version: EVENT_VERSIONS[eventName],
    entity_type: options?.entityType ?? null,
    entity_id: options?.entityId ?? null,
    metadata,
    source: options?.source ?? 'dashboard',
  });
}

export function createSessionId(): string {
  return crypto.randomUUID();
}
