import { Navigate } from 'react-router-dom';
import { useTenant } from '../../lib/useTenant';

export default function PlatformGuard({ children }: { children: React.ReactNode }) {
  const tenant = useTenant();
  if (tenant.loading) return null;
  if (!tenant.isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
