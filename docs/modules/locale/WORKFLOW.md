# Locale Module — Bilingual Workflow

## Content Creation Flow

```
1. Create content in CMS (e.g., new Event)
   ↓
2. Fill GR fields first (title, description, includes)
   ↓
3. Set locale = 'el'
   ↓
4. Publish
   ↓
5. Switch to EN tab
   ↓
6. Fill EN fields (title_en, description_en, includes_en)
   ↓
7. Set locale = 'en'
   ↓
8. Publish
```

## Translation Import Flow

```
1. Export existing hardcoded translations from code (translations.ts)
   ↓
2. Format as JSON: { "hero.title": { "el": "...", "en": "..." } }
   ↓
3. Import via Translations Editor
   ↓
4. Verify in CMS list
   ↓
5. Public site reads from DB instead of hardcoded file
   ↓
6. Archive hardcoded translations.ts
```

## Public Site Integration

```typescript
// Read translations
const { data } = await supabase
  .from('locale_translations')
  .select('key, value_el, value_en')
  .eq('tenant_id', tenantId);

// Read content by locale
const { data } = await supabase
  .from('services')
  .select('*')
  .eq('tenant_id', tenantId)
  .eq('locale', currentLang);  // 'el' or 'en'
```

## Language Toggle (Public Site)

```typescript
const [lang, setLang] = useState<'el' | 'en'>(
  localStorage.getItem('locale') || 'el'
);

const toggleLang = (newLang: 'el' | 'en') => {
  setLang(newLang);
  localStorage.setItem('locale', newLang);
};
```
