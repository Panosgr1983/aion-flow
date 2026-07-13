# Retreat Module — QA

## QA Checklist (per panel)

### Experiences CRUD
- [ ] CREATE: form saves correctly with all fields
- [ ] READ: existing data displays in list view
- [ ] UPDATE: changes persist after save
- [ ] DELETE: confirmation dialog, row removed
- [ ] Validation: title required
- [ ] MediaPicker: opens, selects, saves image
- [ ] RichEditor: loads and saves description
- [ ] Sort order: numeric field works
- [ ] Empty state: shown when no data
- [ ] Status badges: colored (green/yellow/gray)
- [ ] Tenant isolation: payload includes tenant_id
- [ ] History: content_history logged

### Workshops CRUD
- [ ] Same checklist as Experiences
- [ ] Group size field saves correctly

### Events CRUD (Bilingual)
- [ ] GR fields save correctly
- [ ] EN fields save correctly
- [ ] Date picker works
- [ ] Price field accepts decimal values
- [ ] Capacity field accepts integers
- [ ] Includes list (GR) saves
- [ ] Includes list (EN) saves independently

### FAQ CRUD
- [ ] Question saves
- [ ] Answer saves (RichEditor)
- [ ] Sort order works
- [ ] Status badge correct

### Bookings Manager
- [ ] Submissions list loads
- [ ] Status filter works
- [ ] Detail view shows all fields
- [ ] Status change persists
- [ ] Internal notes save
- [ ] Mark as read works
- [ ] Export CSV works

### Public Site
- [ ] Experiences display correctly
- [ ] Workshops display correctly
- [ ] Events display with GR/EN toggles
- [ ] FAQ accordions open/close
- [ ] Gallery grid responsive
- [ ] Lightbox opens/closes/navigates
- [ ] Booking form submits
- [ ] Booking form validates required fields
- [ ] Language toggle switches GR/EN
- [ ] SEO metadata per page
- [ ] Mobile responsive (320px+)
- [ ] No horizontal overflow

### Integration
- [ ] Kolokotronis tenant unaffected
- [ ] portfolio_module flag still works
- [ ] ModuleRegistry registers correctly
- [ ] Sidebar appears only for retreat_module=true
- [ ] Build: zero errors
