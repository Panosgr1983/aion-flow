import { supabase, isSupabaseAvailable } from './supabase';

interface CoreEntity {
  id: string;
  tenant_id: string;
  entity_type: string;
  data: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

interface CoreEntityVersion {
  id: string;
  entity_id: string;
  version: number;
  data: Record<string, any>;
  created_at: string;
}

const mockCoreEntities: CoreEntity[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const coreEntitiesHelper = {
  async getByType(tenantId: string, entityType: string): Promise<CoreEntity | null> {
    if (!isSupabaseAvailable()) {
      await delay(200);
      return mockCoreEntities.find(e => e.tenant_id === tenantId && e.entity_type === entityType) ?? null;
    }
    const { data, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .maybeSingle();
    if (error) throw error;
    return data as CoreEntity | null;
  },

  async upsert(tenantId: string, entityType: string, newData: Record<string, any>): Promise<CoreEntity> {
    if (!isSupabaseAvailable()) {
      await delay(300);
      const existing = mockCoreEntities.find(e => e.tenant_id === tenantId && e.entity_type === entityType);
      if (existing) {
        existing.data = newData;
        existing.version += 1;
        existing.updated_at = new Date().toISOString();
        return { ...existing };
      }
      const created: CoreEntity = {
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        entity_type: entityType,
        data: newData,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockCoreEntities.push(created);
      return { ...created };
    }

    const existing = await this.getByType(tenantId, entityType);
    if (existing) {
      const { error: histError } = await supabase.from('core_entity_versions').insert({
        entity_id: existing.id,
        version: existing.version,
        data: existing.data,
      });
      if (histError) throw histError;

      const { data, error } = await supabase
        .from('core_entities')
        .update({ data: newData, version: existing.version + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as CoreEntity;
    }

    const { data, error } = await supabase
      .from('core_entities')
      .insert({
        tenant_id: tenantId,
        entity_type: entityType,
        data: newData,
        version: 1,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CoreEntity;
  },

  async getHistory(entityId: string): Promise<CoreEntityVersion[]> {
    if (!isSupabaseAvailable()) {
      await delay(200);
      return [];
    }
    const { data, error } = await supabase
      .from('core_entity_versions')
      .select('*')
      .eq('entity_id', entityId)
      .order('version', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CoreEntityVersion[];
  },
};
