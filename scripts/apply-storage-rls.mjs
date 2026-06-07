// Run: node scripts/apply-storage-rls.mjs
// Requires DATABASE_URL env var, or uses defaults below
import pg from 'pg';

const { Pool } = pg;

const SQL = `
-- Allow authenticated users to upload to blog-images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update blog images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images');

-- Allow public to view blog images
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'blog-images');

-- Same for site-images bucket
CREATE POLICY "Authenticated users can upload site images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can update site images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can delete site images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-images');

CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'site-images');

-- Same for testimonials bucket
CREATE POLICY "Authenticated users can upload testimonials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'testimonials');

CREATE POLICY "Authenticated users can update testimonials"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'testimonials');

CREATE POLICY "Authenticated users can delete testimonials"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'testimonials');

CREATE POLICY "Public can view testimonials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'testimonials');

-- Same for credentials bucket
CREATE POLICY "Authenticated users can upload credentials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'credentials');

CREATE POLICY "Authenticated users can update credentials"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'credentials');

CREATE POLICY "Authenticated users can delete credentials"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'credentials');

CREATE POLICY "Public can view credentials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'credentials');
`;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:%21%40%23Nikos1983%3F%40%23@db.qhbgptlklsavezxpksao.supabase.co:5432/postgres';

async function main() {
  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    await pool.query(SQL);
    console.log('OK: Storage RLS policies created successfully.');
  } catch (err) {
    console.error('Error creating policies:', err.message);
    if (err.message.includes('already exists')) {
      console.log('Policies may already exist — that is fine.');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
