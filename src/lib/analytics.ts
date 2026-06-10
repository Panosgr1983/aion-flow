import { supabase } from './supabase';

export type EventSource = 'dashboard' | 'public_site' | 'api' | 'worker' | 'system';

export type UsageEventMap = {
  'cms.login': { session_source?: string };
  'cms.logout': { session_duration_seconds?: number };
  'cms.page_updated': { page_slug: string; fields_changed: string[] };
  'cms.service_created': { service_title: string };
  'cms.service_updated': { service_title: string; fields_changed: string[] };
  'cms.service_deleted': { service_title: string };
  'cms.blog_created': { title: string };
  'cms.blog_updated': { title: string };
  'cms.blog_published': { title: string; word_count: number };
  'cms.media_uploaded': { file_size: number; file_type: string };
  'crm.lead_created': { source: string };
  'crm.lead_stage_changed': { from_stage: string; to_stage: string };
  'crm.message_sent': { channel: 'email' | 'form' | 'chat' };
  'crm.message_received': { channel: 'email' | 'form' | 'chat' };
  'crm.task_created': { due_date?: string };
  'crm.task_completed': { days_to_complete: number };
  'platform.backup_created': { size_mb: number; status: 'success' | 'failed' };
  'platform.user_created': { role: string };
  'platform.feature_enabled': { feature_name: string; enabled_by: 'admin' | 'user' };
};

export const EVENT_VERSIONS: Record<keyof UsageEventMap, number> = {
  'cms.login': 1,
  'cms.logout': 1,
  'cms.page_updated': 1,
  'cms.service_created': 1,
  'cms.service_updated': 1,
  'cms.service_deleted': 1,
  'cms.blog_created': 1,
  'cms.blog_updated': 1,
  'cms.blog_published': 1,
  'cms.media_uploaded': 1,
  'crm.lead_created': 1,
  'crm.lead_stage_changed': 1,
  'crm.message_sent': 1,
  'crm.message_received': 1,
  'crm.task_created': 1,
  'crm.task_completed': 1,
  'platform.backup_created': 1,
  'platform.user_created': 1,
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
