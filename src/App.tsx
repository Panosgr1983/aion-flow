import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './lib/TenantContext';
import LandingPage from './pages/LandingPage';
import LandingPageNew from './pages/LandingPageNew';
import LandingPageNewV2 from './pages/LandingPageNewV2';
import LandingPageNewV3 from './pages/LandingPageNewV3';
import LandingPageNewV4 from './pages/LandingPageNewV4';
import LandingPageNewV5 from './pages/LandingPageNewV5';
import LandingPageNewV6 from './pages/LandingPageNewV6';
import LandingPageNewDeathstar from './pages/LandingPageNewDeathstar';
import LandingPageNewSales from './pages/LandingPageNewSales';
import VersionsList from './pages/VersionsList';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Φόρτωση...</span>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPageNewDeathstar />} />
      <Route path="/original" element={<LandingPage />} />
      <Route path="/new" element={<LandingPageNew />} />
      <Route path="/new-v2" element={<LandingPageNewV2 />} />
      <Route path="/new-v3" element={<LandingPageNewV3 />} />
      <Route path="/new-v4" element={<LandingPageNewV4 />} />
      <Route path="/new-v5" element={<LandingPageNewV5 />} />
      <Route path="/new-v6" element={<LandingPageNewV6 />} />
      <Route path="/new-version-deathstar" element={<LandingPageNewDeathstar />} />
      <Route path="/new-sales" element={<LandingPageNewSales />} />
      <Route path="/versions" element={<VersionsList />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <AppRoutes />
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
