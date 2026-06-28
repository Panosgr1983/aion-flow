/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Storage Helpers (Supabase Storage)
  
  Διαχείριση αρχείων:
    - uploadImage:  Ανέβασμα εικόνας (με auto-convert PNG→JPEG)
    - uploadFile:   Ανέβασμα οποιουδήποτε αρχείου (attachments)
    - deleteImage:  Διαγραφή από Storage
  
  Buckets:
    - blog-images:         Εικόνες για άρθρα blog
    - site-images:         Εικόνες για το site (hero, κλπ)
    - contact-attachments: Συνημμένα από Inbox/Email
  ═══════════════════════════════════════════════════════════════
*/

import { supabase } from './supabase';
import type { UploadResult } from '../types/supabase';

async function performUpload(file: File, bucket: string, fileName: string, keepFormat = false): Promise<string> {
  let uploadFile = file;
  let ext = fileName.split('.').pop() || 'jpg';

  if (!keepFormat) {
    const isPng = (file.type === 'image/png' || ext.toLowerCase() === 'png');
    if (isPng) {
      const blob = await pngToJpeg(file, 0.9);
      uploadFile = new File([blob], file.name.replace(/\.png$/i, '.jpg'), { type: 'image/jpeg' });
      ext = 'jpg';
    }
  } else {
    ext = file.name.split('.').pop() || ext;
  }

  const finalName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(finalName, uploadFile, { cacheControl: '3600', upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(finalName);

  return publicUrl;
}

export async function uploadImage(file: File, bucket: string = 'blog-images', keepFormat = false): Promise<string> {
  const fileName = `legacy-${Date.now()}`;
  const url = await performUpload(file, bucket, fileName, keepFormat);
  return url;
}

export async function uploadToStorage(file: File, bucket: string = 'site-images', keepFormat = false): Promise<UploadResult> {
  const url = await uploadImage(file, bucket, keepFormat);

  const urlParts = url.split('/');
  const filename = urlParts.pop() || '';
  const storagePath = `${bucket}/${filename}`;

  return { url, path: storagePath, filename };
}

async function pngToJpeg(file: File, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to decode PNG')); };
    img.src = url;
  });
}

export async function uploadFile(file: File, bucket: string = 'contact-attachments'): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
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
