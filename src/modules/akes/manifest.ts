import ModuleRegistry from '../../lib/ModuleRegistry';
import AKESDashboard from './pages/AKESDashboard';

ModuleRegistry.register({
  name: 'akes',
  version: '1.0.0',
  label: 'AKES',
  description: 'AION Knowledge & Engineering System — platform health, MMI, tenant readiness',
  featureFlag: 'cms',
  routes: [
    { path: '/dashboard/akes', element: AKESDashboard, label: 'AKES Dashboard', sidebar: true, permission: 'platform.overview' },
  ],
  sidebar: {
    label: 'AKES',
    icon: 'BrainCircuit',
    permission: 'platform.overview',
    items: [
      { path: '/dashboard/akes', label: 'Dashboard', icon: 'LayoutDashboard' },
    ],
  },
  permissions: ['akes.view'],
  dbTables: [],
  migrations: [],
  dependencies: ['core'],
});
