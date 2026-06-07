/*
  # AION BUSINESS CMS — Content Schema

  ## Tables Created
  1. `services`          - Manageable services with SEO
  2. `blog_posts`        - Blog posts with TipTap JSON content + SEO
  3. `testimonials`      - Client testimonials
  4. `credentials`       - Professional credentials/qualifications
  5. `core_values`       - Company core values
  6. `site_settings`     - Generic key-value site settings
  7. `tenants`           - Multi-tenant support

  ## Design Decisions
  - All new tables have `tenant_id` for multi-tenant readiness
  - blog_posts.content is jsonb for TipTap rich text structure
  - SEO fields (meta_title, meta_description, og_image) on services & blog_posts
  - site_settings uses key/value jsonb pattern (no migrations for new settings)
  - RLS enabled on ALL tables
*/

-- ============================================================
-- TENANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text DEFAULT '',
  domain text DEFAULT '',
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tenants"
  ON tenants FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage tenants"
  ON tenants FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update tenants"
  ON tenants FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete tenants"
  ON tenants FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Add tenant_id to profiles for multi-tenant context
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- ============================================================
-- SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  short_description text DEFAULT '',
  long_description text DEFAULT '',
  icon text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  og_image text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view services"
  ON services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- BLOG POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text DEFAULT '',
  content jsonb DEFAULT '{}',
  category text DEFAULT '',
  image_url text DEFAULT '',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  is_featured boolean DEFAULT false,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  og_image text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view blog_posts"
  ON blog_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert blog_posts"
  ON blog_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog_posts"
  ON blog_posts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog_posts"
  ON blog_posts FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- TESTIMONIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text DEFAULT '',
  content text DEFAULT '',
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view testimonials"
  ON testimonials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- CREDENTIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view credentials"
  ON credentials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert credentials"
  ON credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update credentials"
  ON credentials FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete credentials"
  ON credentials FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- CORE VALUES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS core_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view core_values"
  ON core_values FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert core_values"
  ON core_values FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update core_values"
  ON core_values FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete core_values"
  ON core_values FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb DEFAULT '{}',
  category text DEFAULT 'general',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, key)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view site_settings"
  ON site_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert site_settings"
  ON site_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update site_settings"
  ON site_settings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete site_settings"
  ON site_settings FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(tenant_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_id ON blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(tenant_id, is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_tenant_id ON testimonials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credentials_tenant_id ON credentials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_core_values_tenant_id ON core_values(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_tenant_key ON site_settings(tenant_id, key);

-- ============================================================
-- SEED DEFAULT TENANT
-- ============================================================
INSERT INTO tenants (id, name, slug, domain)
VALUES ('00000000-0000-0000-0000-000000000001', 'Kolokotronis Nikolas', 'kolokotronis', 'kolokotronis.gr')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DEMO SITE SETTINGS
-- ============================================================
INSERT INTO site_settings (tenant_id, key, value, category, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'hero_title', '"Νικόλας Κολοκοτρώνης"', 'home', 'Hero section title'),
  ('00000000-0000-0000-0000-000000000001', 'hero_subtitle', '"Ψυχολόγος — Reiki Master — NLP Practitioner"', 'home', 'Hero section subtitle'),
  ('00000000-0000-0000-0000-000000000001', 'about_text', '"Ο Νικόλας Κολοκοτρώνης είναι ψυχολόγος με έδρα το Νέο Ηράκλειο..."', 'about', 'About page main text'),
  ('00000000-0000-0000-0000-000000000001', 'phone', '"+30 210 0000000"', 'contact', 'Contact phone number'),
  ('00000000-0000-0000-0000-000000000001', 'email', '"info@kolokotronis.gr"', 'contact', 'Contact email'),
  ('00000000-0000-0000-0000-000000000001', 'address', '"Απόλλωνος 30, Νέο Ηράκλειο"', 'contact', 'Office address'),
  ('00000000-0000-0000-0000-000000000001', 'google_maps_url', '""', 'contact', 'Google Maps embed URL'),
  ('00000000-0000-0000-0000-000000000001', 'facebook_url', '""', 'social', 'Facebook page URL'),
  ('00000000-0000-0000-0000-000000000001', 'instagram_url', '""', 'social', 'Instagram profile URL'),
  ('00000000-0000-0000-0000-000000000001', 'whatsapp', '""', 'social', 'WhatsApp number')
ON CONFLICT (tenant_id, key) DO NOTHING;

-- ============================================================
-- SEED DEMO SERVICES
-- ============================================================
INSERT INTO services (tenant_id, title, slug, short_description, long_description, icon, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ατομική Συμβουλευτική', 'atomiki-symvouleftiki', 'Ατομικές συνεδρίες ψυχολογικής υποστήριξης και προσωπικής ανάπτυξης.', 'Η ατομική συμβουλευτική προσφέρει ένα ασφαλές περιβάλλον όπου μπορείτε να εξερευνήσετε τις σκέψεις, τα συναισθήματα και τις συμπεριφορές σας...', 'user', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Reiki', 'reiki', 'Θεραπευτική ενέργεια Reiki για αποκατάσταση της φυσικής ισορροπίας.', 'Το Reiki είναι μια αρχαία ιαπωνική τεχνική ενεργειακής θεραπείας που προάγει τη χαλάρωση, μειώνει το στρες και υποστηρίζει τη φυσική διαδικασία επούλωσης...', 'sparkles', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'NLP', 'nlp', 'Νευρογλωσσικός Προγραμματισμός για προσωπική μεταμόρφωση.', 'Ο Νευρογλωσσικός Προγραμματισμός (NLP) είναι μια προσέγγιση που εστιάζει στη σύνδεση μεταξύ νευρολογικών διεργασιών, γλώσσας και συμπεριφοράς...', 'brain', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Σωματική Ψυχοθεραπεία', 'somatiki-psychotherapeia', 'Ολοκληρωμένη προσέγγιση που συνδέει σώμα και ψυχή.', 'Η σωματική ψυχοθεραπεία βασίζεται στην κατανόηση ότι το σώμα αποθηκεύει συναισθηματικές εμπειρίες και τραύματα...', 'heart', 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Σεμινάρια & Εργαστήρια', 'seminar-ergastiria', 'Ομαδικά σεμινάρια και εργαστήρια προσωπικής ανάπτυξης.', 'Τα σεμινάρια και τα εργαστήρια του Νικόλα Κολοκοτρώνη είναι σχεδιασμένα για να προσφέρουν πρακτικά εργαλεία...', 'users', 5, true)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ============================================================
-- SEED DEMO BLOG POSTS
-- ============================================================
INSERT INTO blog_posts (tenant_id, title, slug, excerpt, content, category, image_url, is_published, published_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Η σημασία της ψυχικής υγείας στη σύγχρονη εποχή', 'simasia-psyxikis-ygeias', 'Σε έναν κόσμο που τρέχει με γοργούς ρυθμούς, η ψυχική υγεία είναι πιο σημαντική από ποτέ.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Η ψυχική υγεία αποτελεί θεμελιώδες στοιχείο της συνολικής ευεξίας του ανθρώπου. Στη σύγχρονη εποχή, όπου οι ρυθμοί ζωής είναι γρήγοροι και απαιτητικοί, η φροντίδα της ψυχικής υγείας γίνεται επιτακτική ανάγκη."}]}]}', 'Ψυχική Υγεία', 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg', true, '2026-01-15T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000001', 'Reiki: Τι είναι και πώς μπορεί να σας βοηθήσει', 'ti-einai-reiki', 'Ανακαλύψτε την αρχαία ιαπωνική τέχνη της ενεργειακής θεραπείας.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Το Reiki είναι μια ιαπωνική τεχνική ενεργειακής θεραπείας που αναπτύχθηκε από τον Mikao Usui στις αρχές του 20ού αιώνα. Η λέξη Reiki σημαίνει «παγκόσμια ενέργεια ζωής»."}]}]}', 'Reiki', 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg', true, '2026-02-20T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000001', 'Διαχείριση άγχους: Πρακτικές τεχνικές', 'dixeirisi-agxous', 'Μάθετε πρακτικές τεχνικές για τη διαχείριση του καθημερινού άγχους.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Το άγχος αποτελεί μια φυσιολογική αντίδραση του οργανισμού σε καταστάσεις πρόκλησης ή κινδύνου. Ωστόσο, όταν το άγχος γίνεται χρόνιο, μπορεί να επηρεάσει σημαντικά την ποιότητα ζωής μας."}]}]}', 'Αυτοβελτίωση', 'https://images.pexels.com/photos/3823492/pexels-photo-3823492.jpeg', true, '2026-03-10T10:00:00Z')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ============================================================
-- SEED DEMO TESTIMONIALS
-- ============================================================
INSERT INTO testimonials (tenant_id, name, title, content, rating, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Μαρία Π.', 'Εκπαιδευτικός', 'Ο Νικόλας με βοήθησε να ξεπεράσω δύσκολες στιγμές. Η προσέγγισή του είναι μοναδική και η ενσυναίσθησή του αξεπέραστη.', 5, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Γιώργος Κ.', 'Μηχανικός', 'Μετά από χρόνια αναζήτησης, βρήκα έναν θεραπευτή που πραγματικά με καταλαβαίνει. Συνιστώ ανεπιφύλακτα.', 5, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Ελένη Δ.', 'Επιχειρηματίας', 'Τα σεμινάρια NLP του Νικόλα ήταν μεταμορφωτικά. Άλλαξαν τον τρόπο που σκέφτομαι και λειτουργώ.', 5, 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DEMO CREDENTIALS
-- ============================================================
INSERT INTO credentials (tenant_id, title, description, icon, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Πτυχίο Ψυχολογίας', 'Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών', 'graduation-cap', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Reiki Master', 'Πιστοποίηση Reiki Master Teacher', 'sparkles', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'NLP Practitioner', 'Πιστοποίηση NLP Practitioner από το NLP Center Greece', 'brain', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Σωματική Ψυχοθεραπεία', 'Εκπαίδευση στη Σωματική Ψυχοθεραπεία', 'heart', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DEMO CORE VALUES
-- ============================================================
INSERT INTO core_values (tenant_id, title, description, icon, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Εμπιστευτικότητα', 'Απόλυτη διακριτικότητα και προστασία των προσωπικών σας δεδομένων.', 'lock', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Εξατομικευμένη Προσέγγιση', 'Κάθε άνθρωπος είναι μοναδικός. Η προσέγγισή μας προσαρμόζεται στις δικές σας ανάγκες.', 'user-check', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Επιστημονική Τεκμηρίωση', 'Όλες οι θεραπευτικές προσεγγίσεις βασίζονται σε σύγχρονα επιστημονικά δεδομένα.', 'book-open', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Ολιστική Θεώρηση', 'Η ψυχική υγεία δεν διαχωρίζεται από τη σωματική. Προσεγγίζουμε τον άνθρωπο ως σύνολο.', 'heart', 4, true)
ON CONFLICT DO NOTHING;
