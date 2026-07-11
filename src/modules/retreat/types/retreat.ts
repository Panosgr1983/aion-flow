export interface Experience {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  includes: string[];
  image_url: string;
  sort_order: number;
  status: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Workshop {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  duration: string;
  group_size: string;
  includes: string[];
  image_url: string;
  sort_order: number;
  status: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface RetreatEvent {
  id: string;
  tenant_id: string;
  title: string;
  title_en: string;
  date: string;
  organizer: string;
  capacity: number;
  price: number;
  description: string;
  description_en: string;
  includes: string[];
  includes_en: string[];
  image_url: string;
  sort_order: number;
  status: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface FaqEntry {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  sort_order: number;
  status: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface BookingSubmission {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  arrival_date: string;
  departure_date: string;
  message: string;
  status: string;
  notes: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}
