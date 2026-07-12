import ModuleRegistry from '../../lib/ModuleRegistry';
import ExperiencesCRUD from './pages/ExperiencesCRUD';
import WorkshopsCRUD from './pages/WorkshopsCRUD';
import EventsCRUD from './pages/EventsCRUD';
import FAQCRUD from './pages/FAQCRUD';
import BookingsManager from './pages/BookingsManager';

ModuleRegistry.register({
  name: 'retreat',
  version: '0.1.0',
  label: 'Καταφύγιο',
  description: 'Διαχείριση καταφυγίου / wellness retreat',
  featureFlag: 'retreat_module',
  routes: [
    { path: '/dashboard/retreat/experiences', element: ExperiencesCRUD, label: 'Εμπειρίες', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/workshops', element: WorkshopsCRUD, label: 'Workshops', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/events', element: EventsCRUD, label: 'Εκδηλώσεις', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/faq', element: FAQCRUD, label: 'FAQ', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/bookings', element: BookingsManager, label: 'Κρατήσεις', sidebar: true, permission: 'retreat.bookings' },
  ],
  sidebar: {
    label: 'Καταφύγιο',
    icon: 'TreePine',
    permission: 'retreat.view',
    items: [
      { path: '/dashboard/retreat/experiences', label: 'Εμπειρίες', icon: 'Compass' },
      { path: '/dashboard/retreat/workshops', label: 'Workshops', icon: 'Users' },
      { path: '/dashboard/retreat/events', label: 'Εκδηλώσεις', icon: 'Calendar' },
      { path: '/dashboard/retreat/faq', label: 'FAQ', icon: 'HelpCircle' },
      { path: '/dashboard/retreat/bookings', label: 'Κρατήσεις', icon: 'CalendarCheck' },
    ],
  },
  permissions: ['retreat.view', 'retreat.edit', 'retreat.bookings'],
  dbTables: ['experiences', 'workshops', 'retreat_events', 'faq_entries', 'booking_submissions'],
  migrations: ['20260708000003_retreat_module.sql'],
  dependencies: ['core', 'media-engine'],
});
