/*
  ═══════════════════════════════════════════════════════════════
  AION CMS — Media Service (v0.2)
  
  Επίπεδο 2 της αρχιτεκτονικής Asset Management:
    storage.ts   → Επίπεδο 1: raw upload/download/delete
    media.ts     → Επίπεδο 2: CRUD + business logic
    CMS Editors  → Επίπεδο 3: calling uploadCmsAsset()
  
  Τα helpers εδώ είναι tenant-aware.
  ═══════════════════════════════════════════════════════════════
*/

import { supabase, isSupabaseAvailable } from './supabase';
import { uploadToStorage } from './storage';
import { withTenant } from './useTenantQuery';
import { trackEvent } from './analytics';
import type { Media, UploadOptions, MediaCategory } from '../types/supabase';
import { mockMedia } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ανέβασμα asset στο CMS pipeline:
 *   1. uploadToStorage() → Supabase Storage
 *   2. Insert record στον media πίνακα
 *   3. Telemetry event
 *   4. Return Media object
 */
export async function uploadCmsAsset(
  file: File,
  options: UploadOptions
): Promise<Media> {
  if (!isSupabaseAvailable()) {
    await delay(500);
    const newMedia: Media = {
      id: crypto.randomUUID(),
      name: file.name,
      original_name: file.name,
      url: URL.createObjectURL(file),
      public_id: '',
      path: '',
      storage_bucket: options.bucket || 'site-images',
      mime_type: file.type,
      size: file.size,
      width: null,
      height: null,
      folder: options.folder || options.category || 'general',
      category: options.category || 'general',
      source: options.source || 'editor',
      tenant_id: options.tenantId,
      metadata: {},
      alt_text: options.alt || '',
      caption: options.caption || '',
      tags: [],
      created_by: options.createdBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockMedia.push(newMedia);
    return newMedia;
  }

  // 1. Upload to Storage
  const { url, path } = await uploadToStorage(file, options.bucket || 'site-images', options.keepFormat);

  const mediaRecord = {
    name: file.name,
    original_name: file.name,
    url,
    path,
    storage_bucket: options.bucket || 'site-images',
    mime_type: file.type,
    size: file.size,
    folder: options.folder || options.category || 'general',
    category: options.category || 'general',
    source: options.source || 'editor',
    tenant_id: options.tenantId,
    metadata: {},
    alt_text: options.alt || '',
    caption: options.caption || '',
    created_by: options.createdBy || null,
  };

  // 2. Insert media record
  const { data, error } = await supabase
    .from('media')
    .insert(mediaRecord)
    .select()
    .single();

  if (error) throw error;

  // 3. Telemetry
  trackEvent('cms.media_uploaded', {
    file_size: file.size,
    file_type: file.type,
  }, {
    tenantId: options.tenantId,
  });

  return data as Media;
}

// ──────────────────────────────────────────────────────────────
// READ
// ──────────────────────────────────────────────────────────────

/** Επιστροφή όλων των media (tenant-aware) */
export async function getAllMedia(): Promise<Media[]> {
  if (!isSupabaseAvailable()) {
    await delay(300);
    return mockMedia;
  }
  const query = supabase.from('media').select('*');
  const secured = withTenant(query, 'media');
  const { data, error } = await secured.order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Media[]) ?? [];
}

/** Επιστροφή media ανά category */
export async function getMediaByCategory(category: MediaCategory): Promise<Media[]> {
  if (!isSupabaseAvailable()) {
    await delay(200);
    return mockMedia.filter(m => m.category === category);
  }
  const query = supabase.from('media').select('*').eq('category', category);
  const secured = withTenant(query, 'media');
  const { data, error } = await secured.order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Media[]) ?? [];
}

/** Επιστροφή media ανά source (editor / inline-content) */
export async function getMediaBySource(source: string): Promise<Media[]> {
  if (!isSupabaseAvailable()) {
    await delay(200);
    return mockMedia.filter(m => m.source === source);
  }
  const query = supabase.from('media').select('*').eq('source', source);
  const secured = withTenant(query, 'media');
  const { data, error } = await secured.order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Media[]) ?? [];
}

/** Επιστροφή single media record */
export async function getMediaById(id: string): Promise<Media | null> {
  if (!isSupabaseAvailable()) {
    await delay(200);
    return mockMedia.find(m => m.id === id) ?? null;
  }
  const { data } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
  return data as Media | null;
}

// ──────────────────────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────────────────────

export async function updateMedia(id: string, updates: Partial<Media>): Promise<Media> {
  if (!isSupabaseAvailable()) {
    await delay(300);
    const idx = mockMedia.findIndex(m => m.id === id);
    if (idx !== -1) {
      mockMedia[idx] = { ...mockMedia[idx], ...updates, updated_at: new Date().toISOString() };
    }
    return mockMedia[idx];
  }
  const { data, error } = await supabase
    .from('media')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Media;
}

// ──────────────────────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────────────────────

/**
 * Διαγραφή asset.
 * ΠΡΟΣΟΧΗ: Δεν κάνει usage detection — αυτό θα προστεθεί στο Sprint 2.9.
 */
export async function deleteMedia(id: string): Promise<void> {
  if (!isSupabaseAvailable()) {
    await delay(300);
    const idx = mockMedia.findIndex(m => m.id === id);
    if (idx !== -1) mockMedia.splice(idx, 1);
    return;
  }
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw error;
}
