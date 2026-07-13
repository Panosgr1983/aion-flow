# Media Module — Methods

**Proven patterns for media operations in AION Flow.**

---

## M1: Effective Tenant ID for Media

All media operations MUST use `effectiveTenantId`:

```typescript
// Upload (Level 2 — media.ts)
const media = await uploadCmsAsset(file, { tenantId: effectiveTenantId });

// Query (Level 2 — media.ts)
const { data } = await withTenant(supabase.from('media').select('*'), 'media');
```

**Status:** Standard ✅  
**Used by:** Portfolio, Retreat, CMS Core  
**Risk if missing:** Cross-tenant media visibility

---

## M2: Tenant-Prefixed Storage Paths

```typescript
const storagePath = `${options.tenantId}/${options.folder}/${file.name}`;
```

**Rule:** Always prefix with tenant ID. Never use bare filenames or shared folders.

**Status:** Standard ✅  
**Risk if missing:** File name collisions across tenants

---

## M3: Upload → DB → History → Telemetry Pipeline

```typescript
// 1. Upload to Storage
const { path } = await uploadToStorage(file, bucket, storagePath);

// 2. Insert DB record (with tenant_id)
const { data: media } = await supabase.from('media').insert({
  tenant_id: tenantId, name, url, folder, category, ...
});

// 3. Track event
trackEvent('media.upload', { tenantId, fileType: file.type });
```

**Status:** Standard ✅  
**Used by:** All CMS editors

---

## M4: Safe Delete (Storage + DB)

```typescript
// Always try to delete from BOTH storage and DB
try {
  await supabase.storage.from(bucket).remove([path]);
} catch { /* log but don't block DB delete */ }
await supabase.from('media').delete().eq('id', id);
```

**Status:** Standard ✅  
**Rationale:** Storage delete can fail (network, permissions) but DB record should still be removed.

---

## M5: Keep Format for Logos/Favicons

For `logo`, `logo_footer`, `favicon` — preserve original format (no auto PNG→JPEG conversion):

```typescript
if (options.category === 'logo' || options.category === 'favicon') {
  // Skip PNG→JPEG conversion — logos need transparency
}
```

**Status:** Standard ✅  
**Used by:** BrandingPanel

---

## M6: Rollback on Partial Upload Failure

If the upload pipeline fails mid-way:

```typescript
try {
  const path = await uploadToStorage(file, ...);
  const media = await insertMediaRecord(...);
  return media;
} catch (err) {
  // Cleanup: remove from storage if DB insert failed
  await supabase.storage.from(bucket).remove([path]);
  throw err;
}
```

**Status:** Experimental 🟡  
**Note:** Not yet implemented in all upload paths.

---

## M7: No Hardcoded Bucket or Tenant UUID

```typescript
// ❌ BAD — hardcoded
const bucket = 'site-images';
const path = `a6a0e182-.../experiences/file.jpg`;

// ✅ GOOD — dynamic
const bucket = options.bucket || 'site-images';
const path = `${effectiveTenantId}/${options.folder}/${file.name}`;
```

**Status:** Standard ✅  
**Used by:** media.ts (correct), some CMS panels need audit.
