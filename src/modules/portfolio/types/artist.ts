export type ArtistStatus = 'draft' | 'review' | 'published';

export interface Biographies {
  id: string;
  tenant_id: string;
  content: string;
  short_bio: string;
  birth_year: string;
  birth_place: string;
  pseudonyms: string[];
  featured_media_id: string | null;
  seo_title: string;
  seo_description: string;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilmographyEntry {
  id: string;
  tenant_id: string;
  title: string;
  title_en: string;
  year: number;
  role: string;
  genre: string;
  director: string;
  duration: string;
  description: string;
  featured_media_id: string | null;
  trailer_url: string;
  imdb_url: string;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelevisionEntry {
  id: string;
  tenant_id: string;
  title: string;
  year: number;
  channel: string;
  role: string;
  episode_title: string;
  description: string;
  featured_media_id: string | null;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TheatreEntry {
  id: string;
  tenant_id: string;
  title: string;
  year: number;
  venue: string;
  playwright: string;
  role: string;
  notes: string;
  featured_media_id: string | null;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerTimeline {
  id: string;
  tenant_id: string;
  year: number;
  month: number;
  title: string;
  title_en: string;
  description: string;
  category: string;
  icon: string;
  media_url: string;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  tenant_id: string;
  media_id: string | null;
  image_url: string;
  caption: string;
  alt_text: string;
  category: string;
  photographer: string;
  copyright: string;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PressItem {
  id: string;
  tenant_id: string;
  title: string;
  publication: string;
  date: string;
  url: string;
  excerpt: string;
  sort_order: number;
  status: ArtistStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Showreel {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  url: string;
  platform: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
