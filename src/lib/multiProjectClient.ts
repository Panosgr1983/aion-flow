/*
  ═══════════════════════════════════════════════════════════════
  Multi-Project Support v0.1 — External Project Visibility
  
  Το AION Flow λειτουργεί ως control plane:
    - Βλέπει metadata external tenants
    - Κάνει connection check (read-only)
    - ΔΕΝ επεμβαίνει στο CMS editing
  
  Προς το παρόν: read-only visibility.
  v0.2 = External CMS Read (project-aware adapters)
  v0.3 = External CMS Write
  
  TODO:
    - Encrypted credentials / vault (όχι plaintext στο tenants.settings)
    - Service_role access μόνο από server-side (API routes / Edge Functions)
  ═══════════════════════════════════════════════════════════════
*/

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as sharedClient } from './supabase';

interface ProjectConfig {
  supabase_project_url: string;
  supabase_anon_key: string;
}

const projectClientCache = new Map<string, SupabaseClient>();
const projectConfigCache = new Map<string, ProjectConfig>();

let currentProjectClient: SupabaseClient | null = null;

/**
 * ⚠️ Frontend-safe: φέρνει μόνο anon_key (όχι service_key).
 * Το service_key αποθηκεύεται στο DB για server-side χρήση αλλά
 * ΔΕΝ επιλέγεται ποτέ από client code.
 */
async function fetchProjectConfig(tenantId: string): Promise<ProjectConfig | null> {
  if (projectConfigCache.has(tenantId)) {
    return projectConfigCache.get(tenantId)!;
  }
  const { data } = await sharedClient
    .from('tenants')
    .select('supabase_project_url, supabase_anon_key')
    .eq('id', tenantId)
    .eq('external_project_enabled', true)
    .maybeSingle();
  if (data?.supabase_project_url && data?.supabase_anon_key) {
    projectConfigCache.set(tenantId, data as ProjectConfig);
    return data as ProjectConfig;
  }
  return null;
}

/**
 * Get or create a Supabase client for a tenant's external project.
 * Returns null if the tenant has no external project.
 */
export async function getProjectClient(tenantId: string): Promise<SupabaseClient | null> {
  if (projectClientCache.has(tenantId)) {
    return projectClientCache.get(tenantId)!;
  }
  const config = await fetchProjectConfig(tenantId);
  if (!config) return null;
  const client = createClient(config.supabase_project_url, config.supabase_anon_key);
  projectClientCache.set(tenantId, client);
  return client;
}

/**
 * Switch the current project context to a specific tenant.
 * Call with null to reset to the shared client.
 */
export async function switchToProject(tenantId: string | null): Promise<void> {
  if (!tenantId) {
    currentProjectClient = null;
    return;
  }
  const client = await getProjectClient(tenantId);
  currentProjectClient = client;
}

/**
 * Get the current content client — returns the tenant's project client
 * if switched, or the shared client as fallback.
 */
export function getCurrentContentClient(): SupabaseClient {
  return currentProjectClient || sharedClient;
}

/**
 * Check project connectivity by performing a simple query.
 * Uses anon_key only — safe for frontend.
 */
export async function checkProjectConnection(tenantId: string): Promise<{ ok: boolean; latency: number; error?: string }> {
  const client = await getProjectClient(tenantId);
  if (!client) return { ok: false, latency: 0, error: 'No external project configured' };
  const start = performance.now();
  try {
    const { error } = await client.from('tenants').select('id').limit(1).maybeSingle();
    const latency = Math.round(performance.now() - start);
    if (error) return { ok: false, latency, error: error.message };
    return { ok: true, latency };
  } catch (e: any) {
    return { ok: false, latency: Math.round(performance.now() - start), error: e.message };
  }
}

/**
 * Clear all cached project clients (e.g. on logout).
 */
export function clearProjectCache(): void {
  projectClientCache.clear();
  projectConfigCache.clear();
  currentProjectClient = null;
}
