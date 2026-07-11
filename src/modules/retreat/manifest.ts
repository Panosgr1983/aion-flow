import ModuleRegistry from '../../lib/ModuleRegistry';
import ExperiencesCRUD from './pages/ExperiencesCRUD';

ModuleRegistry.register({
  name: 'retreat',
  version: '0.1.0',
  label: 'Καταφύγιο',
  description: 'Διαχείριση καταφυγίου / wellness retreat',
  featureFlag: 'retreat_module',
  routes: [
    { path: '/dashboard/retreat/experiences', element: ExperiencesCRUD, label: 'Εμπειρίες', sidebar: true, permission: 'retreat.edit' },
  ],
  sidebar: {
    label: 'Καταφύγιο',
    icon: 'TreePine',
    permission: 'retreat.view',
    items: [
      { path: '/dashboard/retreat/experiences', label: 'Εμπειρίες', icon: 'Compass' },
    ],
  },
  permissions: ['retreat.view', 'retreat.edit', 'retreat.bookings'],
  dbTables: ['experiences', 'workshops', 'retreat_events', 'faq_entries', 'booking_submissions'],
  migrations: ['20260708000003_retreat_module.sql'],
  dependencies: ['core', 'media-engine'],
});
