/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Portfolio Module manifest
   
  Εγγραφή του Portfolio Module στο ModuleRegistry.
   
  Υποστηρίζει professional types:
    actor, musician, painter, writer, photographer,
    director, dancer, designer, other
   
  v0.1: Actor-specific tables (filmography, television, theatre)
  v0.2: Generic portfolio schema (portfolio_profiles, portfolio_entries)
  ═══════════════════════════════════════════════════════════════
*/

import ModuleRegistry from '../../lib/ModuleRegistry';
import BiographyPanel from './pages/BiographyPanel';
import FilmographyPanel from './pages/FilmographyPanel';
import TelevisionPanel from './pages/TelevisionPanel';
import TheatrePanel from './pages/TheatrePanel';
import TimelinePanel from './pages/TimelinePanel';
import GalleryPanel from './pages/GalleryPanel';
import PressPanel from './pages/PressPanel';
import ShowreelPanel from './pages/ShowreelPanel';

ModuleRegistry.register({
  name: 'portfolio',
  version: '0.1.0',
  label: 'Χαρτοφυλάκιο',
  description: 'Διαχείριση ψηφιακού χαρτοφυλακίου για δημιουργικά επαγγέλματα',
  featureFlag: 'portfolio_module',
  routes: [
    { path: '/dashboard/portfolio', element: BiographyPanel, label: 'Βιογραφικό', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/bio', element: BiographyPanel, label: 'Βιογραφικό', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/films', element: FilmographyPanel, label: 'Ταινίες', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/tv', element: TelevisionPanel, label: 'Τηλεόραση', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/theatre', element: TheatrePanel, label: 'Θέατρο', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/timeline', element: TimelinePanel, label: 'Χρονολόγιο', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/gallery', element: GalleryPanel, label: 'Gallery', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/press', element: PressPanel, label: 'Press', sidebar: true, permission: 'portfolio.view' },
    { path: '/dashboard/portfolio/showreels', element: ShowreelPanel, label: 'Showreels', sidebar: true, permission: 'portfolio.view' },
  ],
  sidebar: {
    label: 'Χαρτοφυλάκιο',
    icon: 'Briefcase',
    permission: 'portfolio.view',
    items: [
      { path: '/dashboard/portfolio', label: 'Βιογραφικό', icon: 'User', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/films', label: 'Ταινίες', icon: 'Film', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/tv', label: 'Τηλεόραση', icon: 'Monitor', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/theatre', label: 'Θέατρο', icon: 'Theater', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/timeline', label: 'Χρονολόγιο', icon: 'Clock', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/gallery', label: 'Gallery', icon: 'Images', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/press', label: 'Press', icon: 'Newspaper', permission: 'portfolio.view' },
      { path: '/dashboard/portfolio/showreels', label: 'Showreels', icon: 'Video', permission: 'portfolio.view' },
    ],
  },
  permissions: ['portfolio.view', 'portfolio.edit'],
  dbTables: [
    'biographies', 'filmography_entries', 'television_entries',
    'theatre_entries', 'career_timelines', 'gallery_items',
    'press_items', 'showreels',
  ],
  migrations: ['20260708000002_artist_module.sql'],
  dependencies: ['core', 'media-engine'],
});
