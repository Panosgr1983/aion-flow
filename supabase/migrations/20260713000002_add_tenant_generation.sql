/*
  ═══════════════════════════════════════════════════════════════
  AION FLOW — Phase 2.2: Add Tenant Generation

  This migration is purely additive. It introduces the generation
  concept to distinguish Legacy (Gen1) from Next-gen (Gen2) tenants.

  SAFETY:
  - DEFAULT 1 ensures ALL existing tenants are Legacy by default
  - CHECK constraint limits to valid values (1, 2)
  - Column is additive (ALTER TABLE ADD COLUMN) — no destructive change
  - Rollback: UPDATE tenants SET generation = 1 for specific tenants
  ═══════════════════════════════════════════════════════════════
*/

-- Step 1: Add the generation column with safe default
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS generation smallint NOT NULL DEFAULT 1;

-- Step 2: Add constraint to allow only valid generation values
ALTER TABLE tenants
  ADD CONSTRAINT tenants_generation_check
  CHECK (generation IN (1, 2));

-- Step 3: Explicitly set Kolokotronis to Gen1 (redundant due to DEFAULT, but explicit)
UPDATE tenants
SET generation = 1
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Step 4: Set Ktima Kareli as first Gen2 tenant
UPDATE tenants
SET generation = 2
WHERE id = 'a6a0e182-2e86-4b3a-9601-b055e56a605e'::uuid;

-- Step 5: Verify
-- All existing tenants should now have generation = 1 except KAR-001 which is 2
-- No tenant IDs, content, media, features, or storage paths were changed.
-- No tenant_features rows were added, modified, or deleted.
