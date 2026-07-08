import { supabase } from '../../../lib/supabase';
import { withTenant } from '../../../lib/useTenantQuery';
import type {
  Biographies, FilmographyEntry, TelevisionEntry, TheatreEntry,
  CareerTimeline, GalleryItem, PressItem, Showreel
} from '../types/artist';

async function getAll<T>(table: string, tenantId: string, order?: string): Promise<T[]> {
  const q = withTenant(supabase.from(table).select('*'), tenantId);
  if (order) q.order(order, { ascending: false });
  const { data } = await q;
  return (data || []) as T[];
}

async function getById<T>(table: string, id: string, tenantId: string): Promise<T | null> {
  const { data } = await withTenant(supabase.from(table).select('*').eq('id', id), tenantId).maybeSingle();
  return data as T | null;
}

export const biographiesHelper = {
  getAll: (t: string) => getAll<Biographies>('biographies', t, 'created_at'),
  getById: (id: string, t: string) => getById<Biographies>('biographies', id, t),
};

export const filmographyHelper = {
  getAll: (t: string) => getAll<FilmographyEntry>('filmography_entries', t, 'year'),
  getById: (id: string, t: string) => getById<FilmographyEntry>('filmography_entries', id, t),
};

export const televisionHelper = {
  getAll: (t: string) => getAll<TelevisionEntry>('television_entries', t, 'year'),
  getById: (id: string, t: string) => getById<TelevisionEntry>('television_entries', id, t),
};

export const theatreHelper = {
  getAll: (t: string) => getAll<TheatreEntry>('theatre_entries', t, 'year'),
  getById: (id: string, t: string) => getById<TheatreEntry>('theatre_entries', id, t),
};

export const timelineHelper = {
  getAll: (t: string) => getAll<CareerTimeline>('career_timelines', t, 'sort_order'),
  getById: (id: string, t: string) => getById<CareerTimeline>('career_timelines', id, t),
};

export const galleryHelper = {
  getAll: (t: string) => getAll<GalleryItem>('gallery_items', t, 'sort_order'),
  getById: (id: string, t: string) => getById<GalleryItem>('gallery_items', id, t),
};

export const pressHelper = {
  getAll: (t: string) => getAll<PressItem>('press_items', t, 'sort_order'),
  getById: (id: string, t: string) => getById<PressItem>('press_items', id, t),
};

export const showreelHelper = {
  getAll: (t: string) => getAll<Showreel>('showreels', t, 'sort_order'),
  getById: (id: string, t: string) => getById<Showreel>('showreels', id, t),
};
