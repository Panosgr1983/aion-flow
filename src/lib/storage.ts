import { supabase } from './supabase';

export async function uploadImage(file: File, bucket: string = 'blog-images'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const match = url.match(/\/([^/]+)$/);
  if (!match) return;
  const fileName = match[1];
  const bucketMatch = url.match(/object\/public\/([^/]+)\//);
  const bucket = bucketMatch?.[1] || 'blog-images';

  await supabase.storage.from(bucket).remove([fileName]);
}
